import { createClient } from "redis";
const client = createClient();
await client.connect();

const latestPrice = new Map<string, {ask:number, bid:number, decimal:number}>()

while(true){
    const orderReqFromHttpServer:any = await client.XREAD(
       {key:"trade", id:'$'},
       {BLOCK:0, COUNT:1}
    )

    // console.log(JSON.stringify(orderReqFromHttpServer, null, 2))
    if(orderReqFromHttpServer){
        for(const obj of orderReqFromHttpServer){
            // console.log(obj.messages.data)
            for(const message of obj.messages){
                const data=JSON.parse(message.message.data)
                if(data.action === "CREATE_ORDER"){
                    const userId = data.data.userId;
                    const orderId = data.data.orderId;
                    const asset = data.data.asset;
                    const price= data.data.price;
                    const slippage = data.data.slippage;
                    const type = data.data.type;
                    console.log(userId, orderId, asset, price, slippage)
                    // console.log("before open price", latestPrice.get())
                    const openPrice = data.data.type ==="buy"
                    ?latestPrice.get(data.data.asset)?.ask
                    :latestPrice.get(data.data.asset)?.bid

                    const createdOrder = {
                        action:data.action,
                        userId,
                        orderId,
                        asset,
                        openPrice,
                        type
                    }

                    await client.XADD(
                        "engine-response",
                        "*",
                        {data:JSON.stringify(createdOrder)})

                    console.log("order processed from engine", createdOrder)

                }
                else if(data.action === "PRICE_UPDATE"){
                    
                    latestPrice.set(data.data.asset, {
                        ask:data.data.askWithSpread,
                        bid:data.data.bidWithSpread, 
                        decimal:data.data.decimal
                    })
                    // console.log("checking latest price",latestPrice);
                }
            }
        }
    }
}