"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updatePortfolioAction, deletePortfolioAction } from "@/server/actions/portfolios";
import { useAvailableSymbols } from "@/hooks/use-available-symbols";
import { MarketExplorer } from "@/components/portfolios/market-explorer";
import { SymbolData } from "@/types/symbol";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, X, Layers, Save, Trash2, ArrowLeft } from "lucide-react";

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

  // Form state
  const [name, setName] = React.useState(portfolio.name);
  const [loading, setLoading] = React.useState(false);

  // Market explorer state
  const { availableSymbolsData, isSymbolsLoading, availableSectors } = useAvailableSymbols(initialSymbols);

  const [selectedSymbols, setSelectedSymbols] = React.useState<string[]>(portfolio.symbols);
  const [symbolSearch, setSymbolSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  // Gestion de la sélection des symboles
  const toggleSymbol = React.useCallback((symbol: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  }, []);

  // Gestion de la sauvegarde
  const handleSave = async () => {
    if (!name || selectedSymbols.length === 0) return;
    setLoading(true);

    try {
      await updatePortfolioAction({
        id: portfolio.id,
        name,
        symbols: selectedSymbols
      });
      router.push("/portfolios");
    } 
    catch (error) {
      console.error(error);
    } 
    finally {
      setLoading(false);
    }
  };

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this portfolio?")) return;
    setLoading(true);

    try {
      await deletePortfolioAction(portfolio.id);
      router.push("/portfolios");
    } 
    catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = name.trim().length > 0 && selectedSymbols.length > 0 && !loading;

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 h-[calc(100vh-200px)] min-h-[600px]">
      
      {/* Left Column: Details & Recap */}
      <div className="lg:col-span-1 flex flex-col gap-6 h-full">

        <Card className="border-muted-foreground/20 shadow-sm">
          <CardHeader className="bg-muted/30 px-6 py-5 space-y-2">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Edit Portfolio</CardTitle>
                        <CardDescription>Update your strategy settings</CardDescription>
                    </div>
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
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
                <p>No assets selected</p>
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
                      onClick={() => toggleSymbol(sym)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-background shrink-0 flex flex-col gap-3">
            <Button onClick={handleSave} className="w-full" disabled={!canSubmit}>
              {loading ? "Saving..." : "Save Changes"}
              {!loading && <Save className="ml-2 h-4 w-4" />}
            </Button>
            
            <Button variant="outline" onClick={handleDelete} disabled={loading} className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
               Delete Portfolio
               <Trash2 className="ml-2 h-4 w-4" />
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
          toggleSymbol={toggleSymbol}
          symbolSearch={symbolSearch}
          setSymbolSearch={setSymbolSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={availableSectors}
        />
      </div>
    </div>
  );
}
