import express from "express";
import { createClient } from "redis"
import type { CloseOrder, CreateOrder } from "./types";
import { PrismaClient } from "./generated/prisma/client";
import { closeOrderSchema, createOrderSchema, userIdSchema } from "./zodValidation";
import { z } from "zod";
import { requireAuth } from "./authMiddleware";
import { rateLimiter } from "./rateLimiter";


const prisma = new PrismaClient();

const router = express.Router();
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({
    url: redisUrl
});

const client = redisClient.duplicate();
await client.connect();

const subcribe = redisClient.duplicate();
await subcribe.connect();

const DECIMAL_VALUE = 10000;

router.post("/trade/create", rateLimiter, requireAuth, async (req: express.Request, res: express.Response) => {

    try {
        const validatedData = createOrderSchema.parse(req.body);
        const { userId, asset, type, margin, leverage } = validatedData;
        const orderId = crypto.randomUUID();

        if (!userId || !asset || !margin || !leverage || !type) {
            return res.status(404).json({ msg: "Missing details to create the order!" })
        }

        // console.log("userId in /trade/create:", userId);
        // console.log("reached inside create order route!")

        const createOrder: CreateOrder = {
            action: "CREATE_ORDER",
            userId,
            orderId,
            asset,
            margin: margin * DECIMAL_VALUE,
            type,
            leverage,
            status: "open"
        }
        //defining new promise here to avoid the res hangout issue
        const responsePromise = new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Timeout"))
            }, 5000);

            await subcribe.subscribe(`${orderId}`, (data) => {
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
                data: JSON.stringify(createOrder)
            }
        )

        const result: any = await responsePromise;
        const parsedResult = JSON.parse(result)

        if (parsedResult.reqStatus === 'success') {
            return res.status(200).json({ msg: "create order placed successful", orderId: parsedResult.orderId })
        }
        else if (parsedResult.reqStatus === 'failed') {
            return res.status(400).json({ msg: "order failed due to insufficient balance" })
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                msg: "Validation error!",
                errors: error.message
            })
        }
        console.error(error);
        return res.status(500).json({ msg: "Internal server error!" })

    }
})

router.post("/trade/close", rateLimiter, requireAuth, async (req: express.Request, res: express.Response) => {
    try {
        const validatedData = closeOrderSchema.parse(req.body)
        const { userId, orderId } = validatedData;
        if (!userId || !orderId) {
            return res.status(400).json({ msg: "Missing details to close the order" })
        }

        const closeOrder: CloseOrder = {
            action: "CLOSE_ORDER",
            userId,
            orderId,
            status: "close"
        }
        //defining new promise here to avoid the res hangout issue
        const responsePromise = new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Timeout"))
            }, 5000);

            await subcribe.subscribe(`${orderId}`, (data) => {
                clearTimeout(timeout)
                subcribe.unsubscribe(`${orderId}`);
                resolve(data)
            })
        })

        await client.XADD(
            "trade",
            "*",
            {
                data: JSON.stringify(closeOrder)
            }
        )

        const result: any = await responsePromise;
        const parsedResult = JSON.parse(result);

        if (parsedResult.reqStatus === "success") {
            return res.status(200).json({ msg: "order closed successfully" })
        } else {
            return res.status(400).json({ msg: "open order not found" })
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                msg: "Validation error",
                errors: error.message
            });
        }
        console.error(error);
        return res.status(500).json({ msg: "Internal server error" });

    }
})

router.get("/balance", requireAuth, async (req: express.Request, res: express.Response) => {
    try {
        // const validatedData = userIdSchema.parse(req.query);
        const { userId } = req.query;
        if (!userId) {
            return res.status(404).json({ msg: "Missing userId!" })
        }

        const responsePromise = new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Timeout"))
            }, 10000);

            await subcribe.subscribe(`${userId}`, (data) => {
                clearTimeout(timeout);
                subcribe.unsubscribe(`${userId}`);
                resolve(data);
            })
        })

        const payload = {
            action: "CHECK_BALANCE",
            userId
        }

        await client.XADD(
            "trade",
            "*",
            {
                data: JSON.stringify(payload)
            }
        )

        const result: any = await responsePromise;
        const parsedResult = JSON.parse(result);
        // console.log("checking parseResult", parsedResult);
        if (parsedResult.reqStatus === 'success') {
            return res.status(200).json({ data: parsedResult.balance, msg: "Balance fetched successfully!" })
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                msg: "Validation error",
                errors: error.message
            });
        }
        console.error(error);
        return res.status(500).json({ msg: "Internal server error!" })
    }
})

router.get("/open-orders", requireAuth, async (req: express.Request, res: express.Response) => {
    try {
        const validatedData = userIdSchema.parse(req.query);
        const { userId } = validatedData;
        if (!userId) {
            return res.status(404).json({ msg: "Missing userId!" })
        }
        const responsePromise = new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Timeout"))
            }, 5000);

            await subcribe.subscribe(`${userId}`, (data) => {
                clearTimeout(timeout);
                subcribe.unsubscribe(`${userId}`);
                resolve(data);
            })
        })

        const payload = {
            action: "CHECK_OPEN_ORDERS",
            userId
        }

        await client.XADD(
            "trade",
            "*",
            { data: JSON.stringify(payload) }
        )

        const result: any = await responsePromise;
        const parsedResult = JSON.parse(result);

        if (parsedResult.reqStatus === "success") {
            return res.status(200).json({ data: parsedResult.openOrders, msg: "open orders fetched successfully!" })
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                msg: "Validation error",
                errors: error.message
            });
        }
        console.error(error);
        return res.status(500).json("Internal server error!")
    }
})

router.get("/closed-orders", requireAuth, async (req: express.Request, res: express.Response) => {
    try {
        const validatedData = userIdSchema.parse(req.query);
        const { userId } = validatedData;
        if (!userId) {
            return res.status(404).json({ msg: "Missing userId!" })
        }
        const closedOrder = await prisma.closedOrders.findMany({
            where: {
                userId
            }
        })
        return res.status(200).json({ msg: "closed orders fetched successfully", closedOrder })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                msg: "Validation error",
                errors: error.message
            });
        }
        console.error(error);
        return res.status(500).json({ msg: "Internal server error!" })
    }
})

router.get("/candles", async (req: express.Request, res: express.Response) => {
    const { interval, symbol, startTime, endTime } = req.query;
    let url = `https://api.backpack.exchange/api/v1/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}`;

    if (endTime) {
        url += `&endTime=${endTime}`;
    }
    const r = await fetch(url);
    const json = await r.json();
    res.json(json);
})

export default router;