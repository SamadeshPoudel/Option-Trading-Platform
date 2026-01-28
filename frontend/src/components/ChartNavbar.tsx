import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { useChartStore, useAssetStore, type Asset } from "store/useStore"
import { useEffect, useState } from "react"
import solanaLogo from "../assets/SolanaLogo.svg"
import ethereumLogo from "../assets/EthereumLogo.svg"
import bitcoinLogo from "../assets/bitcoinLogo.svg"

// Asset config
const assetConfig: Record<Asset, { name: string; logo: string }> = {
  SOL: { name: "SOL", logo: solanaLogo },
  BTC: { name: "BTC", logo: bitcoinLogo },
  ETH: { name: "ETH", logo: ethereumLogo },
}

// 24h price change type
type PriceChange = {
  symbol: Asset;
  changePercent: number;
}

export function ChartNavbar() {
  const selectedInterval = useChartStore((state) => state.selectedInterval);
  const selectedPeriod = useChartStore((state) => state.selectedPeriod);
  const setSelectedInterval = useChartStore((state) => state.setSelectedInterval);
  const setSelectedPeriod = useChartStore((state) => state.setSelectedPeriod);

  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([]);

  const minuteIntervals = ["1m", "3m", "5m", "30m"];
  const periodOptions = [
    { label: "1H", seconds: 60 * 60 },
    { label: "1D", seconds: 24 * 60 * 60 },
    { label: "7D", seconds: 7 * 24 * 60 * 60 }
  ];

  // Fetch 24h price changes for all assets
  useEffect(() => {
    const fetchPriceChanges = async () => {
      try {
        const assets: Asset[] = ["SOL", "BTC", "ETH"];
        const changes: PriceChange[] = [];

        for (const asset of assets) {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_BASE_URL}/api/candles?symbol=${asset}_USDC&interval=1d&startTime=${Math.floor(Date.now() / 1000) - 86400 * 2}`
          );
          const data = await res.json();

          if (data && data.length >= 2) {
            const yesterday = parseFloat(data[data.length - 2].close);
            const today = parseFloat(data[data.length - 1].close);
            const changePercent = ((today - yesterday) / yesterday) * 100;

            changes.push({ symbol: asset, changePercent });
          } else if (data && data.length === 1) {
            // If only one candle, use open vs close
            const open = parseFloat(data[0].open);
            const close = parseFloat(data[0].close);
            const changePercent = ((close - open) / open) * 100;

            changes.push({ symbol: asset, changePercent });
          }
        }

        setPriceChanges(changes);
      } catch (error) {
        console.error("Failed to fetch price changes:", error);
      }
    };

    fetchPriceChanges();

    // Refresh every 5 minutes
    const interval = setInterval(fetchPriceChanges, 2000); //5 * 60 * 1000
    return () => clearInterval(interval);
  }, []);

  // Find which period label is currently active
  const getActivePeriodLabel = () => {
    if (!selectedPeriod) return null;
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(selectedPeriod);

    for (const p of periodOptions) {
      if (Math.abs(diff - p.seconds) < 60) return p.label;
    }
    return null;
  };

  const activePeriodLabel = getActivePeriodLabel();

  const handleInterval = (interval: string) => {
    setSelectedInterval(interval);
  };

  const handlePeriod = (label: string, seconds: number) => {
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - seconds;

    if (activePeriodLabel === label) {
      setSelectedPeriod(null);
    } else {
      setSelectedPeriod(String(startTime));
    }
  };

  // Button styles
  // const activeStyle = "bg-white text-black hover:bg-gray-200 hover:text-black";
  // const inactiveStyle = "bg-[#1a1a1f] text-gray-400 hover:bg-[#252529] hover:text-white border-[#2a2a30]";

  const activeStyle = "bg-[#2a2a30] text-white hover:bg-[#353540] border-[#3a3a45]";
  const inactiveStyle = "bg-[#1a1a1f] text-gray-400 hover:bg-[#252529] hover:text-white border-[#2a2a30]";

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1.5 md:gap-0">
      {/* Row 1: Interval + Period buttons (same line on all screens) */}
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {/* Interval Buttons */}
        <ButtonGroup>
          {minuteIntervals.map((interval) => (
            <Button
              key={interval}
              variant="outline"
              size="sm"
              onClick={() => handleInterval(interval)}
              className={`text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2 md:px-2.5 border-0 cursor-pointer transition-all ${selectedInterval === interval ? activeStyle : inactiveStyle
                }`}
            >
              {interval}
            </Button>
          ))}
        </ButtonGroup>

        {/* Divider - hidden on mobile */}
        <div className="hidden md:block h-5 w-px bg-[#2a2a30]" />

        {/* 24h Price Changes - DESKTOP ONLY (inline with buttons) */}
        <div className="hidden md:flex items-center gap-3 overflow-x-auto">
          <span className="text-gray-500 text-[10px] uppercase tracking-wider font-medium flex-shrink-0">
            24h
          </span>
          {priceChanges.map((change) => {
            const isPositive = change.changePercent >= 0;
            const color = isPositive ? "text-emerald-400" : "text-red-400";
            const sign = isPositive ? "+" : "";
            const config = assetConfig[change.symbol];

            return (
              <div
                key={change.symbol}
                className="flex items-center gap-1.5 bg-[#1a1a1f] px-2 py-1 rounded-md flex-shrink-0"
              >
                <img
                  src={config.logo}
                  alt={config.name}
                  className="w-4 h-4"
                />
                <span className="text-gray-400 text-xs font-medium">
                  {config.name}
                </span>
                <span className={`text-xs font-semibold ${color}`}>
                  {sign}{change.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Period Buttons - on same line as interval buttons */}
        <ButtonGroup>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedPeriod(null)}
            className={`text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2 md:px-2.5 border-0 cursor-pointer transition-all ${selectedPeriod === null ? activeStyle : inactiveStyle
              }`}
          >
            Auto
          </Button>
          {periodOptions.map((period) => (
            <Button
              key={period.label}
              variant="outline"
              size="sm"
              onClick={() => handlePeriod(period.label, period.seconds)}
              className={`text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2 md:px-2.5 border-0 cursor-pointer transition-all ${activePeriodLabel === period.label ? activeStyle : inactiveStyle
                }`}
            >
              {period.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Row 2: 24h Price Changes - MOBILE ONLY (separate row) */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto">
        <span className="text-gray-500 text-[10px] uppercase tracking-wider font-medium flex-shrink-0">
          24h
        </span>
        {priceChanges.map((change) => {
          const isPositive = change.changePercent >= 0;
          const color = isPositive ? "text-emerald-400" : "text-red-400";
          const sign = isPositive ? "+" : "";
          const config = assetConfig[change.symbol];

          return (
            <div
              key={change.symbol}
              className="flex items-center gap-1 bg-[#1a1a1f] px-1.5 py-0.5 rounded-md flex-shrink-0"
            >
              <img
                src={config.logo}
                alt={config.name}
                className="w-3.5 h-3.5"
              />
              <span className={`text-[10px] font-semibold ${color}`}>
                {sign}{change.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}