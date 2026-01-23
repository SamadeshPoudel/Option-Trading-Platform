import {
  Card,
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
import { useAssetStore, useTradeStore } from "store/useStore"
import { useEffect } from "react"

export function OrderTable() {
  const openTrades = useTradeStore(state => state.openTrades)
  const closedTrades = useTradeStore(state => state.closedTrades);
  const fetchOrders = useTradeStore(state => state.fetchOrders);
  const livePrices = useAssetStore(state => state.livePrices);

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleClose = async ({ orderId }: { orderId: string }) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trade/close`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: "03d60c5f-99ef-4812-bfc1-49e52d44b3c5",
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
            <TableCaption>A list of your open orders</TableCaption>
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
                    <TableCell>${((Number(trade.openPrice)) / 10000).toFixed(2)}</TableCell>
                    <TableCell>${(trade.margin / 10000).toFixed(2)}</TableCell>
                    <TableCell>
                      {(() => {
                        const currentPrice = livePrices[trade.asset]?.bid;
                        const openPrice = Number(trade.openPrice) / 10000;

                        if (!currentPrice || !trade.quantity) {
                          return <span className="text-gray-400">Loading...</span>;
                        }

                        const pnl = trade.type === "buy"
                          ? (currentPrice - openPrice) * trade.quantity
                          : (openPrice - currentPrice) * trade.quantity;

                        const color = pnl >= 0 ? "text-green-500" : "text-red-500";
                        const sign = pnl >= 0 ? "+" : "-";
                        const absValue = Math.abs(pnl).toFixed(2);

                        return <span className={color}>{sign}${absValue}</span>;
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600" onClick={() => handleClose({ orderId: trade.orderId })}>
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
            <TableCaption>A list of your recent closed orders</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Leverage</TableHead>
                <TableHead>Opening Price</TableHead>
                <TableHead>Closing Price</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Pnl (ROI%)</TableHead>
                <TableHead className="text-right">closed-at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closedTrades.length > 0 ? (
                closedTrades.map((trade) => (
                  <TableRow key={trade.orderId}>
                    <TableCell className="font-medium">{trade.asset}</TableCell>
                    <TableCell>{trade.type}</TableCell>
                    <TableCell>{trade.quantity?.toFixed(4) || "-"}</TableCell>
                    <TableCell>{trade.leverage}x</TableCell>
                    <TableCell>${((Number(trade.openPrice)) / 10000).toFixed(2)}</TableCell>
                    <TableCell>${((Number(trade.closePrice)) / 10000).toFixed(2)}</TableCell>
                    <TableCell>${(trade.margin / 10000).toFixed(2)}</TableCell>
                    <TableCell>{(() => {
                      const pnl = trade.pnl / 10000;
                      const color = pnl >= 0 ? "text-green-500" : "text-red-500";
                      const sign = pnl >= 0 ? "+" : "-";
                      const absValue = Math.abs(pnl).toFixed(2);

                      return <span className={color}>{sign}${absValue}</span>;
                    })()}</TableCell>
                    <TableCell className="text-right">23420948</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No closed orders
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </TabsContent>
    </Tabs>
  )
}