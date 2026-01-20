import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import InputCard from "./InputCard"

const BuyTab = () => {
  return (
    <div className="text-white flex flex-col gap-2">

        <InputCard label={"Buy price"} input={152} symbol={"$"}  />
        <InputCard label={"Quantity"} input={1.002} symbol={"B"}  />

        <div className="flex flex-col gap-2 m-2">
        <p>Leverage</p>
        <Slider defaultValue={[33]} max={100} step={10} />
        </div>

        <InputCard label={"Margin (Order value)"} input={152} symbol={"$"}  />
        
        <div className="m-2">
        <Button variant="outline" className="text-black bg-green-600 w-full hover:bg-green-400 hover:text-white border-none cursor-pointer">
            Buy for 150
        </Button>
        </div>
        
    </div>

  )
}

export default BuyTab
