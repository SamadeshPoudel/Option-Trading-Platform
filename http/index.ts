import express from "express";
import tradeRoutes from "./tradeRoutes"

const app = express();
app.use(express.json())

app.use('/api', tradeRoutes )

app.listen("5000", ()=>{
    console.log("Server running on port 5000")
})