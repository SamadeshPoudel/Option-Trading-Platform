import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import InputCard from "./InputCard"
import { useAssetStore, useTradeStore } from "store/useStore"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "./ui/card"


const BuyTab = () => {
  const selectedSymbol = useAssetStore(state => state.selectedSymbol);
  const livePrice = useAssetStore(state => state.livePrices[selectedSymbol]);
  const fetchOrders = useTradeStore(state => state.fetchOrders)


  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(livePrice?.bid || 100);
  const [leverage, setLeverage] = useState(1);

  // Calculate quantity whenever margin, leverage, or price changes
  useEffect(() => {
    if (livePrice?.bid) {
      const totalPosition = amount * leverage; // Total position size
      const calculatedQuantity = totalPosition / livePrice.bid;
      setQuantity(calculatedQuantity);
    }
  }, [amount, leverage, livePrice?.bid]);

  const handleClick = async()=>{
    const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trade/create`,{
      "method":"POST",
      "headers":{
        "content-type":"application/json"
      },
      // userId, asset, type, margin, leverage
      "body":JSON.stringify({
          userId:"03d60c5f-99ef-4812-bfc1-49e52d44b3c5",
          asset:selectedSymbol,
          type:"buy",
          margin:amount,
          leverage:leverage
      })
    })
    const data = await res.json();
    fetchOrders()
    console.log("data from /trade/create", data);
  }

  return (
    <div className="text-white flex flex-col gap-2">

      {/* <InputCard label={"Buy price"} input={livePrice?.bid} symbol={"$"}  /> */}
      <p>Buy price</p>
      <Input value={livePrice?.bid?.toFixed(2) || "Loading..."} className="focus:outline-none focus:ring-0" readOnly />

      {/* <InputCard label={"Quantity"} input={quantity} symbol={"B"} />
         */}
      {/* Quantity - Auto Calculated (Read Only) */}
      <p>Quantity</p>
      <Input
        value={quantity.toFixed(2)}
        readOnly
        className="bg-gray-800"
      />

      {/* Leverage Slider */}
      <div className="flex flex-col gap-2 m-2">
        <div className="flex justify-between">
          <p>Leverage</p>
          <p className="font-bold">{leverage}x</p>
        </div>
        <Slider
          value={[leverage]}
          max={10}
          min={1}
          step={1}
          onValueChange={(v) => setLeverage(v[0])}
        />
      </div>

      {/* <InputCard label={"Amount"} input={amount} symbol={"$"}  /> */}
      {/* Margin - User Input */}
      <p>Amount</p>
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value === '' ? 0 : Number(e.target.value))}
        min={0}
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <div className="m-2">
        <Button
          variant="outline"
          className="text-black bg-green-600 w-full hover:bg-green-400 hover:text-white border-none cursor-pointer"
          disabled={!livePrice?.bid}
          onClick={handleClick}
        >
          Buy {quantity.toFixed(2)} {selectedSymbol} @ ${livePrice?.bid?.toFixed(2)}
        </Button>
      </div>

      {/* <p>total amount: {amount*leverage}</p> */}
      <Card className="p-2 flex gap-1 bg-[#202127] text-white">
        <p>Overview</p>
        <div className="flex justify-between">
          <p>Asset</p>
          <p>{selectedSymbol}</p>
        </div>
        <div className="flex justify-between">
          <p>Margin / Amount</p>
          <p>{amount.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p>Leverage</p>
          <p>1:{leverage}</p>
        </div>
        <div className="flex justify-between">
          <p>Quantity</p>
          <p>{quantity.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p>Platform fee</p>
          <p>{(amount * 0.01).toFixed(2)}</p>
        </div>
      </Card>

    </div>

  )
}

export default BuyTab
