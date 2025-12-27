"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createPortfolioAction } from "@/server/actions/portfolios";
import { useAvailableSymbols } from "@/hooks/use-available-symbols";
import { MarketExplorer } from "@/components/portfolios/market-explorer";
import { SymbolData } from "@/types/symbol";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, X, Layers, ArrowRight } from "lucide-react";

export function PortfolioCreateForm({ initialSymbols }: { initialSymbols?: SymbolData[] }) {
  const router = useRouter();

  // Form state
  const [portfolioName, setPortfolioName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Market explorer state
  const { availableSymbolsData, isSymbolsLoading, availableSectors } = useAvailableSymbols(initialSymbols);

  const [selectedSymbols, setSelectedSymbols] = React.useState<string[]>([]);
  const [symbolSearchQuery, setSymbolSearchQuery] = React.useState("");
  const [selectedSector, setSelectedSector] = React.useState<string>("All");

  // Gestion de la sélection des symboles
  const toggleSymbolSelection = React.useCallback((symbol: string) => {
    setSelectedSymbols((prevSelected) =>
      prevSelected.includes(symbol)
        ? prevSelected.filter((s) => s !== symbol)
        : [...prevSelected, symbol]
    );
  }, []);

  // Validation du formulaire
  const canSubmit = portfolioName.trim().length > 0 && selectedSymbols.length > 0 && !isSubmitting;

  // Gestion de la soumission du formulaire de création de portefeuille
  const handleCreatePortfolio = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = portfolioName.trim();

    if (!normalizedName) return;
    if (selectedSymbols.length === 0) return;

    setIsSubmitting(true);

    try {
      await createPortfolioAction({
        name: normalizedName,
        symbols: selectedSymbols,
      });
      router.push("/portfolios");
    } 
    catch (error) {
      console.error(error);
    } 
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreatePortfolio} className="grid gap-6 lg:grid-cols-3 lg:gap-8 h-[calc(100vh-200px)] min-h-[600px]">
      
      {/* Left Column: Details & Recap */}
      <div className="lg:col-span-1 flex flex-col gap-6 h-full">
        <Card className="border-muted-foreground/20 shadow-sm">
          <CardHeader className="bg-muted/30 px-6 py-5 space-y-2">
             <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Portfolio Details</CardTitle>
                <CardDescription>Name your new strategy collection</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor="portfolioName">Name</Label>
              <Input
                id="portfolioName"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                placeholder="e.g. Tech Growth 2024"
                autoComplete="off"
                className="bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col border-muted-foreground/20 shadow-sm overflow-hidden min-h-0 max-h-[500px]">
          <CardHeader className="bg-muted/30 px-6 py-4 pb-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Selected Assets</CardTitle>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {selectedSymbols.length}
              </Badge>
            </div>
          </CardHeader>
          
          <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
            {selectedSymbols.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2 opacity-60">
                <Layers className="h-8 w-8 opacity-20" />
                <p>No assets selected yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedSymbols.map(sym => (
                  <div key={sym} className="flex items-center justify-between p-2 rounded-md bg-background border shadow-sm group">
                    <span className="font-medium text-sm pl-1">{sym}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => toggleSymbolSelection(sym)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-background shrink-0">
            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isSubmitting ? "Creating..." : "Create Portfolio"}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </Card>
      </div>

      {/* Right Column: Market Explorer */}
      <div className="lg:col-span-2 h-full min-h-0">
        <MarketExplorer
          availableData={availableSymbolsData}
          loadingSymbols={isSymbolsLoading}
          selectedSymbols={selectedSymbols}
          toggleSymbol={toggleSymbolSelection}
          symbolSearch={symbolSearchQuery}
          setSymbolSearch={setSymbolSearchQuery}
          selectedCategory={selectedSector}
          setSelectedCategory={setSelectedSector}
          categories={availableSectors}
        />
      </div>
    </form>
  );
}
