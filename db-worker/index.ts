import { PrismaClient } from "./generated/prisma/client";
import { createClient } from "redis";
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const client = createClient({
    url: redisUrl
});
const prisma = new PrismaClient();
await client.connect();

const STREAM_NAME = "engine-response"
const CONSUMER_GROUP = "db-worker-group"
const CONSUMER_NAME = `db-worker-${Date.now()}`

export type RedisStreamMessage<T = Record<string, string>> = {
    id: string
    message: T
}

export type RedisStreamResponse<T = Record<string, string>> = Array<{
    name: string
    messages: RedisStreamMessage<T>[]
}>

async function initializeConsumerGroup() {
    try {
        await client.xGroupCreate(
            STREAM_NAME,
            CONSUMER_GROUP,
            "$",
            { MKSTREAM: true }
        );
        console.log("Consumer group created!")
    } catch (error: any) {
        if (error.message.includes("BUSYGROUP")) {
            console.log("Consumer group already exists");
        } else {
            throw error;
        }
    }
}
await initializeConsumerGroup();


while (true) {
    try {
        const closedOrdersFromEngine = await client.xReadGroup(
            CONSUMER_GROUP,
            CONSUMER_NAME,
            [{ key: "engine-response", id: '>' }],
            { BLOCK: 0, COUNT: 1 }
        )

        if (!closedOrdersFromEngine) continue;

        if (closedOrdersFromEngine) {
            for (const obj of closedOrdersFromEngine as RedisStreamResponse) {
                for (const message of obj.messages) {
                    const data = JSON.parse(message.message.data!);

                    saveToDB(data)

                    await client.xAck(STREAM_NAME, CONSUMER_GROUP, message.id)
                }
            }
        }
    } catch (error) {
        console.error("Error reading messages from stream!", error)
    }
}

async function saveToDB(data: any) {
    try {
        console.log("check check!");
        console.log("lets check data!", data);
        const closedOrder = await prisma.closedOrders.create({
            data: {
                userId: data.userId,
                orderId: data.orderId,
                type: data.type,
                asset: data.asset,
                margin: data.margin,
                leverage: data.leverage,
                quantity: data.quantity,
                openPrice: data.openPrice,
                closePrice: data.closePrice,
                pnl: data.pnl,
                status: data.status
            }
        })

        console.log("closed orders saved to db:", closedOrder)
    } catch (error) {
        console.error("Failed saving to DB!", error);
    }
}