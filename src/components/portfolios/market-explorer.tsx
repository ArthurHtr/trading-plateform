"use client";

import * as React from "react";

// UI components
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SymbolData } from "@/types/symbol";

// Props de MarketExplorer
interface MarketExplorerProps {
  availableData: SymbolData[];
  loadingSymbols: boolean;
  selectedSymbols: string[];
  toggleSymbol: (symbol: string) => void;
  symbolSearch: string;
  setSymbolSearch: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: string[];
}


export function MarketExplorer({ availableData, loadingSymbols, selectedSymbols, toggleSymbol, symbolSearch, setSymbolSearch, selectedCategory, setSelectedCategory, categories }: MarketExplorerProps) {
  
  // Filtrage des symboles en fonction de la recherche et de la catégorie sélectionnée
  const filteredSymbols = React.useMemo(() => {

    return availableData.filter(d => {
      const matchesSearch = d.symbol.toLowerCase().includes(symbolSearch.toLowerCase()) || (d.name && d.name.toLowerCase().includes(symbolSearch.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || (d.sector || "Other") === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [availableData, symbolSearch, selectedCategory]);

  return (
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
  );
}
