"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { portfolioApi } from "@/lib/api/portfolio-api";
import { useAvailableSymbols } from "@/hooks/use-available-symbols";
import { MarketExplorer, SymbolData } from "@/components/portfolios/market-explorer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash } from "lucide-react";

interface PortfolioEditFormProps {
  portfolio: {
    id: string;
    name: string;
    symbols: string[];
  };
  initialSymbols?: SymbolData[];
}

export function PortfolioEditForm({ portfolio, initialSymbols }: PortfolioEditFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState(portfolio.name);
  const [loading, setLoading] = React.useState(false);
  
  const { availableSymbolsData: availableData, isSymbolsLoading: loadingSymbols, availableSectors: categories } = useAvailableSymbols(initialSymbols);
  const [selectedSymbols, setSelectedSymbols] = React.useState<string[]>(portfolio.symbols);
  const [symbolSearch, setSymbolSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const handleSave = async () => {
    if (!name || selectedSymbols.length === 0) return;
    setLoading(true);
    try {
      await portfolioApi.update(portfolio.id, { name, symbols: selectedSymbols });
      router.push("/portfolios");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this portfolio?")) return;
    setLoading(true);
    try {
      await portfolioApi.delete(portfolio.id);
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Edit Portfolio</h1>
        <Button variant="destructive" size="icon" onClick={handleDelete}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>

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
        <Button onClick={handleSave} disabled={loading || !name || selectedSymbols.length === 0}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
