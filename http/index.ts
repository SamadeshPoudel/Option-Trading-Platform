import express from "express";
import tradeRoutes from "./tradeRoutes"
import cors from "cors";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import rateLimit from "express-rate-limit"

const app = express();

if (process.env.NODE_ENV == "production") {
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true,
    }))
}

// Trust proxy for rate limiting behind Docker/nginx
app.set('trust proxy', 1);

app.use(rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20 // limiting each IP to 20 request per minute
}))
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
// }))


app.use(express.json())
app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use('/api', tradeRoutes)



app.get("/health", (req, res) => {
    return res.status(200).json({ msg: "Healthy boy!" })
})

app.listen("4000", () => {
    console.log("Server running on port 5000")
})