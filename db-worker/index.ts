import { PrismaClient } from "./generated/prisma/client";
import {createClient} from "redis";
const client = createClient();
const prisma = new PrismaClient();
await client.connect();

const closedOrdersFromEngine:any = await client.XREAD(
    {key:"engine-response", id:'$'},
    {BLOCK:0, COUNT:1}
)

if(closedOrdersFromEngine){
    for(const obj of closedOrdersFromEngine){
        for(const message of obj.messages){
            const data = JSON.parse(message.message.data);
            console.log("this is data", data);


        const closedOrder =  await prisma.closedOrders.create({
                data: {
                    userId:"03d60c5f-99ef-4812-bfc1-49e52d44b3c5",
                    orderId:data.orderId,
                    type:data.type,
                    asset:data.asset,
                 margin:data.margin,
                 leverage:data.leverage, 
                 quantity:data.quantity,
                 openPrice:data.openPrice,
                 closePrice:data.closePrice,
                 pnl:data.pnl,
                 status:data.status
                    }
                })

                console.log("closed orders saved to db:", closedOrder)
        }
    }
}
// console.log(closedOrdersFromEngine)

// console.log("user", user)