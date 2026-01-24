import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useRef, useState } from "react"
import { useAssetStore, type Asset } from "store/useStore"
import { ChevronDown } from "lucide-react"
import solanaLogo from "../assets/SolanaLogo.svg"
import ethereumLogo from "../assets/EthereumLogo.svg"
import bitcoinLogo from "../assets/bitcoinLogo.svg"

// asset config
const assetConfig: Record<Asset, { name: string; logo: string }> = {
  SOL: { name: "Solana", logo: solanaLogo },
  BTC: { name: "Bitcoin", logo: bitcoinLogo },
  ETH: { name: "Ethereum", logo: ethereumLogo },
}

const PriceBoardDropdown = () => {
  const selectedSymbol = useAssetStore(state => state.selectedSymbol)
  const setSelectedSymbol = useAssetStore(state => state.setSelectedSymbol)
  const updatePrice = useAssetStore(state => state.updatePrice)
  const price = useAssetStore((state) => selectedSymbol ? state.livePrices[selectedSymbol] : null)
  const [isOpen, setIsOpen] = useState(false)

  // tracking previous bid to detect direction and show color of the price red green or whatever I want
  const prevBidRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const [direction, setDirection] = useState<"up" | "down" | "neutral">("neutral")

  useEffect(() => {
    if (price?.bid != null) {
      const prev = prevBidRef.current
      const curr = price.bid

      if (prev != null) {
        if (curr > prev) setDirection("up")
        else if (curr < prev) setDirection("down")
        else setDirection("neutral")
      }

      prevBidRef.current = curr

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = window.setTimeout(() => {
        setDirection("neutral")
        timeoutRef.current = null
      }, 2000)
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [price?.bid])

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_BASE_URL)

    ws.onopen = () => {
      ws.send(JSON.stringify({
        "action": "SUBSCRIBE",
        "asset": selectedSymbol
      }))
    }

    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data)
        if (!parsedData || !parsedData.asset) return

        updatePrice(parsedData.asset, {
          bid: parsedData.bidWithSpread / 10000,
          ask: parsedData.askWithSpread / 10000
        })
      } catch (err) {
        console.warn("Invalid WS message:", err)
      }
    }

    ws.onerror = (err) => {
      console.error("Price WS error:", err)
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [selectedSymbol, updatePrice])

  function handleClick(asset: Asset) {
    setSelectedSymbol(asset)
    prevBidRef.current = null
    setDirection("neutral")
  }

  const priceClass =
    direction === "up" ? "text-emerald-400" :
    direction === "down" ? "text-red-400" :
    "text-white"

  const currentAsset = assetConfig[selectedSymbol]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="bg-[#1a1a1f] hover:bg-[#252529] p-3 m-2 rounded-lg cursor-pointer transition-all duration-200 outline-none">
        <div className="flex items-center justify-between gap-6 min-w-[180px]">
          {/* Left: Logo + Symbol */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8  flex items-center justify-center p-1.5">
              <img 
                src={currentAsset.logo} 
                alt={`${selectedSymbol}-logo`} 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-white font-semibold text-sm">{selectedSymbol}</span>
              <span className="text-gray-500 text-xs">{currentAsset.name}</span>
            </div>
          </div>

          {/* Right: Price + Arrow */}
          <div className="flex items-center gap-2">
            <span className={`font-bold text-lg transition-colors duration-300 ${priceClass}`}>
              {price ? `$${price.bid.toFixed(2)}` : "-"}
            </span>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-[#1a1a1f] border border-[#2a2a30] rounded-lg p-1 min-w-[200px]">
        <DropdownMenuLabel className="text-gray-400 text-xs uppercase tracking-wider px-2 py-1.5">
          Select Asset
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#2a2a30]" />
        
        {(Object.keys(assetConfig) as Asset[]).map((asset) => {
          const config = assetConfig[asset]
          const isSelected = selectedSymbol === asset
          
          return (
            <DropdownMenuItem
              key={asset}
              onClick={() => handleClick(asset)}
              className={`
                flex items-center gap-3 px-2 py-2.5 rounded-md cursor-pointer transition-colors duration-150
                ${isSelected 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-white hover:bg-[#252529]'
                }
              `}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center p-1.5 ${isSelected ? 'bg-emerald-500/20' : 'bg-[#2a2a30]'}`}>
                <img 
                  src={config.logo} 
                  alt={`${asset}-logo`} 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{asset}</span>
                <span className={`text-xs ${isSelected ? 'text-emerald-400/70' : 'text-gray-500'}`}>
                  {config.name}
                </span>
              </div>
              {isSelected && (
                <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PriceBoardDropdown