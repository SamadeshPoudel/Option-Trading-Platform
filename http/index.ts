import express from "express";
import tradeRoutes from "./tradeRoutes"
import cors from "cors";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

const app = express();

if (process.env.NODE_ENV !== "production") {
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true,
    }))
} else {
    // Production CORS - uses FRONTEND_URL env variable
    app.use(cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    }))
}

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json())


app.use('/api', tradeRoutes)

app.get("/health", (req, res) => {
    return res.status(200).json({ msg: "Healthy boy!" })
})

app.listen("5000", () => {
    console.log("Server running on port 5000")
})