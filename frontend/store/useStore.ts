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
  asset: string,
  type: "buy" | "sell"
  orderId: string
  openingPrice:string;
  slippage: number,
}

type OrderState = {
  openTrades: Order[],
  closedTrades: any[],
  setOpenTrades: (trade:Order)=>void;
  fetchOrders:()=>void;
  removeTrade: (id:string)=> void; 
  clearTrade: ()=> void;
  loading: boolean;
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
       const res = await apiRequest<OpenOrderResponse>('api/open-orders',"GET");
       const closeTradeRes = await apiRequest<ClosedTradesResponse>('/trade/closed-orders',"GET");
       const closedTrades = await closeTradeRes.closedOrders;
       const data = await res.message as Order[];
      //  console.log("yaha dai",data)
        set({openTrades:data,loading:false})
        set({closedTrades:closedTrades,loading:false})
      }catch(err){
          console.error('Failed to fetch orders',err)
          set({loading:false})
      }
    },

  

}))
