"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { backtestApi } from "@/lib/api/backtest-api";
import { portfolioApi } from "@/lib/api/portfolio-api";
import { useAvailableSymbols } from "@/hooks/use-available-symbols";
import { useSession } from "@/lib/auth-client";
import { SymbolData } from "@/components/portfolios/market-explorer";
import { BacktestConfigForm } from "@/components/backtests/creation/backtest-config-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Briefcase } from "lucide-react";

export function BacktestCreateForm({ initialSymbols }: { initialSymbols?: SymbolData[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // --- Global State ---
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successId, setSuccessId] = React.useState<string | null>(null);

  // --- Data State ---
  const { availableSymbolsData: availableData, isSymbolsLoading: loadingSymbols } = useAvailableSymbols(initialSymbols);
  const [portfolios, setPortfolios] = React.useState<any[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = React.useState(true);
  
  // --- Selection State ---
  const [selectedPortfolioId, setSelectedPortfolioId] = React.useState<string>("");
  const [selectedSymbols, setSelectedSymbols] = React.useState<string[]>([]);

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
    setLoadingPortfolios(true);
    portfolioApi.list()
      .then((portfoliosData) => {
        if (Array.isArray(portfoliosData)) setPortfolios(portfoliosData);
      })
      .catch(() => [])
      .finally(() => setLoadingPortfolios(false));
  }, []);

  // --- Logic: Update Selected Symbols ---
  React.useEffect(() => {
    if (!selectedPortfolioId) {
      setSelectedSymbols([]);
      return;
    }
    const portfolio = portfolios.find(p => p.id === selectedPortfolioId);
    if (portfolio) {
      setSelectedSymbols(portfolio.symbols);
    }
  }, [selectedPortfolioId, portfolios]);

  // --- Logic: Update Timeframes & Dates based on Selection ---
  React.useEffect(() => {
    if (selectedSymbols.length === 0) {
      setAvailableTimeframes([]);
      return;
    }

    const timeframesSets = selectedSymbols.map(sym => {
      const data = availableData.find(d => d.symbol === sym);
      return (data && data.timeframes) ? new Set(Object.keys(data.timeframes)) : new Set<string>();
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
        if (data && data.timeframes && data.timeframes[config.timeframe]) {
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
        portfolioId: selectedPortfolioId,
        start: Math.floor(new Date(config.start).getTime() / 1000),
        end: Math.floor(new Date(config.end).getTime() / 1000),
        timeframe: config.timeframe,
        initialCash: Number(config.initialCash),
        feeRate: Number(config.feeRate),
        marginRequirement: Number(config.marginRequirement),
      };
      
      if (payload.symbols.length === 0) throw new Error("Please select a portfolio with symbols.");
      if (!payload.timeframe) throw new Error("Please select a valid timeframe.");

      const result = await backtestApi.create(payload);
      setSuccessId(result.id);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* --- TOP SECTION: PORTFOLIO SELECTION --- */}
      <Card>
        <CardHeader>
          <CardTitle>Select Portfolio</CardTitle>
          <CardDescription>Choose a portfolio to backtest.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Label htmlFor="portfolio" className="mb-2 block">Portfolio</Label>
            <div className="relative">
              <select
                id="portfolio"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                value={selectedPortfolioId}
                onChange={(e) => setSelectedPortfolioId(e.target.value)}
                disabled={loadingPortfolios}
              >
                <option value="" disabled>Select a portfolio...</option>
                {portfolios.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.symbols.length} symbols)
                  </option>
                ))}
              </select>
              <Briefcase className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/portfolios/new">
              <Plus className="mr-2 h-4 w-4" />
              New Portfolio
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* --- BOTTOM SECTION: CONFIGURATION --- */}
      {selectedPortfolioId && (
        <BacktestConfigForm 
          config={config}
          handleConfigChange={handleConfigChange}
          availableTimeframes={availableTimeframes}
          selectedSymbols={selectedSymbols}
          dateRange={dateRange}
          portfolioValidated={true}
          loading={loading}
          error={error}
          successId={successId}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
