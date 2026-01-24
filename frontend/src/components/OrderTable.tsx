import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useAssetStore, useTradeStore, type Asset } from "store/useStore"
import { useEffect } from "react"
import solanaLogo from "../assets/SolanaLogo.svg"
import ethereumLogo from "../assets/EthereumLogo.svg"
import bitcoinLogo from "../assets/bitcoinLogo.svg"

// Asset logos config
const assetLogos: Record<Asset, string> = {
  SOL: solanaLogo,
  BTC: bitcoinLogo,
  ETH: ethereumLogo,
}

// Define column widths for consistency
const columnWidths = {
  asset: "w-[12%]",
  side: "w-[8%]",
  qty: "w-[12%]",
  leverage: "w-[10%]",
  entry: "w-[12%]",
  exit: "w-[12%]",
  margin: "w-[12%]",
  pnl: "w-[14%]",
  action: "w-[10%]",
  closedAt: "w-[14%]",
}

export function OrderTable() {
  const openTrades = useTradeStore(state => state.openTrades)
  const closedTrades = useTradeStore(state => state.closedTrades);
  const fetchOrders = useTradeStore(state => state.fetchOrders);
  const livePrices = useAssetStore(state => state.livePrices);

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

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
    <div className="flex flex-col h-full overflow-hidden bg-[#14151B] rounded-lg border border-[#2a2a30]">
      <Tabs defaultValue="open-order" className="flex flex-col h-full overflow-hidden">
        
        {/* Tabs Header - Always Visible */}
        <div className="flex-shrink-0 border-b border-[#2a2a30] px-3 py-2 bg-[#14151B]">
          <TabsList className="h-8 bg-[#1a1a1f] p-1 rounded-md">
            <TabsTrigger 
              value="open-order" 
              className="text-gray-400 text-xs data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none rounded px-3 py-1 cursor-pointer transition-all"
            >
              Open Orders
            </TabsTrigger>
            <TabsTrigger 
              value="closed-order" 
              className="text-gray-400 text-xs data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none rounded px-3 py-1 cursor-pointer transition-all"
            >
              Closed Orders
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Open Orders Tab */}
        <TabsContent value="open-order" className="flex-1 overflow-hidden m-0 flex flex-col min-h-0">
          {/* Table Header - Always Visible */}
          <div className="flex-shrink-0 bg-[#1a1a1f] border-b border-[#2a2a30]">
            <div className="flex w-full">
              <div className={`${columnWidths.asset} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Asset</div>
              <div className={`${columnWidths.side} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Side</div>
              <div className={`${columnWidths.qty} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Qty</div>
              <div className={`${columnWidths.leverage} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Leverage</div>
              <div className={`${columnWidths.entry} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Entry</div>
              <div className={`${columnWidths.margin} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Margin</div>
              <div className={`${columnWidths.pnl} text-left text-gray-400 text-xs font-medium py-2 px-3`}>PnL</div>
              <div className={`${columnWidths.action} text-right text-gray-400 text-xs font-medium py-2 px-3 pr-5`}>Action</div>
            </div>
          </div>

          {/* Table Body - Scrollable with custom scrollbar */}
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
            {openTrades.length > 0 ? (
              openTrades.map((trade) => (
                <div 
                  key={trade.orderId} 
                  className="flex w-full border-b border-[#2a2a30] hover:bg-[#1a1a1f] transition-colors"
                >
                  {/* ...existing row content... */}
                  <div className={`${columnWidths.asset} py-2 px-3`}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex-shrink-0">
                        <img 
                          src={assetLogos[trade.asset as Asset]} 
                          alt={`${trade.asset}-logo`} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <span className="font-medium text-white text-xs">{trade.asset}</span>
                    </div>
                  </div>
                  <div className={`${columnWidths.side} py-2 px-3`}>
                    <span className={`text-xs font-medium ${trade.type === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.type === 'buy' ? 'Long' : 'Short'}
                    </span>
                  </div>
                  <div className={`${columnWidths.qty} text-gray-300 text-xs py-2 px-3`}>
                    {trade.quantity?.toFixed(4) || "-"}
                  </div>
                  <div className={`${columnWidths.leverage} py-2 px-3`}>
                    <span className="text-amber-400 text-xs font-medium">{trade.leverage}x</span>
                  </div>
                  <div className={`${columnWidths.entry} text-gray-300 text-xs py-2 px-3`}>
                    ${((Number(trade.openPrice)) / 10000).toFixed(2)}
                  </div>
                  <div className={`${columnWidths.margin} text-gray-300 text-xs py-2 px-3`}>
                    ${(trade.margin / 10000).toFixed(2)}
                  </div>
                  <div className={`${columnWidths.pnl} py-2 px-3`}>
                    {(() => {
                      const currentPrice = livePrices[trade.asset as Asset]?.bid;
                      const openPrice = Number(trade.openPrice) / 10000;

                      if (!currentPrice || !trade.quantity) {
                        return <span className="text-gray-500 text-xs">--</span>;
                      }

                      const pnl = trade.type === "buy"
                        ? (currentPrice - openPrice) * trade.quantity
                        : (openPrice - currentPrice) * trade.quantity;

                      const roi = ((pnl / (trade.margin / 10000)) * 100).toFixed(2);
                      const color = pnl >= 0 ? "text-emerald-400" : "text-red-400";
                      const sign = pnl >= 0 ? "+" : "";

                      return (
                        <div className={`${color} text-xs font-medium`}>
                          <span>{sign}${pnl.toFixed(2)}</span>
                          <span className="text-[10px] ml-1">({sign}{roi}%)</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className={`${columnWidths.action} text-right py-2 px-3`}>
                    <button 
                      className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-medium hover:bg-red-500/30 transition-colors border border-red-500/30 cursor-pointer" 
                      onClick={() => handleClose({ orderId: trade.orderId })}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-6">
                <span className="text-gray-500 text-xs">No open orders</span>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Closed Orders Tab */}
        <TabsContent value="closed-order" className="flex-1 overflow-hidden m-0 flex flex-col min-h-0">
          {/* Table Header - Always Visible */}
          <div className="flex-shrink-0 bg-[#1a1a1f] border-b border-[#2a2a30]">
            <div className="flex w-full">
              <div className={`${columnWidths.asset} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Asset</div>
              <div className={`${columnWidths.side} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Side</div>
              <div className={`${columnWidths.qty} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Qty</div>
              <div className={`${columnWidths.leverage} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Leverage</div>
              <div className={`${columnWidths.entry} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Entry</div>
              <div className={`${columnWidths.exit} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Exit</div>
              <div className={`${columnWidths.margin} text-left text-gray-400 text-xs font-medium py-2 px-3`}>Margin</div>
              <div className={`${columnWidths.pnl} text-left text-gray-400 text-xs font-medium py-2 px-3`}>PnL</div>
              <div className={`${columnWidths.closedAt} text-right text-gray-400 text-xs font-medium py-2 px-3 pr-5`}>Closed At</div>
            </div>
          </div>

          {/* Table Body - Scrollable with custom scrollbar */}
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
            {closedTrades.length > 0 ? (
              closedTrades.map((trade) => (
                <div 
                  key={trade.orderId} 
                  className="flex w-full border-b border-[#2a2a30] hover:bg-[#1a1a1f] transition-colors"
                >
                  <div className={`${columnWidths.asset} py-2 px-3`}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex-shrink-0">
                        <img 
                          src={assetLogos[trade.asset as Asset]} 
                          alt={`${trade.asset}-logo`} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <span className="font-medium text-white text-xs">{trade.asset}</span>
                    </div>
                  </div>
                  <div className={`${columnWidths.side} py-2 px-3`}>
                    <span className={`text-xs font-medium ${trade.type === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.type === 'buy' ? 'Long' : 'Short'}
                    </span>
                  </div>
                  <div className={`${columnWidths.qty} text-gray-300 text-xs py-2 px-3`}>
                    {trade.quantity?.toFixed(4) || "-"}
                  </div>
                  <div className={`${columnWidths.leverage} py-2 px-3`}>
                    <span className="text-amber-400 text-xs font-medium">{trade.leverage}x</span>
                  </div>
                  <div className={`${columnWidths.entry} text-gray-300 text-xs py-2 px-3`}>
                    ${((Number(trade.openPrice)) / 10000).toFixed(2)}
                  </div>
                  <div className={`${columnWidths.exit} text-gray-300 text-xs py-2 px-3`}>
                    ${((Number(trade.closePrice)) / 10000).toFixed(2)}
                  </div>
                  <div className={`${columnWidths.margin} text-gray-300 text-xs py-2 px-3`}>
                    ${(trade.margin / 10000).toFixed(2)}
                  </div>
                  <div className={`${columnWidths.pnl} py-2 px-3`}>
                    {(() => {
                      const pnl = trade.pnl / 10000;
                      const roi = ((pnl / (trade.margin / 10000)) * 100).toFixed(2);
                      const color = pnl >= 0 ? "text-emerald-400" : "text-red-400";
                      const sign = pnl >= 0 ? "+" : "";

                      return (
                        <div className={`${color} text-xs font-medium`}>
                          <span>{sign}${pnl.toFixed(2)}</span>
                          <span className="text-[10px] ml-1">({sign}{roi}%)</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className={`${columnWidths.closedAt} text-right text-gray-400 text-[10px] py-2 px-3`}>
                    {trade.closedAt ? new Date(trade.closedAt).toLocaleString() : '-'}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-6">
                <span className="text-gray-500 text-xs">No closed orders</span>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}