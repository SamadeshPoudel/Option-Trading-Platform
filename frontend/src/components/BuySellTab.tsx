import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BuyTab from "./BuyTab"
import SellTab from "./SellTab"

const BuySellTab = () => {
  return (
    <div className="flex justify-between flex-col">
      <Tabs defaultValue="buy" className="w-full flex flex-col">
        <TabsList className="w-full h-12">
          <TabsTrigger 
            value="buy" 
            className="text-green-400 text-sm data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 cursor-pointer"
          >
            Buy / Long
          </TabsTrigger>
          <TabsTrigger 
            value="sell" 
            className="text-red-400 text-sm data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 cursor-pointer"
          >
            Sell / Short
          </TabsTrigger>
        </TabsList>
        <TabsContent value="buy" className="mt-2">
          <BuyTab />
        </TabsContent>
        <TabsContent value="sell" className="mt-2">
          <SellTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BuySellTab