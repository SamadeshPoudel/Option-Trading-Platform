import express from "express";
import { createClient } from "redis"
import type { CloseOrder, CreateOrder } from "./types";

const router = express.Router();
const redisClient = createClient();

const client = redisClient.duplicate();
await client.connect();

const subcribe = redisClient.duplicate();
await subcribe.connect();

const DECIMAL_VALUE=10000;

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

router.post("/trade/close", async(req:express.Request,res:express.Response)=>{
    const {userId, orderId} = req.body;
    if(!userId || !orderId){
        return res.status(400).json({msg:"Missing details to close the order"})
    }

    const closeOrder:CloseOrder = {
        action:"CLOSE_ORDER",
        userId,
        orderId,
        status:"close"
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

    await client.XADD(
        "trade",
        "*",
        {
            data:JSON.stringify(closeOrder)
        }
    )

    const result:any = await responsePromise;
    const parsedResult = JSON.parse(result);

    if(parsedResult.reqStatus ==="success"){
        return res.status(200).json({msg:"order closed successfully"})
    }else{
        return res.status(400).json({msg:"open order not found"})
    }
})

router.get("/balance", async(req:express.Request, res:express.Response)=>{
    try {
        const {userId} = req.body;
        if(!userId){
            return res.status(404).json({msg:"Missing userId!"})
        }

        const responsePromise = new Promise(async(resolve, reject)=>{
            const timeout = setTimeout(()=>{
                reject(new Error("Timeout"))
            }, 5000);

            await subcribe.subscribe(`${userId}`, (data)=>{
                clearTimeout(timeout);
                subcribe.unsubscribe(`${userId}`);
                resolve(data);
            })
        })

        const payload = {
            action:"CHECK_BALANCE",
            userId
        }

        await client.XADD(
            "trade",
            "*",
            {
                data:JSON.stringify(payload)
            }
        )

        const result:any = await responsePromise;
        const parsedResult = JSON.parse(result);
        console.log("checking parseResult", parsedResult);
        if(parsedResult.reqStatus==='success'){
            return res.status(200).json({data:parsedResult.balance, msg:"Balance fetched successfully!"})
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({msg:"Internal server error!"})
    }
})

router.get("/open-orders", async(req:express.Request, res:express.Response)=>{
    try {
        const {userId} = req.body;
        if(!userId){
            return res.status(404).json({msg:"Missing userId!"})
        }
        const responsePromise = new Promise(async(resolve, reject)=>{
            const timeout = setTimeout(()=>{
                reject(new Error("Timeout"))
            }, 5000);

            await subcribe.subscribe(`${userId}`, (data)=>{
                clearTimeout(timeout);
                subcribe.unsubscribe(`${userId}`);
                resolve(data);
            })
        })  

        const payload = {
            action:"CHECK_OPEN_ORDERS",
            userId
        }

        await client.XADD(
            "trade",
            "*",
            {data:JSON.stringify(payload)}
        )

        const result:any = await responsePromise;
        const parsedResult = JSON.parse(result);

        if(parsedResult.reqStatus==="success"){
            return res.status(200).json({data:parsedResult.openOrders, msg:"open orders fetched successfully!"})
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json("Internal server error!")
    }
})

export default router;