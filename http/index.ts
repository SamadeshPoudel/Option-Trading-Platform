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
}

// Trust proxy for rate limiting behind Docker/nginx
app.set('trust proxy', 1);

app.use(express.json())
app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use('/api', tradeRoutes)



app.get("/health", (req, res) => {
    return res.status(200).json({ msg: "Healthy boy!" })
})

app.listen("5000", () => {
    console.log("Server running on port 5000")
})