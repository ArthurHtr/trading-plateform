"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BacktestConfigFormProps {
  config: {
    start: string;
    end: string;
    timeframe: string;
    initialCash: number;
    feeRate: number;
    marginRequirement: number;
  };
  handleConfigChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  availableTimeframes: string[];
  selectedSymbols: string[];
  dateRange: { min: string; max: string };
  portfolioValidated: boolean;
  loading: boolean;
  error: string | null;
  successId: string | null;
  handleSubmit: () => void;
}

export function BacktestConfigForm({
  config,
  handleConfigChange,
  availableTimeframes,
  selectedSymbols,
  dateRange,
  portfolioValidated,
  loading,
  error,
  successId,
  handleSubmit,
}: BacktestConfigFormProps) {
  return (
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
  );
}
