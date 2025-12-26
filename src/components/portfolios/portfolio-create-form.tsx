"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { portfolioApi } from "@/lib/api/portfolio-api";
import { MarketExplorer, SymbolData } from "@/components/backtests/market-explorer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PortfolioCreateForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  
  // Market Explorer State
  const [availableData, setAvailableData] = React.useState<SymbolData[]>([]);
  const [loadingSymbols, setLoadingSymbols] = React.useState(true);
  const [selectedSymbols, setSelectedSymbols] = React.useState<string[]>([]);
  const [symbolSearch, setSymbolSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

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

  const categories = React.useMemo(() => {
    const cats = new Set(availableData.map(d => d.sector || "Other").filter(Boolean));
    return ["All", ...Array.from(cats).sort()];
  }, [availableData]);

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (selectedSymbols.length === 0) return;

    setLoading(true);
    try {
      await portfolioApi.create({ name, symbols: selectedSymbols });
      router.push("/portfolios");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="My Tech Portfolio" 
            />
          </div>
        </CardContent>
      </Card>

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

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !name || selectedSymbols.length === 0}>
          {loading ? "Creating..." : "Create Portfolio"}
        </Button>
      </div>
    </div>
  );
}
