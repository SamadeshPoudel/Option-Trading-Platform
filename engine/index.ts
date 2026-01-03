import { createClient } from "redis";
import type { Trade } from "./types";
const redisClient = createClient();

const client = redisClient.duplicate();
await client.connect();

const publisher = redisClient.duplicate();
await publisher.connect()

const latestPrice = new Map<string, {ask:number, bid:number, decimal:number}>()
const userBalance = new Map<string,number>() //userId and balance

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
                    const balance = userBalance.get(data.userId)?? 0
                    const exposure = (data.margin)* data.leverage //margin * leverage
                                            
                    const openPrice = data.type ==="buy"
                    ?latestPrice.get(data.asset)?.ask!
                    :latestPrice.get(data.asset)?.bid!

                    if(!userBalance.has(userId)) userBalance.set(userId, 500*DECIMAL_VALUE)
                        console.log("user balance map", userBalance);
                    if(balance > data.margin){
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
                            reqStatus:"success"
                        }
                        userBalance.set(data.userId, balance - data.margin)
                        console.log("users balance after placing order",userBalance)
    
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
