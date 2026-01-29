import WebSocket, { WebSocketServer } from "ws"
import { createClient } from "redis"
const client = createClient();

interface Payload {
    action: string,
    asset: string,
    askWithSpread: number,
    bidWithSpread: number,
    decimal: number
}

async function main() {
    //only connect to redis once on startup
    await client.connect();
    console.log("redis client connected")

    //start backpack ws connection
    connectToBackpack();
}

function connectToBackpack() {

    //listen to backpack for the latest price
    const ws = new WebSocket(process.env.BACKPACK_API!)

    ws.on('error', console.error)

    ws.on('open', async () => {
        console.log("ws connected")
        ws.send('{ "method": "SUBSCRIBE", "params": ["bookTicker.SOL_USDC", "bookTicker.BTC_USDC", "bookTicker.ETH_USDC"] }')
    })

    ws.on('message', async (event) => {
        const stream = JSON.parse(event.toString())
        const AskSpread = 0.999;
        const BidSpread = 1.001;
        const askWithSpread = parseFloat(stream.data.a) * AskSpread
        const bidWithSpread = parseFloat(stream.data.b) * BidSpread
        // console.log("Type of askWithSpread",typeof askWithSpread)
        // console.log("Type of bidWithSpread",typeof bidWithSpread)


        const payload: Payload = {
            action: "PRICE_UPDATE",
            asset: (stream.data.s).split("_")[0], //SOL_USDC
            askWithSpread: Math.trunc(askWithSpread * 10000),
            bidWithSpread: Math.trunc(bidWithSpread * 10000),
            decimal: 4

        }

        await client.XADD(
            "trade", //stream name
            "*", //auto gen id with timestamp
            {
                data: JSON.stringify(payload)
            }
        )

        if (!subscriptionTable.has(payload.asset)) {
            subscriptionTable.set(payload.asset, [])
            return;
        }
        subscriptionTable.get(payload.asset)?.forEach(ws => ws.send(JSON.stringify(payload)))

        // console.log("Asset:", payload.asset);
        // console.log("Ask with spread",payload.askWithSpread);
        // console.log("Bid with spread",payload.bidWithSpread);

        // console.log("stream pushed to redis stream")
        // console.log("\n")
    })

    ws.on('close', () => {
        console.log("Backpack ws closed, reconnecting in 3 seconfs");
        setTimeout(() => {
            connectToBackpack();
        }, 3000)
    })
}

main();

//creating wss to send ws data to frontend from this poller ws
const wss = new WebSocketServer({ port: 8080 })

const subscriptionTable = new Map<string, WebSocket[]>() //key is SOL_USDC 

//to send the data to frontend
wss.on('connection', function connection(ws) {
    let subscribedAssets: string[] = [];
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);
        const parsedData = JSON.parse(data.toString())
        console.log("parsedDATA:", parsedData)

        if (parsedData.action === "SUBSCRIBE") {
            // Prevent duplicate subscriptions
            if (subscribedAssets.includes(parsedData.asset)) {
                return;
            }
            subscribedAssets.push(parsedData.asset)

            if (!subscriptionTable.has(parsedData.asset)) {
                subscriptionTable.set(parsedData.asset, [])
            }
            subscriptionTable.get(parsedData.asset)?.push(ws)
            // ws.send(`subscribed to ${parsedData.asset}`)
        } else {
            // Unsubscribe from specific asset
            subscribedAssets = subscribedAssets.filter(a => a !== parsedData.asset)
            const filtered = subscriptionTable.get(parsedData.asset)?.filter(item => item !== ws)
            subscriptionTable.set(parsedData.asset, filtered || [])
            // ws.send(`Unsubscribed to ${parsedData.asset}`)
        }
    });

    ws.on("close", () => {
        // Remove this client from ALL subscribed assets
        subscribedAssets.forEach(asset => {
            const filtered = subscriptionTable.get(asset)?.filter(item => item !== ws)
            subscriptionTable.set(asset, filtered || [])
        })
        subscribedAssets = []
        console.log("Client disconnected, cleaned up subscriptions")
    })

    //   ws.send('something');
});


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