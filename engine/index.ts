import { createClient } from "redis";
import type { Trade } from "./types";
const redisClient = createClient();

const client = redisClient.duplicate();
await client.connect();

const publisher = redisClient.duplicate();
await publisher.connect()

const latestPrice = new Map<string, {ask:number, bid:number, decimal:number}>()
const userBalance = new Map<string,number>() //userId and balance
const openOrders = new Map<string, any[]>(); //userId as key and orders as array of object

const DECIMAL_VALUE=10000;

const liquidateTrade = (priceUpdate:any)=>{
    for(const [userId, orders] of openOrders){
        for(const order of orders){
            if(order.leverage > 1 && order.type ==="buy"){
                if(priceUpdate.askWithSpread < order.openPrice){
                    const changePercentage = ((order.openPrice - priceUpdate.askWithSpread )/order.openPrice)*100;
                    // console.log("change percent", changePercentage)
                    // console.log("leverage percent:",90/order.leverage );
                    if(changePercentage > 90/order.leverage){
                        // console.log("trying to close order");
                        closeOrder({userId, orderId:order.orderId})
                    }
                }
            }
        }
    }
}

const closeOrder = async({userId, orderId}:{userId:string, orderId:string})=>{
    if(openOrders.has(userId)){
        const userOrders = openOrders.get(userId)!;
        const orderIndex = userOrders?.findIndex(element=>element.orderId === orderId)!;
        
        if(orderIndex != -1){
            const order = userOrders[orderIndex];
            userOrders?.splice(orderIndex,1)
            
            const closePrice = order.type==="buy"
            ? latestPrice.get(order.asset)?.ask
            : latestPrice.get(order.asset)?.bid
            
            const pnl = order.type === "buy"
            ? ((closePrice!) - (order.openPrice)) * order.quantity
            : ((order.openPrice) - (closePrice!)) * order.quantity;
            
            const closedOrder = {
                ...order,
                closePrice,
                pnl,
                status:"close",
                reqStatus:"success"
            }
            console.log("checking the whole closedPrice:", closedOrder)
            console.log("checking closedOrder properties:", closedOrder.closePrice);
            console.log("checking closedOrder quantity:", closedOrder.quantity);
            // console.log("checking closedOrder quantity:", closedOrder.quantity);

            //take the current userBalance and then add with the margin*pnl to give them their balance after they close the order
            const balance = userBalance.get(userId)!;
            const balanceAfterClosingOrder = balance + (closedOrder.margin + closedOrder.pnl)
            userBalance.set(userId, balanceAfterClosingOrder);

            await client.XADD(
                "engine-response",
                "*",
                {
                    data:JSON.stringify(closedOrder)
                }
            )
            
            await publisher.publish(`${orderId}`, JSON.stringify(closedOrder))
        }else{
            const closedOrder = {
                reqStatus:"failed"
            }
            await publisher.publish(`${orderId}`, JSON.stringify(closedOrder))
        }
    }else{
        const closedOrder = {
            reqStatus:"failed"
        }
        await publisher.publish(`${orderId}`, JSON.stringify(closedOrder))
    }
}

async function listenToOrders() {
    while(true){
        try {
            const orderReqFromHttpServer:any = await client.XREAD(
                {key:"trade", id:'$'},
                {BLOCK:0, COUNT:1}
            )
            
            // console.log(JSON.stringify(orderReqFromHttpServer, null, 2))
            if(orderReqFromHttpServer){
                for(const obj of orderReqFromHttpServer){
                    for(const message of obj.messages){
                        const data=JSON.parse(message.message.data)
                        
                        if(data.action === "CREATE_ORDER"){
                            const userId = data.userId;
                            if(!userBalance.has(userId)) userBalance.set(userId, 500*DECIMAL_VALUE)
                            const balance = userBalance.get(data.userId)?? 0
                            const exposure = (data.margin)* data.leverage //margin * leverage
                            
                            const openPrice = data.type ==="buy"
                            ?latestPrice.get(data.asset)?.bid!
                            :latestPrice.get(data.asset)?.ask!
                            
                            if(balance >= data.margin){
                                const createdOrder:Trade = {
                                    // action:data.action,
                                    userId:data.userId,
                                    orderId:data.orderId,
                                asset:data.asset,
                                openPrice,
                                type:data.type,
                                quantity:exposure/openPrice!,
                                margin:data.margin,
                                leverage:data.leverage,
                                status:data.status,
                                reqStatus:"success"
                            }
                            userBalance.set(data.userId, balance - data.margin)
                            
                            // console.log("users balance after placing order",userBalance)
                            
                            if(!openOrders.has(userId)) openOrders.set(userId, []);
                            openOrders.get(userId)?.push(createdOrder)
                            console.log("openOrders:", openOrders);
                            await publisher.publish(`${data.orderId}`, JSON.stringify(createdOrder))
                            
                            console.log("order processed from engine", createdOrder)
                        }else{
                            const createdOrder:Trade = {
                                action:data.action,
                                userId:data.userId,
                                orderId:data.orderId,
                                asset:data.asset,
                                openPrice,
                                type:data.type,
                                quantity:exposure/openPrice!,
                                margin:data.margin,
                                leverage:data.leverage,
                                status:data.status,
                                reqStatus:"failed"
                            }
                            await publisher.publish(`${data.orderId}`, JSON.stringify(createdOrder))
                            
                            console.log("order processed from engine", createdOrder)
                        }
                    }
                    
                    else if(data.action ==="CLOSE_ORDER"){
                        const userId = data.userId;
                        const orderId = data.orderId;
                        const status = data.status;
                        console.log("checking the logs of close order in engine:", userId, orderId, status);
                        closeOrder({userId, orderId})
                        
                    }
                    
                    else if(data.action === "PRICE_UPDATE"){
                        latestPrice.set(data.asset, {
                            ask:data.askWithSpread,
                            bid:data.bidWithSpread, 
                            decimal:data.decimal
                        })
                        liquidateTrade(data)
                    }

                    else if(data.action ==="CHECK_BALANCE"){
                        const userId = data.userId;
                        const balance = userBalance.get(userId);

                        const checkedBalance = {
                            action:data.action,
                            balance,
                            reqStatus:"success"
                        }

                        await publisher.publish(`${userId}`, JSON.stringify(checkedBalance))
                    }
                }
            }
        }
        
    } catch (error) {
        console.error("Error while reading from stream:", error);
        await new Promise(resolve => setTimeout(resolve, 1000)) //delay 1s before trying again
    }
}
}
const takeSnapshot = async()=>{
    // console.log("check 2")
    const snapShot = {
        openOrders: Array.from(openOrders.entries()),
        userBalance: Array.from(userBalance.entries())
    }
    await Bun.write("./snapshot.json", JSON.stringify(snapShot))
    // console.log("check 3")
    
}

// console.log("check 4")
const loadSnapshot=async ()=>{
    // console.log("check 5")
    const data = await Bun.file("./snapshot.json").json()
    // console.log("checking data of json file", data)
    for (const [key, value] of data.openOrders as [string, any[]][]) {
        openOrders.set(key, value);
    }
    for (const [key, value] of data.userBalance as [string, number][]) {
        userBalance.set(key, value);
    }
    // console.log("check 6")
    console.log("snapshot loaded",openOrders)
    console.log("snapshot loaded", userBalance)
}

await loadSnapshot();
listenToOrders();
setInterval(takeSnapshot, 3000);
// takeSnapshot();