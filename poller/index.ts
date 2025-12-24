import WebSocket from "ws"
import { createClient } from "redis"

const ws = new WebSocket(process.env.BACKPACK_API!)
const client = createClient();

interface Payload{
    action:string,
    data:{
        asset:string,
        askWithSpread:number,
        bidWithSpread:number,
        decimal:number
    }
}

ws.on('error',console.error)

ws.on('open',async()=>{
    console.log("ws connected")
    await client.connect();
    console.log("redis client connected")
    ws.send('{ "method": "SUBSCRIBE", "params": ["bookTicker.SOL_USDC", "bookTicker.BTC_USDC", "bookTicker.ETH_USDC"] }')
})

ws.on('message',async(event)=>{
    const stream = JSON.parse(event.toString())
    const AskSpread = 0.99;
    const BidSpread = 1.01;
    const askWithSpread = parseFloat(stream.data.a)*AskSpread
    const bidWithSpread = parseFloat(stream.data.b)*BidSpread
    // console.log("Type of askWithSpread",typeof askWithSpread)
    // console.log("Type of bidWithSpread",typeof bidWithSpread)


    const payload:Payload = {
        action:"PRICE_UPDATE",
        data:{
            asset:(stream.data.s).split("_")[0],
            askWithSpread:Math.trunc(askWithSpread*10000),
            bidWithSpread:Math.trunc(bidWithSpread*10000),
            decimal:4
        }
    }


    await client.XADD(
        "trade", //stream name
        "*", //auto gen id with timestamp
        {
            data:JSON.stringify(payload)
        }
    )

    console.log("Asset:", payload.data.asset);
    console.log("Ask with spread",payload.data.askWithSpread);
    console.log("Bid with spread",payload.data.bidWithSpread);

    console.log("stream pushed to redis stream")
    console.log("\n")
})

/*
sample data from backpack api
{"data":
{
"A":"0.01721",
"B":"0.00013",
"E":1766506474644202, //event time in microsecond
"T":1766506474641727,
"a":"87693.1", //ask price aka selling price, ("asking" for this much price thats why it became ask price)
"b":"87678.3", //bid price aka buying price
"e":"bookTicker", //event
"s":"BTC_USDC",
"u":2203535706},
"stream":"bookTicker.BTC_USDC"
}
*/