import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useAssetStore } from "store/useStore";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";

const SellTab = () => {
  const selectedSymbol = useAssetStore(state => state.selectedSymbol);
  const livePrice = useAssetStore(state => state.livePrices[selectedSymbol]);
  

  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(livePrice?.ask || 1);
  const [leverage, setLeverage] = useState(1);

    // Calculate quantity whenever margin, leverage, or price changes
  useEffect(() => {
    if (livePrice?.ask) {
      const totalPosition = amount * leverage; // Total position size
      const calculatedQuantity = totalPosition / livePrice.ask;
      setQuantity(calculatedQuantity);
    }
  }, [amount, leverage, livePrice?.ask]);

  return (
    <div className="text-white flex flex-col gap-2">

        {/* <InputCard label={"Sell price"} input={livePrice?.ask} symbol={"$"}  /> */}
        <p>Sell price</p>
        <Input value={livePrice?.ask?.toFixed(2) || "Loading..."} className="focus:outline-none focus:ring-0" readOnly/>

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
          value={amount.toFixed(2)} 
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          min={0}
        />
       
        <div className="m-2">
          <Button 
            variant="outline" 
            className="text-black bg-green-600 w-full hover:bg-green-400 hover:text-white border-none cursor-pointer"
            disabled={!livePrice?.ask}
          >
            Sell {quantity.toFixed(2)} {selectedSymbol} @ ${livePrice?.ask?.toFixed(2)}
          </Button>
        </div>

        {/* <p>total amount: {amount*leverage}</p> */}
        
    </div>

  )
}

export default SellTab
