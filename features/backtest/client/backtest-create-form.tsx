"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { backtestApi } from "@/features/backtest/client/backtest-api";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function BacktestCreateForm() {
  const router = useRouter();
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Lancer un Backtest</CardTitle>
        <CardDescription>
          Configurez les paramètres de votre backtest. Une fois créé, vous obtiendrez un ID à utiliser avec votre script Python.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="symbols">Symboles disponibles</FieldLabel>
                <div className="flex flex-col gap-2" ref={dropdownRef}>
                    <div 
                        className="relative flex min-h-[42px] w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        onClick={() => setIsSymbolDropdownOpen(!isSymbolDropdownOpen)}
                    >
                        <div className="flex flex-wrap gap-1">
                            {formData.symbols ? (
                                formData.symbols.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                    <span key={s} className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded text-xs">
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
                        <div className="absolute z-50 mt-[44px] w-[calc(100%-2rem)] max-w-[300px] md:max-w-[300px] overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md max-h-60">
                            {loadingSymbols ? (
                                <div className="p-2 text-sm text-muted-foreground">Chargement...</div>
                            ) : symbolError ? (
                                <div className="p-2 text-sm text-destructive">{symbolError}</div>
                            ) : availableData.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground">Aucun symbole disponible</div>
                            ) : (
                                availableData.map(d => {
                                    const s = d.symbol;
                                    const isSelected = formData.symbols.split(',').map(x => x.trim()).includes(s);
                                    return (
                                        <div
                                            key={s}
                                            className={cn(
                                                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                isSelected ? "bg-accent" : ""
                                            )}
                                            onClick={() => handleSymbolChange(s)}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <div className={cn("flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                    <Check className={cn("h-3 w-3")} />
                                                </div>
                                                <span>{s}</span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Cliquez pour ouvrir la liste et sélectionner les actifs.
                    </p>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="timeframe">Timeframe</FieldLabel>
                <div className="flex flex-col gap-2">
                    <select
                        id="timeframe"
                        name="timeframe"
                        value={formData.timeframe}
                        onChange={handleChange}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={availableTimeframes.length === 0}
                    >
                        {availableTimeframes.length === 0 ? (
                            <option value="">Sélectionnez d'abord des symboles</option>
                        ) : (
                            availableTimeframes.map(tf => (
                                <option key={tf} value={tf}>{tf}</option>
                            ))
                        )}
                    </select>
                    {availableTimeframes.length === 0 && formData.symbols.length > 0 && (
                        <p className="text-xs text-red-500">
                            Aucun timeframe commun trouvé pour ces symboles.
                        </p>
                    )}
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                />
                {dateRange.min && <FieldDescription className="text-xs">Disponible à partir du: {dateRange.min}</FieldDescription>}
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
                />
                {dateRange.max && <FieldDescription className="text-xs">Disponible jusqu'au: {dateRange.max}</FieldDescription>}
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="initialCash">Capital Initial</FieldLabel>
                <Input
                  id="initialCash"
                  name="initialCash"
                  type="number"
                  value={formData.initialCash}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="feeRate">Frais (%)</FieldLabel>
                <Input
                  id="feeRate"
                  name="feeRate"
                  type="number"
                  step="0.0001"
                  value={formData.feeRate}
                  onChange={handleChange}
                  required
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
                />
              </Field>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {successId && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                <p className="text-green-800 font-medium">Backtest créé avec succès !</p>
                <p className="text-green-700 text-sm mt-1">
                  ID du Run : <code className="bg-green-100 px-1 py-0.5 rounded font-mono select-all">{successId}</code>
                </p>
                <p className="text-green-700 text-sm mt-2">
                  Copiez cet ID dans votre script <code>main.py</code> :
                  <br />
                  <code className="bg-green-100 px-1 py-0.5 rounded font-mono block mt-1">
                    RUN_ID = "{successId}"
                  </code>
                </p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Création..." : "Créer la configuration"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
