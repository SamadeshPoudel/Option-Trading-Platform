import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import {
  type CandlestickData,
  CandlestickSeries,
  createChart,
  type Time,
  type ISeriesApi,
} from "lightweight-charts";
import { useAssetStore } from "../../store/useStore";


export type Candle = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
};
 type RawCandle = {
  start: string,
  open:string,
  high:string,
  low:string,
  close:string
 }

type Props = {
  duration: string;
  startTime: number;
};


export default function Chart({ duration, startTime }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [height, setHeight] = useState<number>(500)

  const selectedSymbol = useAssetStore((state) => state.selectedSymbol);

  useEffect(() => {
    if (!ref.current) return;

    const newHeight = window.innerHeight < 500 ? 300 : 500;
    setHeight(newHeight);
    const chart = createChart(ref.current, {
      layout: { background: { color: "#171717" }, textColor: "#94a3b8" },
      grid: {
        vertLines: { color: "#2E2E2E" },
        horzLines: { color: "#2E2E2E" },
      },
      rightPriceScale: { borderColor: "#0b1220" },
      timeScale: { borderColor: "#0b1220" },
      crosshair: { mode: 1 },
      width: ref.current.clientWidth,
      height: height,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#039e64",
      downColor: "#CE484B",
      borderUpColor: "#039e64",
      borderDownColor: "#CE484B",
      wickUpColor: "#039e64",
      wickDownColor: "#CE484B",
    });

    seriesRef.current = series;
    setChartReady(true);

    const onResize = () => {
      chart.applyOptions({
        width: ref.current!.clientWidth,
        height: ref.current!.clientHeight,
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartReady || !selectedSymbol) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_BACKPACK_API);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: [`klines.${duration}."SOL_USDC`], //${selectedSymbol}
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // if (data.topic?.startsWith("klines")) {
        const kline = data.data;
          // console.log("kline data",kline)
        const newCandle:CandlestickData = {
          time: Math.floor(new Date(kline.t).getTime() / 1000) as Time,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        };

        seriesRef.current?.update(newCandle);
      // }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            method: "UNSUBSCRIBE",
            params: [`klines.${duration}.${selectedSymbol}`],
          })
        );
      }
      ws.close();
    };
  }, [duration, selectedSymbol, chartReady]);

  useEffect(() => {
    if (!chartReady) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(
          // `${import.meta.env.VITE_BACKEND_BASE_URL}/candles/market?symbol=${selectedSymbol}&interval=${duration}&startTime=${startTime}`,
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/candles?symbol=SOL_USDC&interval=1m&startTime=1768651501`,

          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData.message || "Failed to fetch data");
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const json = await res.json();

        // Ensure json is an array
        const dataArray = Array.isArray(json) ? json : json.data || [];

        if (dataArray.length === 0) {
          toast.warning("No candle data received");
          return;
        }

        if (dataArray.length > 1400) {
          toast.warning(
            "Data range too large. Please select a smaller time range."
          );
          return;
        }

        const candles: Candle[] = dataArray.map((d: RawCandle) => ({
          time: Math.floor(new Date(d.start).getTime() / 1000),
          open: parseFloat(d.open),
          high: parseFloat(d.high),
          low: parseFloat(d.low),
          close: parseFloat(d.close),
        }));

        candles.sort((a, b) => Number(a.time) - Number(b.time));
        seriesRef.current?.setData(candles);
      } catch (err) {
        console.error("Failed to load chart data:", err);
        const message =
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : JSON.stringify(err) || "Failed to load chart data";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [duration, chartReady, selectedSymbol, startTime]);

  return (
    <div className="w-full h-[300px] sm:h-[500px] relative flex align-center max-h-[500px]">
      <div className="w-full h-full" ref={ref} />
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
