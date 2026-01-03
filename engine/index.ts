import { createClient } from "redis";
const redisClient = createClient();

const client = redisClient.duplicate();
await client.connect();

const publisher = redisClient.duplicate();
await publisher.connect()

const latestPrice = new Map<string, {ask:number, bid:number, decimal:number}>()

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
                    const exposure = (data.margin)* data.leverage //margin * leverage

                    const openPrice = data.type ==="buy"
                    ?latestPrice.get(data.asset)?.ask
                    :latestPrice.get(data.asset)?.bid


                    const createdOrder = {
                        action:data.action,
                        userId:data.userId,
                        orderId:data.orderId,
                        asset:data.asset,
                        openPrice,
                        type:data.type,
                        quantity:exposure/openPrice!,
                        margin:data.margin,
                        status:data.status
                    }

                    console.log("PUBLISHING TO:", JSON.stringify(data.orderId));

                    await publisher.publish(`${data.orderId}`, createdOrder.orderId)

                    await client.XADD(
                        "engine-response",
                        "*",
                        {data:JSON.stringify(createdOrder)})

                    console.log("order processed from engine", createdOrder.orderId)

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
