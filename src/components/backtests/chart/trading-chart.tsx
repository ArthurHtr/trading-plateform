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
  AreaSeries,
  createSeriesMarkers, 
  ISeriesMarkersPluginApi 
} from "lightweight-charts";
import { useTheme } from "next-themes";

interface ChartProps {
  data: {
    time: string | number; // Allow number for timestamps
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }[];
  markers?: {
    time: string | number;
    position: "aboveBar" | "belowBar";
    color: string;
    shape: "arrowUp" | "arrowDown";
    text: string;
  }[];
  lines?: {
    name: string;
    color: string;
    data: { time: string | number; value: number }[];
  }[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
  type?: "candlestick" | "line" | "area";
  height?: number;
  mainSeriesName?: string;
}

const DEFAULT_MARKERS: any[] = [];
const DEFAULT_LINES: any[] = [];
const DEFAULT_COLORS = {};

export const TradingChart = ({ 
  data, 
  markers = DEFAULT_MARKERS, 
  lines = DEFAULT_LINES, 
  colors = DEFAULT_COLORS,
  type = "candlestick",
  height,
  mainSeriesName
}: ChartProps) => {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<ISeriesApi<"Candlestick" | "Line" | "Area"> | null>(null);
  const volumeSeriesRef = React.useRef<ISeriesApi<"Histogram"> | null>(null);
  const lineSeriesRefs = React.useRef<ISeriesApi<"Line">[]>([]);
  const linesMetaRef = React.useRef<{ series: ISeriesApi<"Line">; name: string; color: string }[]>([]);
  const markersRef = React.useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    backgroundColor = "transparent",
    textColor = isDark ? "#d1d5db" : "black",
  } = colors;

  // Legend state
  const [legendItems, setLegendItems] = React.useState<{ label: string; value: string; color?: string }[]>([]);

  React.useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: height || chartContainerRef.current.clientHeight || 500
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: height || chartContainerRef.current.clientHeight || 500,
      grid: {
        vertLines: { color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(197, 203, 206, 0.1)" },
        horzLines: { color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(197, 203, 206, 0.1)" },
      },
      timeScale: {
        borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(197, 203, 206, 0.8)",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(197, 203, 206, 0.8)",
      },
    });

    chartRef.current = chart;
    // Reset line series refs as we have a new chart
    lineSeriesRefs.current = [];

    // Main Series (Candlestick or Line or Area)
    let mainSeries: ISeriesApi<"Candlestick" | "Line" | "Area">;
    
    if (type === "line") {
      mainSeries = chart.addSeries(LineSeries, {
        color: colors.lineColor || "#2962FF",
        lineWidth: 2,
      });
    } else if (type === "area") {
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: colors.areaTopColor || "rgba(41, 98, 255, 0.56)",
        bottomColor: colors.areaBottomColor || "rgba(41, 98, 255, 0.04)",
        lineColor: colors.lineColor || "rgba(41, 98, 255, 1)",
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
        setLegendItems([]);
      } else {
        const items: { label: string; value: string; color?: string }[] = [];
        const data = param.seriesData.get(mainSeries) as any;
        
        if (data) {
          if (type === "candlestick") {
            const volumeData = param.seriesData.get(volumeSeries) as any;
            const color = (data.close >= data.open) ? "#26a69a" : "#ef5350";
            items.push(
              { label: "O", value: data.open.toFixed(2), color },
              { label: "H", value: data.high.toFixed(2), color },
              { label: "L", value: data.low.toFixed(2), color },
              { label: "C", value: data.close.toFixed(2), color },
              { label: "V", value: volumeData ? volumeData.value.toString() : "N/A" }
            );
          } else {
            // Line chart (Equity, Position, etc.)
            items.push({
              label: mainSeriesName || "Value",
              value: data.value.toFixed(2),
              color: "#2962FF" // Default line color
            });
            
            // Add extra lines
            linesMetaRef.current.forEach(meta => {
              const lineData = param.seriesData.get(meta.series) as any;
              if (lineData) {
                items.push({
                  label: meta.name,
                  value: lineData.value.toFixed(2),
                  color: meta.color
                });
              }
            });
          }
        }
        setLegendItems(items);
      }
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [backgroundColor, textColor, type, mainSeriesName]);

  // Update Data
  React.useEffect(() => {
    if (!chartRef.current || !seriesRef.current || !volumeSeriesRef.current) return;

    if (data.length > 0) {
      // Sort by time (assuming time is number or string that sorts correctly)
      const sortedData = [...data].sort((a, b) => {
        const tA = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time;
        const tB = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time;
        return tA - tB;
      });
      
      const formattedData = sortedData.map(d => ({
        ...d,
        // Pass time directly.
        time: d.time as Time,
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
          time: (typeof m.time === 'string' ? new Date(m.time).getTime() / 1000 : m.time) as Time
      })).sort((a, b) => (a.time as number) - (b.time as number));
      
      markersRef.current?.setMarkers(formattedMarkers as any);

      // Handle Lines (Indicators)
      // Clear existing lines
      lineSeriesRefs.current.forEach(s => {
        try {
          chartRef.current?.removeSeries(s);
        } catch (e) {
          // Ignore error if series is already removed or invalid
        }
      });
      lineSeriesRefs.current = [];
      linesMetaRef.current = [];

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
            time: (typeof d.time === 'string' ? new Date(d.time).getTime() / 1000 : d.time) as Time,
            value: d.value
          }))
          .sort((a, b) => (a.time as number) - (b.time as number));

        lineSeries.setData(formattedLineData);
        lineSeriesRefs.current.push(lineSeries);
        linesMetaRef.current.push({ series: lineSeries, name: line.name, color: line.color });
      });
      
      // Only fit content if data range has changed significantly or it's the first load
      const firstTime = formattedData.length > 0 ? (formattedData[0].time as number) : 0;
      const lastTime = formattedData.length > 0 ? (formattedData[formattedData.length - 1].time as number) : 0;
      
      const prevRange = (chartRef.current as any)._prevRange;
      
      if (!prevRange || prevRange.first !== firstTime || prevRange.last !== lastTime) {
         chartRef.current.timeScale().fitContent();
         (chartRef.current as any)._prevRange = { first: firstTime, last: lastTime };
      }
    }
  }, [data, markers, lines, type, isDark]);

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
      {legendItems.length > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-background/80 p-2 rounded border border-border text-xs font-mono shadow-sm pointer-events-none backdrop-blur-sm">
          <div className="flex flex-col gap-1">
            {legendItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-foreground">{item.label}</span>
                <span className="text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
