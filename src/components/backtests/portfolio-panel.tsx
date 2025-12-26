"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, X } from "lucide-react";

interface PortfolioPanelProps {
  selectedSymbols: string[];
  toggleSymbol: (symbol: string) => void;
  portfolioValidated: boolean;
  setPortfolioValidated: (validated: boolean) => void;
}

export function PortfolioPanel({
  selectedSymbols,
  toggleSymbol,
  portfolioValidated,
  setPortfolioValidated,
}: PortfolioPanelProps) {
  return (
    <Card className="w-full lg:w-[350px] flex flex-col border-muted shadow-sm shrink-0">
      <CardHeader className="py-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4" />
          Mon Portefeuille
        </CardTitle>
        <Badge variant="secondary" className="ml-auto">{selectedSymbols.length}</Badge>
      </CardHeader>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[150px]">
        {selectedSymbols.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm p-4 text-center border-2 border-dashed rounded-md m-2">
            <Plus className="h-8 w-8 mb-2 opacity-20" />
            <p>Sélectionnez des actifs à gauche pour construire votre portefeuille</p>
          </div>
        ) : (
          selectedSymbols.map(sym => (
            <div key={sym} className="flex items-center justify-between p-2 rounded-md bg-card border hover:bg-accent/50 transition-colors group">
              <span className="font-medium">{sym}</span>
              {!portfolioValidated && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toggleSymbol(sym)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t bg-muted/20">
        {!portfolioValidated ? (
          <Button 
            className="w-full" 
            disabled={selectedSymbols.length === 0}
            onClick={() => setPortfolioValidated(true)}
          >
            Valider le Portefeuille
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full border-dashed"
            onClick={() => setPortfolioValidated(false)}
          >
            Modifier la sélection
          </Button>
        )}
      </div>
    </Card>
  );
}
