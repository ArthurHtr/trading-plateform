"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { portfolioApi } from "@/lib/api/portfolio-api";
import { useAvailableSymbols } from "@/hooks/use-available-symbols";
import { MarketExplorer, SymbolData } from "@/components/portfolios/market-explorer";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


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
      // Appel à l'API pour créer le portefeuille  
      await portfolioApi.create({
        name: normalizedName,
        symbols: selectedSymbols,
      });
      // Redirection vers la liste des portefeuilles
      router.push("/portfolios");
      router.refresh();
    } 
    catch (error) {
      console.error(error);
    } 
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreatePortfolio} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="portfolioName">Name</Label>
            <Input
              id="portfolioName"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              placeholder="My Tech Portfolio"
              autoComplete="off"
            />
          </div>
        </CardContent>
      </Card>

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

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>

        <Button type="submit" disabled={!canSubmit}>
          {isSubmitting ? "Creating..." : "Create Portfolio"}
        </Button>
      </div>
    </form>
  );
}
