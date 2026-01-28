import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useAssetStore, useTradeStore } from "store/useStore"
import { useEffect, useState } from "react"
import { Card } from "./ui/card"
import { Info } from "lucide-react"
import usdLogo from "../assets/UsdLogo.svg"
import solanaLogo from "../assets/SolanaLogo.svg"
import ethereumLogo from "../assets/EthereumLogo.svg"
import bitcoinLogo from "../assets/bitcoinLogo.svg"
import type { Asset } from "store/useStore"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

// Asset logos config
const assetLogos: Record<Asset, string> = {
  SOL: solanaLogo,
  BTC: bitcoinLogo,
  ETH: ethereumLogo,
}

const SellTab = () => {
  const selectedSymbol = useAssetStore(state => state.selectedSymbol);
  const livePrice = useAssetStore(state => state.livePrices[selectedSymbol]);
  const fetchOrders = useTradeStore(state => state.fetchOrders)

  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(livePrice?.ask || 100);
  const [leverage, setLeverage] = useState(1);
  const [isAmountFocused, setIsAmountFocused] = useState(false);

  const { data: session } = authClient.useSession()


  // Calculate quantity whenever margin, leverage, or price changes
  useEffect(() => {
    if (livePrice?.ask) {
      const totalPosition = amount * leverage;
      const calculatedQuantity = totalPosition / livePrice.ask;
      setQuantity(calculatedQuantity);
    }
  }, [amount, leverage, livePrice?.ask]);

  const handleClick = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/trade/create`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: session?.user?.id,
        asset: selectedSymbol,
        type: "sell",
        margin: amount,
        leverage: leverage
      })
    })
    if (res.status === 200) {
      toast.success("order placed successfully!")
    } else if (res.status === 400) {
      toast.error("Insufficient balance!")
    } else if (res.status === 401) {
      toast.warning("sign in to place an order")
    } else {
      toast.error("something went wrong, please try later")
    }
    const data = await res.json();
    fetchOrders(session?.user?.id!)
    console.log("data from /trade/create", data);
  }

  return (
    <div className="text-white flex flex-col gap-3 mx-2">

      {/* Sell Price - Read Only */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400">Sell price</p>
        <Card className="h-10 bg-[#202127] border-[#2a2a30] px-3 py-2 rounded-sm">
          <div className="flex justify-between items-center h-full w-full">
            <span className="text-base font-semibold text-white">
              {livePrice?.ask?.toFixed(2) || "Loading..."}
            </span>
            <div className="w-5 h-5 flex items-center justify-center">
              <img src={usdLogo} alt="usd-logo" className="w-full h-full object-contain" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quantity - Auto Calculated (Read Only) */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400">Quantity</p>
        <Card className="h-10 bg-[#202127] border-[#2a2a30] px-3 py-2 rounded-sm">
          <div className="flex justify-between items-center h-full w-full">
            <span className="text-base font-semibold text-white">
              {quantity.toFixed(4)}
            </span>
            <div className="w-5 h-5 flex items-center justify-center">
              <img
                src={assetLogos[selectedSymbol]}
                alt={`${selectedSymbol}-logo`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Leverage Slider */}
      <div className="flex flex-col gap-2 py-1">
        <div className="flex justify-between">
          <p className="text-xs text-gray-400">Leverage</p>
          <p className="font-bold text-sm text-red-400">{leverage}x</p>
        </div>
        <Slider
          value={[leverage]}
          max={10}
          min={1}
          step={1}
          onValueChange={(v) => setLeverage(v[0])}
          className="cursor-pointer"
        />
      </div>

      {/* Amount - User Input */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400">Amount</p>
        <Card
          className={`
            h-10 bg-[#202127] border-[#2a2a30] px-3 py-2 transition-all duration-200 rounded-sm
            ${isAmountFocused ? 'ring-1 ring-red-500/50 border-red-500/50' : ''}
          `}
        >
          <div className="flex justify-between items-center h-full w-full">
            <input
              type="number"
              value={amount === 0 && isAmountFocused ? '' : amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setAmount(0);
                } else {
                  setAmount(Number(val));
                }
              }}
              onFocus={() => setIsAmountFocused(true)}
              onBlur={() => setIsAmountFocused(false)}
              min={0}
              placeholder="0"
              className="
                bg-transparent text-base font-semibold text-white w-full
                outline-none border-none focus:outline-none focus:ring-0
                [appearance:textfield] 
                [&::-webkit-outer-spin-button]:appearance-none 
                [&::-webkit-inner-spin-button]:appearance-none
              "
            />
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <img src={usdLogo} alt="usd-logo" className="w-full h-full object-contain" />
            </div>
          </div>
        </Card>
      </div>

      {/* Sell Button */}
      <div className="pt-1">
        <Button
          variant="outline"
          className="text-white bg-red-600 w-full hover:bg-red-500 hover:text-white transition-all duration-200 border-none cursor-pointer h-9 text-sm font-sm"
          disabled={!livePrice?.ask}
          onClick={handleClick}
        >
          Sell {quantity.toFixed(2)} {selectedSymbol} @ ${livePrice?.ask?.toFixed(2)}
        </Button>
      </div>

      {/* Overview Card */}
      <Card className="p-2 flex flex-col gap-2 bg-[#202127] border-[#2a2a30] text-white mt-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-400 font-medium">Overview</p>
          <div className="w-4 h-4  flex items-center justify-center">
            <Info className="w-3 h-3 text-gray-500" />
          </div>
        </div>
        <div className="flex justify-between text-xs">
          <p className="text-gray-400">Asset</p>
          <div className="flex items-center gap-1.5">
            <img
              src={assetLogos[selectedSymbol]}
              alt={`${selectedSymbol}-logo`}
              className="w-3.5 h-3.5 object-contain"
            />
            <p className="font-medium">{selectedSymbol}</p>
          </div>
        </div>
        <div className="flex justify-between text-xs">
          <p className="text-gray-400">Margin / Amount</p>
          <p className="font-medium">${amount.toFixed(2)}</p>
        </div>
        <div className="flex justify-between text-xs">
          <p className="text-gray-400">Leverage</p>
          <p className="font-medium text-red-400">{leverage}x</p>
        </div>
        <div className="flex justify-between text-xs">
          <p className="text-gray-400">Quantity</p>
          <p className="font-medium">{quantity.toFixed(4)}</p>
        </div>
        <div className="flex justify-between text-xs border-t border-[#2a2a30] pt-1.5 mt-0.5">
          <p className="text-gray-400">Platform fee</p>
          <p className="font-medium">${(amount * 0.01).toFixed(2)}</p>
        </div>
      </Card>

    </div>
  )
}

export default SellTab