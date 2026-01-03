import express from "express";
import { createClient } from "redis"

const router = express.Router();
const redisClient = createClient();

const client = redisClient.duplicate();
await client.connect();

const subcribe = redisClient.duplicate();
await subcribe.connect();

const DECIMAL_VALUE=10000;

interface CreateOrder{
    action:string,
    userId:string,
    orderId:string,
    asset:string,
    margin:number,
    type:"buy"| "sell",
    leverage:number,
    status:"open"|"closed"
}

router.post("/trade/create", async (req:express.Request, res:express.Response)=>{
    const {userId, asset, type, margin, leverage} = req.body;
    const orderId = crypto.randomUUID();
    
    if(!userId || !asset || !margin || !leverage || !type){
        return res.status(404).json({msg:"Missing details to create the order!"})
    }

    const createOrder: CreateOrder = {
        action:"CREATE_ORDER",
        userId,
        orderId,
        asset,
        margin:margin*DECIMAL_VALUE,
        type,
        leverage,
        status:"open"
    }
    //defining new promise here to avoid the res hangout issue
    const responsePromise = new Promise(async(resolve, reject)=>{
        const timeout = setTimeout(()=>{
            reject(new Error("Timeout"))
        }, 5000);

        await subcribe.subscribe(`${orderId}`,(data)=>{
            clearTimeout(timeout)
            subcribe.unsubscribe(`${orderId}`);
            resolve(data)
        })

    })
        
    //adding the order in the stream to let the engine pickup from there
    await client.XADD(
        "trade",
        "*",
        {
            data:JSON.stringify(createOrder)
        }
    )
    
    const result:any = await responsePromise;
    const parsedResult = JSON.parse(result)

    if(parsedResult.reqStatus==='success'){
        return res.status(200).json({msg:"create order placed successful", orderId:parsedResult.orderId})
    }else if(parsedResult.reqStatus==='failed'){
        return res.status(400).json({msg:"order failed due to insufficient balance"})
    }

})

export default router;