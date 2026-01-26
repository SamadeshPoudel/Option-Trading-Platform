import { useAssetStore, useTradeStore, type Asset } from "store/useStore"
import { Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { SiDelta } from "react-icons/si";
import { useEffect, useState } from "react";

const Navbar = () => {
  const openTrades = useTradeStore(state => state.openTrades);
  const livePrices = useAssetStore(state => state.livePrices);
  const [balance, setBalance] = useState(0)

  // Dummy user data (replace with real data later)
  const user = {
    name: "Samadesh",
    // balance: 10000.00,
  };

  const fetchBalance = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/balance?userId=03d60c5f-99ef-4812-bfc1-49e52d44b3c5`, {
      headers: {
        "Content-Type": "application/json"
      },
      // body: JSON.stringify({
      //   "userId": "03d60c5f-99ef-4812-bfc1-49e52d44b3c5"
      // })
    })
    const data = await res.json();
    // console.log("users data from fetchBalance:", data);
    setBalance(data.data);
  }
  
  useEffect(() => {
    setInterval(()=>{
      fetchBalance();
    },2000)
  }, [])
  

  // Calculate unrealised PnL
  const calculateUnrealisedPnL = () => {
    if (openTrades.length === 0) return { value: 0, isValid: true };

    let totalPnL = 0;
    let allPricesAvailable = true;

    for (const trade of openTrades) {
      const asset = trade.asset as Asset;
      const currentPrice = trade.type === "buy"
        ? livePrices[asset]?.bid
        : livePrices[asset]?.ask;
      const openPrice = Number(trade.openPrice) / 10000;

      if (!currentPrice || !trade.quantity) {
        allPricesAvailable = false;
        continue;
      }

      const pnl = trade.type === "buy"
        ? (currentPrice - openPrice) * trade.quantity
        : (openPrice - currentPrice) * trade.quantity;

      totalPnL += pnl;
    }

    return { value: totalPnL, isValid: allPricesAvailable };
  };

  const { value: unrealisedPnL, isValid } = calculateUnrealisedPnL();
  const isPositive = unrealisedPnL >= 0;
  const pnlColor = isPositive ? "text-emerald-400" : "text-red-400";
  const pnlBgColor = isPositive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <nav className="flex justify-between items-center bg-[#0a0a0d] text-white px-4 h-14 flex-shrink-0 border-b border-[#1a1a1f]">
      {/* Left: Logo */}
      <div className="flex items-center">
        <SiDelta className="size-32" />
      </div>

      {/* Right: PnL, Balance, Profile */}
      <div className="flex items-center gap-3">

        {/* Unrealised PnL */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg `}>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              Unrealised
            </span>
          </div>
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
          )}
          <span className={`text-sm font-semibold ${pnlColor}`}>
            {!isValid ? (
              "--"
            ) : (
              <>
                {isPositive ? "+" : ""}${unrealisedPnL.toFixed(2)}
              </>
            )}

          </span>

        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[#2a2a30]" />

        {/* Balance */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          <Wallet className="w-3.5 h-3.5 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 tracking-wider leading-none">
              Net Balance
            </span>
            <span className="text-sm font-semibold text-yellow-400">
              {/* ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} */}
              ${(balance/10000).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-[#2a2a30]" />

        {/* User Profile */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-[#1a1a1f] px-2 py-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="font-semibold text-sm text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          {/* <div className="flex flex-col">
            <span className="text-xs font-medium text-white leading-none">
              {user.name}
            </span>
            <span className="text-[10px] text-gray-500 leading-none mt-0.5">
              Trader
            </span>
          </div> */}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
