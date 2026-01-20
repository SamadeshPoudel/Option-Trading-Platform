import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BuyTab from "./BuyTab"
import SellTab from "./SellTab"

const BuySellTab = () => {
  return (
    <div className="flex justify-between flex-col ">
   <Tabs defaultValue="buy" className="w-[400px] flex justify-between">
  <TabsList>
    <TabsTrigger 
      value="buy" 
      className="text-green-400 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
    >
      Buy / Long
    </TabsTrigger>
    <TabsTrigger 
      value="sell" 
      className="text-red-400 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
    >
      Sell / Short
    </TabsTrigger>
  </TabsList>
  <TabsContent value="buy">
    <BuyTab />
  </TabsContent>
  <TabsContent value="sell">
    <SellTab />
  </TabsContent>
</Tabs>
    </div>
  )
}

export default BuySellTab
