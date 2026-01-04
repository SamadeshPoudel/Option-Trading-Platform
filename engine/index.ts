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

while(true){
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

                    if(balance > data.margin){
                        const createdOrder:Trade = {
                            // action:data.action,
                            userId:data.userId,
                            orderId:data.orderId,
                            asset:data.asset,
                            openPrice,
                            type:data.type,
                            quantity:exposure/openPrice!,
                            margin:data.margin,
                            status:data.status,
                            reqStatus:"success"
                        }
                        userBalance.set(data.userId, balance - data.margin)

                        console.log("users balance after placing order",userBalance)

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
                             console.log("closedOrder:", closedOrder)

                            await client.XADD(
                                "engine-response",
                                "*",
                                {
                                    data:JSON.stringify(closedOrder)
                                }
                            )
    
                            await publisher.publish(`${data.orderId}`, JSON.stringify(closedOrder))
                        }else{
                            const closedOrder = {
                            reqStatus:"failed"
                            }
                        await publisher.publish(`${data.orderId}`, JSON.stringify(closedOrder))
                        }
                    }else{
                        const closedOrder = {
                            reqStatus:"failed"
                        }
                        await publisher.publish(`${data.orderId}`, JSON.stringify(closedOrder))
                    }
                }

                else if(data.action === "PRICE_UPDATE"){
                    latestPrice.set(data.asset, {
                        ask:data.askWithSpread,
                        bid:data.bidWithSpread, 
                        decimal:data.decimal
                    })
                }
            }
        }
    }
}
