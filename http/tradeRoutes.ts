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
        slippage:number
    }
}

router.post("/trade/create", async (req:express.Request, res:express.Response)=>{
    const {userId, asset, price, slippage} = req.body;
    const orderId = crypto.randomUUID();

    if(!userId || !asset || !price || !slippage){
        return res.status(404).json({msg:"Missing details to create the order!"})
    }

    const createOrder: CreateOrder = {
        action:"CREATE_ORDER",
        data:{
            userId,
            orderId,
            asset,
            price,
            slippage
        }
    }

    await client.XADD(
        "trade",
        "*",
        {
            data:JSON.stringify(createOrder)
        }
    )

    //response will be given to user only after engine process the order and acknowledge here! That same response will be passed to user.
})

export default router;