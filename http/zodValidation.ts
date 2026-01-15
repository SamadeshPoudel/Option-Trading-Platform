import { z } from "zod";

export const createOrderSchema = z.object({
    userId: z.uuid({ message: "Invalid user ID format" }),
    asset: z.enum(["BTC", "ETH", "SOL"], {
        message: "Asset must be BTC, ETH, or SOL"
    }),
    type: z.enum(["buy", "sell"], {
        message: "Type must be either LONG or SHORT"
    }),
    margin: z.number().positive("Margin must be a positive number"),
    leverage: z.number().positive("Leverage must be a positive number!")
});

export const closeOrderSchema = z.object({
    userId: z.uuid({ message: "Invalid user ID format" }),
    orderId: z.uuid({ message: "Invalid order ID format" })
});

export const userIdSchema = z.object({
    userId: z.uuid({ message: "Invalid user ID format" })
});
