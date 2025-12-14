"use client";

import * as React from "react";
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  Time, 
  CandlestickSeries, 
  HistogramSeries,
  LineSeries,
  createSeriesMarkers, 
  ISeriesMarkersPluginApi 
} from "lightweight-charts";

interface ChartProps {
  data: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }[];
  markers?: {
    time: string;
    position: "aboveBar" | "belowBar";
    color: string;
    shape: "arrowUp" | "arrowDown";
    text: string;
  }[];
  lines?: {
    name: string;
    color: string;
    data: { time: string; value: number }[];
  }[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
  type?: "candlestick" | "line";
}

const DEFAULT_MARKERS: any[] = [];
const DEFAULT_LINES: any[] = [];
const DEFAULT_COLORS = {};

export const TradingChart = ({ 
  data, 
  markers = DEFAULT_MARKERS, 
  lines = DEFAULT_LINES, 
  colors = DEFAULT_COLORS,
  type = "candlestick"
}: ChartProps) => {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<ISeriesApi<"Candlestick" | "Line"> | null>(null);
  const volumeSeriesRef = React.useRef<ISeriesApi<"Histogram"> | null>(null);
  const lineSeriesRefs = React.useRef<ISeriesApi<"Line">[]>([]);
  const markersRef = React.useRef<ISeriesMarkersPluginApi<Time> | null>(null);

  const {
    backgroundColor = "transparent",
    textColor = "black",
  } = colors;

  // Legend state
  const [legend, setLegend] = React.useState<{
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    color: string;
  } | null>(null);

  React.useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      grid: {
        vertLines: { color: "rgba(197, 203, 206, 0.1)" },
        horzLines: { color: "rgba(197, 203, 206, 0.1)" },
      },
      rightPriceScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
      },
      timeScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
      },
    });

    chartRef.current = chart;

    // Main Series (Candlestick or Line)
    let mainSeries: ISeriesApi<"Candlestick" | "Line">;
    
    if (type === "line") {
      mainSeries = chart.addSeries(LineSeries, {
        color: "#2962FF",
        lineWidth: 2,
      });
    } else {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });
    }
    
    // Prevent overlap with volume
    mainSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.2, // Reserve bottom 20% for volume
      },
    });
    
    seriesRef.current = mainSeries;

    // Volume Series (Overlay)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "", // Overlay on main chart
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.85, // Highest volume bar will be at 85% from top (bottom 15%)
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;
    
    // Initialize markers plugin
    const markersPlugin = createSeriesMarkers(mainSeries, []);
    markersRef.current = markersPlugin;

    // Crosshair Move Handler for Legend
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        setLegend(null);
      } else {
        const data = param.seriesData.get(mainSeries) as any;
        const volumeData = param.seriesData.get(volumeSeries) as any;
        if (data) {
          setLegend({
            open: data.open ? data.open.toFixed(2) : data.value.toFixed(2),
            high: data.high ? data.high.toFixed(2) : data.value.toFixed(2),
            low: data.low ? data.low.toFixed(2) : data.value.toFixed(2),
            close: data.close ? data.close.toFixed(2) : data.value.toFixed(2),
            volume: volumeData ? volumeData.value.toString() : "N/A",
            color: (data.close || data.value) >= (data.open || data.value) ? "#26a69a" : "#ef5350",
          });
        }
      }
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [backgroundColor, textColor, type]);

  // Update Data
  React.useEffect(() => {
    if (!chartRef.current || !seriesRef.current || !volumeSeriesRef.current) return;

    if (data.length > 0) {
      const sortedData = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      
      const formattedData = sortedData.map(d => ({
        ...d,
        time: (new Date(d.time).getTime() / 1000) as Time,
        value: d.close // For Line Series
      }));

      seriesRef.current.setData(formattedData);

      // Set Volume Data
      const volumeData = formattedData.map(d => ({
        time: d.time,
        value: d.volume || 0,
        color: d.close >= d.open ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)",
      }));
      volumeSeriesRef.current.setData(volumeData);
      
      // Set Markers
      const formattedMarkers = markers.map(m => ({
          ...m,
          time: (new Date(m.time).getTime() / 1000) as Time
      })).sort((a, b) => (a.time as number) - (b.time as number));
      
      markersRef.current?.setMarkers(formattedMarkers as any);

      // Handle Lines (Indicators)
      // Clear existing lines
      lineSeriesRefs.current.forEach(s => chartRef.current?.removeSeries(s));
      lineSeriesRefs.current = [];

      // Add new lines
      lines.forEach(line => {
        const lineSeries = chartRef.current!.addSeries(LineSeries, {
          color: line.color,
          lineWidth: 2,
          crosshairMarkerVisible: false,
        });
        
        // Prevent overlap with volume for indicators too
        lineSeries.priceScale().applyOptions({
          scaleMargins: {
            top: 0.1,
            bottom: 0.2,
          },
        });
        
        const formattedLineData = line.data
          .map(d => ({
            time: (new Date(d.time).getTime() / 1000) as Time,
            value: d.value
          }))
          .sort((a, b) => (a.time as number) - (b.time as number));

        lineSeries.setData(formattedLineData);
        lineSeriesRefs.current.push(lineSeries);
      });
      
      chartRef.current.timeScale().fitContent();
    }
  }, [data, markers, lines]);

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
      {legend && (
        <div className="absolute top-2 left-2 z-10 bg-white/80 dark:bg-black/80 p-2 rounded border border-gray-200 dark:border-gray-800 text-xs font-mono shadow-sm pointer-events-none">
          <div className="flex gap-4">
            <div>O: <span style={{ color: legend.color }}>{legend.open}</span></div>
            <div>H: <span style={{ color: legend.color }}>{legend.high}</span></div>
            <div>L: <span style={{ color: legend.color }}>{legend.low}</span></div>
            <div>C: <span style={{ color: legend.color }}>{legend.close}</span></div>
            <div>V: <span>{legend.volume}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
