import { toast } from "sonner";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  type CandlestickData,
  CandlestickSeries,
  createChart,
  type Time,
  type ISeriesApi,
  type IChartApi,
} from "lightweight-charts";
import { useAssetStore, useChartStore } from "store/useStore";

export type Candle = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
};

type RawCandle = {
  start: string;
  open: string;
  high: string;
  low: string;
  close: string;
};

// Get number of candles to fill the chart view based on interval
const getCandlesForView = (interval: string, chartWidth: number): number => {
  const candlesVisible = Math.floor(chartWidth / 10);
  return Math.max(candlesVisible * 2, 100);
};

// Calculate start time based on interval and number of candles needed
const calculateStartTime = (interval: string, numCandles: number): number => {
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = getIntervalSeconds(interval);
  return now - (numCandles * intervalSeconds);
};

// Helper function to get interval in seconds
function getIntervalSeconds(interval: string): number {
  switch (interval) {
    case "1m": return 60;
    case "3m": return 180;
    case "5m": return 300;
    case "30m": return 1800;
    case "1h": return 3600;
    case "4h": return 14400;
    case "1d": return 86400;
    default: return 60;
  }
}

export default function Chart() {
  const ref = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chartWidth, setChartWidth] = useState(800);
  const loadedRangeRef = useRef<{ from: number; to: number } | null>(null);
  const isFetchingRef = useRef(false);

  const selectedSymbol = useAssetStore((state) => state.selectedSymbol);
  const selectedInterval = useChartStore((state) => state.selectedInterval);
  const selectedPeriod = useChartStore((state) => state.selectedPeriod);

  // Fetch candles for a given time range
  const fetchCandles = useCallback(async (startTime: number, endTime?: number): Promise<Candle[]> => {
    if (!selectedInterval || !selectedSymbol) return [];
    if (isFetchingRef.current) return [];
    
    isFetchingRef.current = true;
    setIsLoading(true);
    
    try {
      let url = `${import.meta.env.VITE_BACKEND_BASE_URL}/api/candles?symbol=${selectedSymbol}_USDC&interval=${selectedInterval}&startTime=${startTime}`;
      if (endTime) {
        url += `&endTime=${endTime}`;
      }

      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to fetch data");
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const json = await res.json();
      const dataArray = Array.isArray(json) ? json : json.data || [];

      if (dataArray.length === 0) {
        return [];
      }

      const candles: Candle[] = dataArray.map((d: RawCandle) => ({
        time: Math.floor(new Date(d.start).getTime() / 1000) as Time,
        open: parseFloat(d.open),
        high: parseFloat(d.high),
        low: parseFloat(d.low),
        close: parseFloat(d.close),
      }));

      candles.sort((a, b) => Number(a.time) - Number(b.time));
      return candles;
    } catch (err) {
      console.error("Failed to load chart data:", err);
      return [];
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [selectedInterval, selectedSymbol]);

  // Initialize chart
  useEffect(() => {
    if (!ref.current) return;

    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;
    setChartWidth(width);

    const chart = createChart(ref.current, {
      layout: { background: { color: "#14151B" }, textColor: "#94a3b8" },
      grid: {
        vertLines: { color: "#202127" },
        horzLines: { color: "#202127" },
      },
      rightPriceScale: { borderColor: "#0b1220" },
      timeScale: { 
        borderColor: "#0b1220",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 1 },
      width: width,
      height: height || 300,
    });

    chartRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#16A34A",
      downColor: "#DC2626",
      borderUpColor: "#16A34A",
      borderDownColor: "#DC2626",
      wickUpColor: "#16A34A",
      wickDownColor: "#DC2626",
    });

    seriesRef.current = series;
    setChartReady(true);

    const onResize = () => {
      if (ref.current) {
        const newWidth = ref.current.clientWidth;
        const newHeight = ref.current.clientHeight;
        setChartWidth(newWidth);
        chart.applyOptions({
          width: newWidth,
          height: newHeight || 300,
        });
      }
    };
    
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Handle scrolling to load more data (only when period is null/auto)
  useEffect(() => {
    if (!chartReady || !chartRef.current || selectedPeriod !== null) return;

    const timeScale = chartRef.current.timeScale();
    
    const handleVisibleRangeChange = async () => {
      const visibleRange = timeScale.getVisibleLogicalRange();
      if (!visibleRange || !loadedRangeRef.current) return;

      if (visibleRange.from < 10) {
        const intervalSeconds = getIntervalSeconds(selectedInterval);
        const newStartTime = loadedRangeRef.current.from - (100 * intervalSeconds);
        
        const olderCandles = await fetchCandles(newStartTime, loadedRangeRef.current.from - 1);
        
        if (olderCandles && olderCandles.length > 0) {
          const existingData = (seriesRef.current?.data() || []) as Candle[];
          const mergedData = [...olderCandles, ...existingData];
          
          const uniqueData = mergedData.reduce((acc, candle) => {
            if (!acc.find(c => c.time === candle.time)) {
              acc.push(candle);
            }
            return acc;
          }, [] as Candle[]);
          
          uniqueData.sort((a, b) => Number(a.time) - Number(b.time));
          seriesRef.current?.setData(uniqueData);
          
          loadedRangeRef.current = {
            from: Number(uniqueData[0].time),
            to: Number(uniqueData[uniqueData.length - 1].time)
          };
        }
      }
    };

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleVisibleRangeChange, 500);
    };

    timeScale.subscribeVisibleLogicalRangeChange(debouncedHandler);

    return () => {
      clearTimeout(timeoutId);
      timeScale.unsubscribeVisibleLogicalRangeChange(debouncedHandler);
    };
  }, [chartReady, selectedInterval, selectedPeriod, fetchCandles]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!chartReady || !selectedSymbol || !selectedInterval) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_BACKPACK_API);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: [`klines.${selectedInterval}.${selectedSymbol}_USDC`],
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.data) {
        const kline = data.data;
        const newCandle: CandlestickData = {
          time: Math.floor(new Date(kline.t).getTime() / 1000) as Time,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        };

        seriesRef.current?.update(newCandle);
        
        if (loadedRangeRef.current) {
          loadedRangeRef.current.to = Math.max(
            loadedRangeRef.current.to,
            Number(newCandle.time)
          );
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            method: "UNSUBSCRIBE",
            params: [`klines.${selectedInterval}.${selectedSymbol}_USDC`],
          })
        );
      }
      ws.close();
    };
  }, [selectedInterval, selectedSymbol, chartReady]);

  // Load initial data
  useEffect(() => {
    if (!chartReady || !selectedInterval) return;

    async function loadData() {
      let startTime: number;
      
      if (selectedPeriod !== null) {
        startTime = Number(selectedPeriod);
      } else {
        const numCandles = getCandlesForView(selectedInterval, chartWidth);
        startTime = calculateStartTime(selectedInterval, numCandles);
      }

      const candles = await fetchCandles(startTime);
      
      if (candles && candles.length > 0) {
        seriesRef.current?.setData(candles);
        loadedRangeRef.current = {
          from: Number(candles[0].time),
          to: Number(candles[candles.length - 1].time)
        };
        
        chartRef.current?.timeScale().fitContent();
      }
    }

    loadData();
  }, [selectedInterval, chartReady, selectedSymbol, selectedPeriod, chartWidth, fetchCandles]);

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full" ref={ref} />
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}