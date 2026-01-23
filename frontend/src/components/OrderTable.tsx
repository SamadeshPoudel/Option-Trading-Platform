import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTradeStore } from "store/useStore"
import { useEffect } from "react"

export function OrderTable() {
  const openTrades = useTradeStore(state=>state.openTrades)
  const fetchOrders = useTradeStore(state=>state.fetchOrders);
  console.log("open Trades", openTrades)
  useEffect(() => {
   fetchOrders()
  }, [])
  
  const handleClose = async({orderId}:{orderId:string})=>{
    const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trade/close`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        userId:"03d60c5f-99ef-4812-bfc1-49e52d44b3c5",
        orderId
      })
    })
    const data = await res.json();
    fetchOrders();
    console.log("data after closing order", data)
  }

  return (
    <Tabs defaultValue="open-order" className="w-full">
      <TabsList className=" ">
        <TabsTrigger value="open-order">Open-orders</TabsTrigger>
        <TabsTrigger value="closed-order">Closed-orders</TabsTrigger>
      </TabsList>
      <TabsContent value="open-order">
        <Card className="w-full bg-green-200">
          <Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Symbol</TableHead>
      <TableHead>Side</TableHead>
      <TableHead>Qty</TableHead>
      <TableHead>Leverage</TableHead>
      <TableHead>Opening Price</TableHead>
      <TableHead>Amount</TableHead>
      <TableHead>Pnl (ROI%)</TableHead>
      <TableHead className="text-right">Action</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {openTrades.length > 0 ? (
      openTrades.map((trade) => (
        <TableRow key={trade.orderId}>
          <TableCell className="font-medium">{trade.asset}</TableCell>
          <TableCell>{trade.type}</TableCell>
          <TableCell>{trade.quantity?.toFixed(4) || "-"}</TableCell>
          <TableCell>{trade.leverage}x</TableCell>
          <TableCell>${((Number(trade.openPrice))/10000).toFixed(2)}</TableCell>
          <TableCell>${(trade.margin / 10000).toFixed(2)}</TableCell>
          <TableCell>pnl</TableCell>
          <TableCell className="text-right">
            <button className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600" onClick={()=>handleClose({orderId:trade.orderId})}>
              Close
            </button>
          </TableCell>
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={8} className="text-center text-gray-500">
          No open orders
        </TableCell>
      </TableRow>
    )}
</TableBody>
</Table>
        </Card>
      </TabsContent>


      <TabsContent value="closed-order">
        <Card>
          <Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generate and download your detailed reports. Export data in
              multiple formats for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 5 reports ready and available to export.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and options. Customize your
              experience to fit your needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Configure notifications, security, and themes.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
