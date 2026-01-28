import {
  Card
} from "@/components/ui/card"
import PriceBoard from "./PriceBoardDropdown"
import BuySellTab from "./BuySellTab"


const OrderPanel = () => {
  return (
    // bg-[#14151B]
    <Card className="bg-[#14151B] px-2 py-2 min-h-fit xl:h-full overflow-hidden flex flex-col">
      {/* PriceBoard to show real-time price of an asset */}
      <div className="shrink-0">
        <PriceBoard />
      </div>
      {/* buy and sell tab */}
      <div className="flex-1 overflow-hidden">
        <BuySellTab />
      </div>

    </Card>
  )
}

export default OrderPanel
