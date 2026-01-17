import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

const SellTab = () => {
  return (
    <div className="text-white flex flex-col gap-2">

        <div>
        <p> Sell price</p>
        <Card className=" text-white h-12 py-0 bg-[#202127] m-2">
        <CardContent className="flex justify-between items-center h-full p-4">
            <p className="text-2xl">152</p>
            <p className="text-2xl">$</p>
        </CardContent>
        </Card>
        </div>

        <div>
        <p>Quantity</p>
        <Card className=" text-white h-12 py-0 bg-[#202127] m-2">
        <CardContent className="flex justify-between items-center h-full p-4">
            <p className="text-2xl">1.002</p>
            <p className="text-2xl">B</p>
        </CardContent>
        </Card>
        </div>

        <div className="flex flex-col gap-2 m-2">
        <p>Leverage</p>
        <Slider defaultValue={[33]} max={100} step={10} />
        </div>

        <div>
        <p>Margin (Order value)</p>
        <Card className=" text-white h-12 py-0 bg-[#202127] m-2">
        <CardContent className="flex justify-between items-center h-full p-4">
            <p className="text-2xl">1.002</p>
            <p className="text-2xl">$</p>
        </CardContent>
        </Card>
        </div>
        
        <div className="m-2">
        <Button variant="outline" className="text-black bg-green-400 w-full hover:bg-green-400 hover:text-white border-none cursor-pointer">
            Sell for 150
        </Button>
        </div>
        
    </div>

  )
}

export default SellTab
