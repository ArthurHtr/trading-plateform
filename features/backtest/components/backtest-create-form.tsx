"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { backtestApi } from "@/features/backtest/client/backtest-api";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

export function BacktestCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successId, setSuccessId] = React.useState<string | null>(null);
  
  // Store full symbol data including timeframes
  const [availableData, setAvailableData] = React.useState<{symbol: string, timeframes: string[]}[]>([]);
  const [availableTimeframes, setAvailableTimeframes] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Fetch available symbols and their timeframes
    fetch("/api/symbols")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableData(data);
        }
      })
      .catch((err) => console.error("Failed to fetch symbols", err));
  }, []);

  const [formData, setFormData] = React.useState({
    symbols: "",
    start: "2023-01-01",
    end: "2023-12-31",
    timeframe: "1d",
    initialCash: 10000,
    feeRate: 0.001,
    marginRequirement: 1.0,
    seed: "",
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
      return data ? new Set(data.timeframes) : new Set<string>();
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
        seed: formData.seed ? Number(formData.seed) : undefined,
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
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]">
                        {availableData.length === 0 ? (
                            <span className="text-sm text-muted-foreground">Chargement...</span>
                        ) : (
                            availableData.map(d => {
                                const s = d.symbol;
                                const isSelected = formData.symbols.split(',').map(x => x.trim()).includes(s);
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => handleSymbolChange(s)}
                                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                                            isSelected 
                                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white" 
                                            : "bg-transparent text-muted-foreground border-input hover:border-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                )
                            })
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Cliquez pour sélectionner/désélectionner les actifs.
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
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="end">Date de fin</FieldLabel>
                <Input
                  id="end"
                  name="end"
                  type="date"
                  value={formData.end}
                  onChange={handleChange}
                  required
                />
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

            <Field>
              <FieldLabel htmlFor="seed">Seed (Optionnel)</FieldLabel>
              <Input
                id="seed"
                name="seed"
                type="number"
                value={formData.seed}
                onChange={handleChange}
                placeholder="42"
              />
            </Field>

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
