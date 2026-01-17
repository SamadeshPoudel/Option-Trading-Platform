import { create } from 'zustand'
// import { Asset } from '../types/type';

export type Asset = "ETH_USDC" | "SOL_USDC" | "BTC_USDC"
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

export const useAssetStore = create<AssetState>((set) => ({
  selectedSymbol: "SOL_USDC",
  livePrices: {},   
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  updatePrice: (symbol, price) =>
    set((state) => ({
      livePrices: { ...state.livePrices, [symbol]: price },
    })),
}));
