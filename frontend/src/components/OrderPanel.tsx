import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PriceBoard from "./PriceBoardDropdown"
import BuySellTab from "./BuySellTab"
import SellTab from "./SellTab"
import { useAssetStore } from "store/useStore"


const OrderPanel = () => {
  return (
    <Card className="bg-[#14151B]">

    {/*PriceBoard to show real-time price of an asset  */}
    <PriceBoard  />
    {/* buy and sell tab  */}
    <BuySellTab />
    
</Card>
  )
}

export default OrderPanel
