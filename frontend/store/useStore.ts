import { apiRequest } from '@/lib/api-client';
import { create } from 'zustand'

export type Asset = "ETH" | "SOL" | "BTC"

export type Price = {
  bid: number;
  ask: number;
};

type AssetState = {
  selectedSymbol: Asset;   
  livePrices: Record<string, Price>;
  setSelectedSymbol: (symbol: Asset) => void;
  updatePrice: (symbol: string, price: Price) => void;
};

  
type Order = {
  margin: number,
  leverage:number,
  quantity?:number,
  asset: string,
  type: "buy" | "sell"
  orderId: string
  openPrice:string;
  slippage: number,
  status?:string
}



export const useAssetStore = create<AssetState>((set) => ({
  selectedSymbol: "SOL",
  livePrices: {},
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  updatePrice: (symbol, price) =>
    set((state) => ({
      livePrices: { 
        ...state.livePrices,
        [symbol]: price
      },
    })
  ),

}));

type OrderState = {
  openTrades: Order[],
  closedTrades: any[],
  setOpenTrades: (trade:Order)=>void;
  fetchOrders:()=>void;
  removeTrade: (id:string)=> void; 
  clearTrade: ()=> void;
  loading: boolean;
}

export const useTradeStore = create<OrderState>((set)=>({
  openTrades:[],
  closedTrades:[],
  loading:false,
  setOpenTrades:(trade) =>
    set((state)=>({
      openTrades: [...state.openTrades,trade]
    })),

  fetchOrders: async () =>{
    set({
      loading:true
    })
    try {
     const res = await apiRequest(`/api/open-orders?userId=03d60c5f-99ef-4812-bfc1-49e52d44b3c5`,"GET");
     const closeTradeRes = await apiRequest(`/api/closed-orders?userId=03d60c5f-99ef-4812-bfc1-49e52d44b3c5`,"GET"); 
     
     const openOrders = res.data;
     const closedOrders = closeTradeRes.closedOrder;
     
      set({openTrades: openOrders, closedTrades: closedOrders, loading:false})
    }catch(err){
        console.error('Failed to fetch orders',err)
        set({loading:false})
    }
  },
    removeTrade: (id) =>
    set((state)=>({
      openTrades: state.openTrades.filter((trade)=>{
      return  trade.orderId !== id;
      })
    })),
    clearTrade:()=>set({
    openTrades: []
  })
}))
