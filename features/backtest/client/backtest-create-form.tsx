"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { backtestApi } from "@/features/backtest/client/backtest-api";
import { useSession } from "@/features/authentification/client/authClient";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { MarketExplorer, SymbolData } from "../components/market-explorer";
import { PortfolioPanel } from "../components/portfolio-panel";
import { BacktestConfigForm } from "../components/backtest-config-form";

export function BacktestCreateForm() {
  const router = useRouter();
  const { data: session } = useSession();
  
  // --- Global State ---
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successId, setSuccessId] = React.useState<string | null>(null);

  // --- Data State ---
  const [availableData, setAvailableData] = React.useState<SymbolData[]>([]);
  const [loadingSymbols, setLoadingSymbols] = React.useState(true);
  
  // --- Selection State ---
  const [selectedSymbols, setSelectedSymbols] = React.useState<string[]>([]);
  const [portfolioValidated, setPortfolioValidated] = React.useState(false);

  // --- Filter State ---
  const [symbolSearch, setSymbolSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  // --- Configuration State ---
  const [availableTimeframes, setAvailableTimeframes] = React.useState<string[]>([]);
  const [dateRange, setDateRange] = React.useState<{min: string, max: string}>({min: "", max: ""});
  
  const [config, setConfig] = React.useState({
    start: "2023-01-01",
    end: "2023-12-31",
    timeframe: "1d",
    initialCash: 10000,
    feeRate: 0.001,
    marginRequirement: 0.5,
  });

  // --- Fetch Data ---
  React.useEffect(() => {
    setLoadingSymbols(true);
    fetch("/api/symbols")
      .then((res) => res.ok ? res.json() : Promise.reject("Failed to fetch"))
      .then((data) => {
        if (Array.isArray(data)) setAvailableData(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingSymbols(false));
  }, []);

  // --- Derived State: Categories ---
  const categories = React.useMemo(() => {
    const cats = new Set(availableData.map(d => d.sector || "Other").filter(Boolean));
    return ["All", ...Array.from(cats).sort()];
  }, [availableData]);

  // --- Logic: Update Timeframes & Dates based on Selection ---
  React.useEffect(() => {
    if (selectedSymbols.length === 0) {
      setAvailableTimeframes([]);
      return;
    }

    const timeframesSets = selectedSymbols.map(sym => {
      const data = availableData.find(d => d.symbol === sym);
      return data ? new Set(Object.keys(data.timeframes)) : new Set<string>();
    });

    if (timeframesSets.length > 0) {
      let intersection = new Set(timeframesSets[0]);
      for (let i = 1; i < timeframesSets.length; i++) {
        intersection = new Set([...intersection].filter(x => timeframesSets[i].has(x)));
      }
      const sortedTimeframes = Array.from(intersection).sort();
      setAvailableTimeframes(sortedTimeframes);

      if (!intersection.has(config.timeframe) && sortedTimeframes.length > 0) {
          setConfig(prev => ({ ...prev, timeframe: sortedTimeframes[0] }));
      } else if (sortedTimeframes.length === 0) {
          setConfig(prev => ({ ...prev, timeframe: "" }));
      }
    }
  }, [selectedSymbols, availableData]);

  // --- Logic: Update Date Range ---
  React.useEffect(() => {
    if (selectedSymbols.length === 0 || !config.timeframe) {
        setDateRange({ min: "", max: "" });
        return;
    }

    let maxMinDate = ""; 
    let minMaxDate = ""; 

    selectedSymbols.forEach(sym => {
        const data = availableData.find(d => d.symbol === sym);
        if (data && data.timeframes[config.timeframe]) {
            const tfData = data.timeframes[config.timeframe];
            if (tfData.min && (!maxMinDate || tfData.min > maxMinDate)) maxMinDate = tfData.min;
            if (tfData.max && (!minMaxDate || tfData.max < minMaxDate)) minMaxDate = tfData.max;
        }
    });

    const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : "";
    const newMin = formatDate(maxMinDate);
    const newMax = formatDate(minMaxDate);
    
    setDateRange({ min: newMin, max: newMax });

    if (newMin) setConfig(prev => ({ ...prev, start: newMin }));
    if (newMax) setConfig(prev => ({ ...prev, end: newMax }));
  }, [selectedSymbols, config.timeframe, availableData]);


  // --- Handlers ---
  const toggleSymbol = (symbol: string) => {
    if (portfolioValidated) return; // Lock selection if validated
    setSelectedSymbols(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccessId(null);

    try {
      const payload = {
        symbols: selectedSymbols,
        start: config.start,
        end: config.end,
        timeframe: config.timeframe,
        initialCash: Number(config.initialCash),
        feeRate: Number(config.feeRate),
        marginRequirement: Number(config.marginRequirement),
      };
      
      if (payload.symbols.length === 0) throw new Error("Veuillez sélectionner au moins un symbole.");
      if (!payload.timeframe) throw new Error("Veuillez sélectionner un timeframe valide.");

      const result = await backtestApi.create(payload);
      setSuccessId(result.id);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if ((session?.user as any)?.role === "demo") {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action non autorisée</AlertTitle>
          <AlertDescription>Le compte de démonstration ne peut pas créer de nouveaux backtests.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* --- TOP SECTION: MARKET EXPLORER & PORTFOLIO --- */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        <MarketExplorer 
          availableData={availableData}
          loadingSymbols={loadingSymbols}
          selectedSymbols={selectedSymbols}
          toggleSymbol={toggleSymbol}
          symbolSearch={symbolSearch}
          setSymbolSearch={setSymbolSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        <PortfolioPanel 
          selectedSymbols={selectedSymbols}
          toggleSymbol={toggleSymbol}
          portfolioValidated={portfolioValidated}
          setPortfolioValidated={setPortfolioValidated}
        />
      </div>

      {/* --- BOTTOM SECTION: CONFIGURATION --- */}
      <BacktestConfigForm 
        config={config}
        handleConfigChange={handleConfigChange}
        availableTimeframes={availableTimeframes}
        selectedSymbols={selectedSymbols}
        dateRange={dateRange}
        portfolioValidated={portfolioValidated}
        loading={loading}
        error={error}
        successId={successId}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
