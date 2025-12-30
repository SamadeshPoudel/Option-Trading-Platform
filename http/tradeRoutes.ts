import express from "express";
import { createClient } from "redis"

const router = express.Router();
const client = createClient();
await client.connect();

interface CreateOrder{
    action:string,
    data:{
        userId:string,
        orderId:string,
        asset:string,
        price:number,
        slippage:number,
        type:"buy"| "sell"
    }
}

router.post("/trade/create", async (req:express.Request, res:express.Response)=>{
    const {userId, asset, price, slippage, type} = req.body;
    const orderId = crypto.randomUUID();
    console.log("data received:", userId,asset,price,slippage)

    if(!userId || !asset || !price || !slippage || !type){
        return res.status(404).json({msg:"Missing details to create the order!"})
    }

    const createOrder: CreateOrder = {
        action:"CREATE_ORDER",
        data:{
            userId,
            orderId,
            asset,
            price,
            slippage,
            type
        }
    }

    await client.XADD(
        "trade",
        "*",
        {
            data:JSON.stringify(createOrder)
        }
    )

    const engineResponse = await client.XREAD(
        {key:"engine-response", id:"$"},
        {BLOCK:0, COUNT:1}
    )
    console.log(JSON.stringify(engineResponse))
    return res.status(200).json({msg:"order successful", engineResponse})

    //response will be given to user only after engine process the order and acknowledge here! That same response will be passed to user.
})

export default router;