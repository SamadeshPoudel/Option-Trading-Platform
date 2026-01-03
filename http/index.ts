import express from "express";
import tradeRoutes from "./tradeRoutes"

const app = express();
app.use(express.json())

app.use('/api', tradeRoutes )

app.get("/health", (req, res)=>{
    return res.status(200).json({msg:"Healthy thulo lauda"})
})

app.listen("5000", ()=>{
    console.log("Server running on port 5000")
})