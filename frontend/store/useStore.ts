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
  subscribedAsset: string[];
  setSubscribedAsset: (asset: string[]) => void;
  setSelectedSymbol: (symbol: Asset) => void;
  updatePrice: (symbol: string, price: Price) => void;
};


type Order = {
  margin: number,
  leverage: number,
  quantity?: number,
  asset: string,
  type: "buy" | "sell"
  orderId: string
  openPrice: string;
  slippage: number,
  status?: string
}

type OrderState = {
  openTrades: Order[],
  closedTrades: any[],
  setOpenTrades: (trade: Order) => void;
  fetchOrders: (userId: string) => void;
  removeTrade: (id: string) => void;
  clearTrade: () => void;
  loading: boolean;
}

type ChartState = {
  selectedInterval: string;
  selectedPeriod: string | null;
  setSelectedInterval: (interval: string) => void;
  setSelectedPeriod: (period: string | null) => void;
};

export const useAssetStore = create<AssetState>((set) => ({
  selectedSymbol: "SOL",
  livePrices: {},
  subscribedAsset: [],
  setSubscribedAsset: (asset) => set({ subscribedAsset: asset }),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  updatePrice: (symbol, price) =>
    set((state) => ({
      livePrices: {
        ...state.livePrices,
        [symbol]: price
      },
    })
    )

}));


export const useTradeStore = create<OrderState>((set) => ({
  openTrades: [],
  closedTrades: [],
  loading: false,
  setOpenTrades: (trade) =>
    set((state) => ({
      openTrades: [...state.openTrades, trade]
    })),

  fetchOrders: async (userId: string) => {
    set({
      loading: true
    })
    try {
      const res = await apiRequest(`/api/open-orders?userId=${userId}`, "GET");
      const closeTradeRes = await apiRequest(`/api/closed-orders?userId=${userId}`, "GET");

      const openOrders = res.data || [];
      const closedOrders = closeTradeRes.closedOrder || [];

      set({ openTrades: openOrders, closedTrades: closedOrders, loading: false })
    } catch (err) {
      console.error('Failed to fetch orders', err)
      set({ openTrades: [], closedTrades: [], loading: false });
    }
  },
  removeTrade: (id) =>
    set((state) => ({
      openTrades: state.openTrades.filter((trade) => {
        return trade.orderId !== id;
      })
    })),
  clearTrade: () => set({
    openTrades: []
  })
}))

export const useChartStore = create<ChartState>((set) => ({
  selectedInterval: "30m", //1m
  selectedPeriod: null, //1768897800
  setSelectedInterval: (interval) => {
    set({ selectedInterval: interval, selectedPeriod: null })
  },
  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period })
  }
}))