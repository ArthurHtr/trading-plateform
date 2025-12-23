"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { backtestApi } from "@/features/backtest/client/backtest-api";
import { useSession } from "@/features/authentification/client/authClient";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { ChevronDown, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BacktestCreateForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successId, setSuccessId] = React.useState<string | null>(null);
  
  // Store full symbol data including timeframes
  const [availableData, setAvailableData] = React.useState<{
    symbol: string, 
    timeframes: Record<string, { min: string | null, max: string | null }>
  }[]>([]);
  const [availableTimeframes, setAvailableTimeframes] = React.useState<string[]>([]);
  const [dateRange, setDateRange] = React.useState<{min: string, max: string}>({min: "", max: ""});
  
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = React.useState(false);
  const [symbolSearch, setSymbolSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsSymbolDropdownOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, []);

  const [loadingSymbols, setLoadingSymbols] = React.useState(true);
  const [symbolError, setSymbolError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoadingSymbols(true);
    // Fetch available symbols and their timeframes
    fetch("/api/symbols")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch symbols");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableData(data);
        } else {
          console.error("Data is not an array:", data);
          setSymbolError("Invalid data format");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch symbols", err);
        setSymbolError("Failed to load symbols");
      })
      .finally(() => {
        setLoadingSymbols(false);
      });
  }, []);

  const [formData, setFormData] = React.useState({
    symbols: "",
    start: "2023-01-01",
    end: "2023-12-31",
    timeframe: "1d",
    initialCash: 10000,
    feeRate: 0.001,
    marginRequirement: 0.5,
  });

  // Update available timeframes when selected symbols change
  React.useEffect(() => {
    const selectedSymbols = formData.symbols.split(",").map(s => s.trim()).filter(Boolean);
    
    if (selectedSymbols.length === 0) {
      setAvailableTimeframes([]);
      return;
    }

    // Find intersection of timeframes for all selected symbols
    const timeframesSets = selectedSymbols.map(sym => {
      const data = availableData.find(d => d.symbol === sym);
      return data ? new Set(Object.keys(data.timeframes)) : new Set<string>();
    });

    if (timeframesSets.length > 0) {
      // Start with the first set and intersect with others
      let intersection = new Set(timeframesSets[0]);
      for (let i = 1; i < timeframesSets.length; i++) {
        intersection = new Set([...intersection].filter(x => timeframesSets[i].has(x)));
      }
      const sortedTimeframes = Array.from(intersection).sort();
      setAvailableTimeframes(sortedTimeframes);

      // If current timeframe is not in the new list, reset it to the first available or empty
      if (!intersection.has(formData.timeframe) && sortedTimeframes.length > 0) {
          setFormData(prev => ({ ...prev, timeframe: sortedTimeframes[0] }));
      } else if (sortedTimeframes.length === 0) {
          setFormData(prev => ({ ...prev, timeframe: "" }));
      }
    }
  }, [formData.symbols, availableData]);

  // Update date range when symbols OR timeframe changes
  React.useEffect(() => {
    const selectedSymbols = formData.symbols.split(",").map(s => s.trim()).filter(Boolean);
    const selectedTimeframe = formData.timeframe;

    if (selectedSymbols.length === 0 || !selectedTimeframe) {
        setDateRange({ min: "", max: "" });
        return;
    }

    // Calculate valid date range (intersection of all selected symbols for the selected timeframe)
    let maxMinDate = ""; // The latest start date
    let minMaxDate = ""; // The earliest end date

    selectedSymbols.forEach(sym => {
        const data = availableData.find(d => d.symbol === sym);
        if (data && data.timeframes[selectedTimeframe]) {
            const tfData = data.timeframes[selectedTimeframe];
            if (tfData.min) {
                if (!maxMinDate || tfData.min > maxMinDate) maxMinDate = tfData.min;
            }
            if (tfData.max) {
                if (!minMaxDate || tfData.max < minMaxDate) minMaxDate = tfData.max;
            }
        }
    });

    // Format dates to YYYY-MM-DD for input[type="date"]
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toISOString().split('T')[0];
    };

    const newMin = formatDate(maxMinDate);
    const newMax = formatDate(minMaxDate);
    
    setDateRange({ min: newMin, max: newMax });

    // Adjust current selection if out of bounds or if it's the default value
    if (newMin) {
         setFormData(prev => ({ ...prev, start: newMin }));
    }
    if (newMax) {
         setFormData(prev => ({ ...prev, end: newMax }));
    }
  }, [formData.symbols, formData.timeframe, availableData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSymbolChange = (symbol: string) => {
    const currentSymbols = formData.symbols ? formData.symbols.split(",").map(s => s.trim()).filter(Boolean) : [];
    let newSymbols;
    if (currentSymbols.includes(symbol)) {
      newSymbols = currentSymbols.filter(s => s !== symbol);
    } else {
      newSymbols = [...currentSymbols, symbol];
    }
    setFormData(prev => ({ ...prev, symbols: newSymbols.join(", ") }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessId(null);

    try {
      // Prepare data
      const payload = {
        symbols: formData.symbols.split(",").map((s) => s.trim()).filter(Boolean),
        start: formData.start,
        end: formData.end,
        timeframe: formData.timeframe,
        initialCash: Number(formData.initialCash),
        feeRate: Number(formData.feeRate),
        marginRequirement: Number(formData.marginRequirement),
      };
      
      if (payload.symbols.length === 0) {
        throw new Error("Veuillez sélectionner au moins un symbole.");
      }
      if (!payload.timeframe) {
        throw new Error("Veuillez sélectionner un timeframe valide pour les symboles choisis.");
      }

      const result = await backtestApi.create(payload);
      setSuccessId(result.id);
      // Optionally redirect or show success message
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
          <AlertDescription>
            Le compte de démonstration ne peut pas créer de nouveaux backtests.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Données de Marché</CardTitle>
          <CardDescription>
            Sélectionnez les actifs et la période sur laquelle vous souhaitez tester votre stratégie.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <Field>
                <FieldLabel htmlFor="symbols">Symboles</FieldLabel>
                <div className="relative flex flex-col gap-2" ref={dropdownRef}>
                    <div 
                        className="relative flex min-h-[42px] w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => {
                          setIsSymbolDropdownOpen(!isSymbolDropdownOpen);
                          if (!isSymbolDropdownOpen) {
                            setSymbolSearch("");
                          }
                        }}
                    >
                        <div className="flex flex-wrap gap-1.5">
                            {formData.symbols ? (
                                formData.symbols.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                    <span key={s} className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-medium border border-primary/20">
                                        {s}
                                    </span>
                                ))
                            ) : (
                                <span className="text-muted-foreground">Sélectionner des symboles...</span>
                            )}
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                    </div>
                    
                    {isSymbolDropdownOpen && (
                        <div className="absolute z-50 mt-[46px] w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 animate-in fade-in-0 zoom-in-95">
                            <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                              <Input 
                                placeholder="Rechercher un actif..." 
                                value={symbolSearch}
                                onChange={(e) => setSymbolSearch(e.target.value)}
                                className="h-8 text-xs"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            {loadingSymbols ? (
                                <div className="p-4 text-sm text-muted-foreground text-center">Chargement des symboles...</div>
                            ) : symbolError ? (
                                <div className="p-4 text-sm text-destructive text-center">{symbolError}</div>
                            ) : availableData.length === 0 ? (
                                <div className="p-4 text-sm text-muted-foreground text-center">Aucun symbole disponible</div>
                            ) : (
                                <div className="p-1">
                                  {availableData
                                    .filter(d => d.symbol.toLowerCase().includes(symbolSearch.toLowerCase()))
                                    .map(d => {
                                      const s = d.symbol;
                                      const isSelected = formData.symbols.split(',').map(x => x.trim()).includes(s);
                                      return (
                                          <div
                                              key={s}
                                              className={cn(
                                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
                                                  isSelected ? "bg-accent font-medium" : ""
                                              )}
                                              onClick={() => handleSymbolChange(s)}
                                          >
                                              <div className="flex items-center gap-3 w-full">
                                                  <div className={cn("flex h-4 w-4 items-center justify-center rounded border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                      <Check className={cn("h-3 w-3")} />
                                                  </div>
                                                  <span>{s}</span>
                                              </div>
                                          </div>
                                      )
                                  })}
                                  {availableData.filter(d => d.symbol.toLowerCase().includes(symbolSearch.toLowerCase())).length === 0 && (
                                    <div className="p-4 text-sm text-muted-foreground text-center">Aucun résultat</div>
                                  )}
                                </div>
                            )}
                        </div>
                    )}
                    <p className="text-[0.8rem] text-muted-foreground">
                        Sélectionnez un ou plusieurs actifs pour votre backtest.
                    </p>
                </div>
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field>
                  <FieldLabel htmlFor="timeframe">Timeframe</FieldLabel>
                  <div className="flex flex-col gap-2">
                      <select
                          id="timeframe"
                          name="timeframe"
                          value={formData.timeframe}
                          onChange={handleChange}
                          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={availableTimeframes.length === 0}
                      >
                          {availableTimeframes.length === 0 ? (
                              <option value="">Sélectionnez des symboles</option>
                          ) : (
                              availableTimeframes.map(tf => (
                                  <option key={tf} value={tf}>{tf}</option>
                              ))
                          )}
                      </select>
                      {availableTimeframes.length === 0 && formData.symbols.length > 0 && (
                          <p className="text-xs text-destructive font-medium">
                              Aucun timeframe commun.
                          </p>
                      )}
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="start">Date de début</FieldLabel>
                  <Input
                    id="start"
                    name="start"
                    type="date"
                    value={formData.start}
                    onChange={handleChange}
                    min={dateRange.min}
                    max={dateRange.max}
                    className="h-10"
                  />
                  {dateRange.min && <FieldDescription className="text-xs">Min: {dateRange.min}</FieldDescription>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="end">Date de fin</FieldLabel>
                  <Input
                    id="end"
                    name="end"
                    type="date"
                    value={formData.end}
                    onChange={handleChange}
                    min={dateRange.min}
                    max={dateRange.max}
                    className="h-10"
                  />
                  {dateRange.max && <FieldDescription className="text-xs">Max: {dateRange.max}</FieldDescription>}
                </Field>
              </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres du Broker</CardTitle>
          <CardDescription>
            Configurez les conditions de simulation (capital, frais, levier) pour refléter un environnement réel.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field>
                <FieldLabel htmlFor="initialCash">Capital Initial ($)</FieldLabel>
                <Input
                  id="initialCash"
                  name="initialCash"
                  type="number"
                  value={formData.initialCash}
                  onChange={handleChange}
                  required
                  className="h-10"
                  placeholder="10000"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="feeRate">Frais de transaction (%)</FieldLabel>
                <Input
                  id="feeRate"
                  name="feeRate"
                  type="number"
                  step="0.0001"
                  value={formData.feeRate}
                  onChange={handleChange}
                  required
                  className="h-10"
                  placeholder="0.001"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="marginRequirement">Marge Requise</FieldLabel>
                <Input
                  id="marginRequirement"
                  name="marginRequirement"
                  type="number"
                  step="0.1"
                  value={formData.marginRequirement}
                  onChange={handleChange}
                  required
                  className="h-10"
                  placeholder="1.0"
                />
              </Field>
            </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md flex items-center gap-2 text-destructive text-sm">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {successId && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-md animate-in fade-in slide-in-from-bottom-2">
          <p className="text-green-800 font-medium flex items-center gap-2">
            <Check className="h-4 w-4" />
            Backtest créé avec succès !
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-green-700 text-sm">
              ID du Run : <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono select-all font-bold">{successId}</code>
            </p>
            <div className="text-green-700 text-sm bg-green-100/50 p-2 rounded border border-green-200">
              <p className="mb-1 font-medium text-xs uppercase tracking-wider opacity-70">À copier dans main.py</p>
              <code className="font-mono block select-all">
                RUN_ID = "{successId}"
              </code>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4">
        <Button type="submit" disabled={loading} className="w-full h-11 text-base">
          {loading ? "Création de la configuration..." : "Créer la configuration"}
        </Button>
      </div>
    </form>
  );
}
