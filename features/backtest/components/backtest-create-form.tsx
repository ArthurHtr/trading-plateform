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

  const [formData, setFormData] = React.useState({
    symbols: "BTC/USD",
    start: "2023-01-01",
    end: "2023-12-31",
    timeframe: "1h",
    initialCash: 10000,
    feeRate: 0.001,
    marginRequirement: 1.0,
    seed: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessId(null);

    try {
      // Prepare data
      const payload = {
        symbols: formData.symbols.split(",").map((s) => s.trim()),
        start: formData.start,
        end: formData.end,
        timeframe: formData.timeframe,
        initialCash: Number(formData.initialCash),
        feeRate: Number(formData.feeRate),
        marginRequirement: Number(formData.marginRequirement),
        seed: formData.seed ? Number(formData.seed) : undefined,
      };

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
                <FieldLabel htmlFor="symbols">Symboles (séparés par virgule)</FieldLabel>
                <Input
                  id="symbols"
                  name="symbols"
                  value={formData.symbols}
                  onChange={handleChange}
                  placeholder="BTC/USD, ETH/USD"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="timeframe">Timeframe</FieldLabel>
                <Input
                  id="timeframe"
                  name="timeframe"
                  value={formData.timeframe}
                  onChange={handleChange}
                  placeholder="1h, 1d, 15m"
                  required
                />
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
