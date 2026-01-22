import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect } from "react"
import { useAssetStore, type Asset } from "store/useStore"

const PriceBoardDropdown = () => {
  const selectedSymbol = useAssetStore(state => state.selectedSymbol)
  const setSelectedSymbol = useAssetStore(state => state.setSelectedSymbol)
  const updatePrice = useAssetStore(state => state.updatePrice)
  const livePrices = useAssetStore(state => state.livePrices);
  const price = useAssetStore((state) => selectedSymbol ? state.livePrices[selectedSymbol] : null);
  // console.log("price:", price)

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_BASE_URL);
    // console.log(object)

    ws.onopen = () => {
      console.log("ws connection establised to poller ws for latest price!")

      ws.send(JSON.stringify({
        "action": "SUBSCRIBE",
        "asset": selectedSymbol
      }))
    }
    // {"action":"PRICE_UPDATE","asset":"SOL","askWithSpread":1277021,"bidWithSpread":1279378,"decimal":4}
    ws.onmessage = (event) => {
      // console.log("event from websocket poller", event.data)
      const parsedData = JSON.parse(event.data);
      // console.log("parsed Data", parsedData)
      // updatePrice(parsedData.asset, parsedData.bidWithSpread)
      updatePrice(parsedData.asset, {
        bid: parsedData.bidWithSpread / 10000, // Divide by 10^4 for decimal formatting
        ask: parsedData.askWithSpread / 10000
      });
    }
  }, [selectedSymbol])

function handleClick(e:React.MouseEvent<HTMLDivElement>){
  const asset = e.currentTarget.getAttribute('data-asset') as Asset;
  if(asset){
    setSelectedSymbol(asset);
  }
}
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-[#202127] p-2 m-2 rounded-sm cursor-pointer h-12">
        <div className="flex justify-between text-m text-white font-semibold">
          <p className="">{selectedSymbol}</p>
          <p>{price?.bid.toFixed(2)} </p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Assets</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleClick} data-asset="SOL">SOLANA</DropdownMenuItem>
        <DropdownMenuItem onClick={handleClick} data-asset="BTC">BITCOIN</DropdownMenuItem>
        <DropdownMenuItem onClick={handleClick} data-asset="ETH">ETHEREUM</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PriceBoardDropdown
