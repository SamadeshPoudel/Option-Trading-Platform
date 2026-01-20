import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect } from "react"
import  {useAssetStore}  from "store/useStore"

// export const useAssetStore = create<AssetState>((set) => ({
//   selectedSymbol: "SOL_USDC",
//   livePrices: {},   
//   setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
//   updatePrice: (symbol, price) =>
//     set((state) => ({
//       livePrices: { ...state.livePrices, [symbol]: price },
//     })),
// }));

const PriceBoardDropdown = () => {
  const setSelectedSymbol = useAssetStore(state=> state.setSelectedSymbol)
  const updatePrice = useAssetStore(state => state.updatePrice)
  
  // useEffect(()=>{
  //   const ws = new WebSocket(import.meta.env.VITE_WS_BASE_URL);

  //   ws.onmessage=(event)=>{
  //     console.log("event from websocket poller", event)
  //   }
  // })

  return (
   <DropdownMenu>
  <DropdownMenuTrigger className="bg-[#202127] p-2 m-2 rounded-sm cursor-pointer h-12">
    <div className="flex justify-between text-m text-white font-semibold">
      <p className="">SOL_USDC</p>
      <p>150</p>
    </div>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Team</DropdownMenuItem>
    <DropdownMenuItem>Subscription</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
  )
}

export default PriceBoardDropdown
