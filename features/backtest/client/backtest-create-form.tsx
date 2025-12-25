"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { backtestApi } from "@/features/backtest/client/backtest-api";
import { useSession } from "@/features/authentification/client/authClient";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Field, FieldLabel, FieldDescription } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Check, AlertCircle, Search, X, TrendingUp, Wallet, Settings2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SymbolData {
  symbol: string;
  name?: string;
  sector?: string;
  industry?: string;
  exchange?: string;
  timeframes: Record<string, { min: string | null; max: string | null }>;
}

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

  // --- Derived State: Filtered Symbols ---
  const filteredSymbols = React.useMemo(() => {
    return availableData.filter(d => {
      const matchesSearch = d.symbol.toLowerCase().includes(symbolSearch.toLowerCase()) || 
                            (d.name && d.name.toLowerCase().includes(symbolSearch.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || (d.sector || "Other") === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [availableData, symbolSearch, selectedCategory]);

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
        
        {/* MARKET EXPLORER */}
        <Card className="flex-1 flex flex-col overflow-hidden border-muted min-w-0">
          <CardHeader className="pb-3 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Market Explorer
                </CardTitle>
                <CardDescription>Parcourez et sélectionnez les actifs pour votre stratégie</CardDescription>
              </div>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {availableData.length} actifs disponibles
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 min-w-0">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un symbole..."
                  className="pl-9 bg-background/50 w-full"
                  value={symbolSearch}
                  onChange={(e) => setSymbolSearch(e.target.value)}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 w-full sm:w-[180px] rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          
          <Separator />
          
          <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
            {loadingSymbols ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">Chargement...</div>
            ) : filteredSymbols.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <Search className="h-8 w-8 opacity-20" />
                <p>Aucun actif trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredSymbols.map(item => {
                  const isSelected = selectedSymbols.includes(item.symbol);
                  return (
                    <div 
                      key={item.symbol}
                      onClick={() => toggleSymbol(item.symbol)}
                      className={cn(
                        "group relative flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md",
                        isSelected 
                          ? "bg-primary/5 border-primary ring-1 ring-primary/20" 
                          : "bg-card border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-lg tracking-tight">{item.symbol}</span>
                        {isSelected ? (
                          <div className="h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted group-hover:border-primary/50 transition-colors" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-1" title={item.name}>{item.name || "Unknown"}</span>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-medium">
                          {item.sector || "Other"}
                        </span>
                        {item.exchange && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-medium">
                            {item.exchange}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* PORTFOLIO CARD */}
        <Card className="w-full lg:w-[350px] flex flex-col border-muted shadow-sm shrink-0">
          <CardHeader className="py-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" />
              Mon Portefeuille
            </CardTitle>
            <Badge variant="secondary" className="ml-auto">{selectedSymbols.length}</Badge>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[150px]">
            {selectedSymbols.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm p-4 text-center border-2 border-dashed rounded-md m-2">
                <Plus className="h-8 w-8 mb-2 opacity-20" />
                <p>Sélectionnez des actifs à gauche pour construire votre portefeuille</p>
              </div>
            ) : (
              selectedSymbols.map(sym => (
                <div key={sym} className="flex items-center justify-between p-2 rounded-md bg-card border hover:bg-accent/50 transition-colors group">
                  <span className="font-medium">{sym}</span>
                  {!portfolioValidated && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => toggleSymbol(sym)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t bg-muted/20">
            {!portfolioValidated ? (
              <Button 
                className="w-full" 
                disabled={selectedSymbols.length === 0}
                onClick={() => setPortfolioValidated(true)}
              >
                Valider le Portefeuille
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full border-dashed"
                onClick={() => setPortfolioValidated(false)}
              >
                Modifier la sélection
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* --- BOTTOM SECTION: CONFIGURATION --- */}
      <Card className={cn("shrink-0 border-muted shadow-sm transition-all duration-300", !portfolioValidated && "opacity-50 pointer-events-none grayscale")}>
        <CardHeader className="py-3 bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4" />
            Configuration du Backtest
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Field>
              <FieldLabel>Timeframe</FieldLabel>
              <select
                name="timeframe"
                value={config.timeframe}
                onChange={handleConfigChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {availableTimeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
              </select>
              {availableTimeframes.length === 0 && selectedSymbols.length > 0 && (
                <p className="text-[10px] text-destructive mt-1">Aucun timeframe commun</p>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Début</FieldLabel>
                <Input type="date" name="start" value={config.start} onChange={handleConfigChange} min={dateRange.min} max={dateRange.max} className="h-9" />
              </Field>
              <Field>
                <FieldLabel>Fin</FieldLabel>
                <Input type="date" name="end" value={config.end} onChange={handleConfigChange} min={dateRange.min} max={dateRange.max} className="h-9" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Capital ($)</FieldLabel>
                <Input type="number" name="initialCash" value={config.initialCash} onChange={handleConfigChange} className="h-9" />
              </Field>
              <Field>
                <FieldLabel>Frais (%)</FieldLabel>
                <Input type="number" name="feeRate" step="0.0001" value={config.feeRate} onChange={handleConfigChange} className="h-9" />
              </Field>
            </div>

            <div className="flex flex-col justify-end gap-2">
              {error && <p className="text-xs text-destructive w-full text-center">{error}</p>}
              {successId && (
                 <div className="w-full bg-green-100 text-green-800 text-xs p-2 rounded border border-green-200 mb-2">
                   Backtest créé ! ID: <span className="font-mono font-bold">{successId}</span>
                 </div>
              )}
              <Button className="w-full" onClick={handleSubmit} disabled={loading || !portfolioValidated}>
                {loading ? "Lancement..." : "Lancer le Backtest"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
