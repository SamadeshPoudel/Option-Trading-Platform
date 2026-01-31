import express from "express";
import tradeRoutes from "./tradeRoutes"
import cors from "cors";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import rateLimit from "express-rate-limit"

const app = express();

if (process.env.NODE_ENV !== "production") {
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true,
    }))
}

app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limiting each IP to 100 requests per 15
}))
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
// }))

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json())


app.use('/api', tradeRoutes)

app.get("/health", (req, res) => {
    return res.status(200).json({ msg: "Healthy boy!" })
})

app.listen("5000", () => {
    console.log("Server running on port 5000")
})