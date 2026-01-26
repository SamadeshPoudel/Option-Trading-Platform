import express from "express";
import tradeRoutes from "./tradeRoutes"
import cors from "cors";

const app = express();
app.use(express.json())
if(process.env.NODE_ENV !=="production"){
    app.use(cors())
}

app.use('/api', tradeRoutes )

app.get("/health", (req, res)=>{
    return res.status(200).json({msg:"Healthy boy!"})
})

app.listen("5000", ()=>{
    console.log("Server running on port 5000")
})