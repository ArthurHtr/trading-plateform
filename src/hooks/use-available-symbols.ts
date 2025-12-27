import * as React from "react";
import { fetchAvailableSymbolsAction } from "@/server/actions/symbols";
import { SymbolData } from "@/types/symbol";

export function useAvailableSymbols(initialData?: SymbolData[]) {

  // State for available symbols data
  const [availableSymbolsData, setAvailableSymbolsData] = React.useState<SymbolData[]>(initialData || []);
  const [isSymbolsLoading, setIsSymbolsLoading] = React.useState(!initialData);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (initialData) return;

    let isMounted = true;

    const fetchSymbols = async () => {

      setIsSymbolsLoading(true);

      try {

        const data = await fetchAvailableSymbolsAction();

        if (isMounted && Array.isArray(data)) {
          const mappedData = data.map((s: any) => {
            const rawTimeframes = s.candle_coverage_by_symbol || {};
            const timeframes: Record<string, { min: string | null; max: string | null }> = {};
            
            Object.entries(rawTimeframes).forEach(([tf, range]: [string, any]) => {
                timeframes[tf] = {
                    min: range.minTimestamp ? new Date(Number(range.minTimestamp)).toISOString() : (range.min || null),
                    max: range.maxTimestamp ? new Date(Number(range.maxTimestamp)).toISOString() : (range.max || null)
                };
            });

            return {
              ...s,
              timeframes
            };
          });

          setAvailableSymbolsData(mappedData);
        }
      } 
      catch (err) {
        if (isMounted) {
          console.error(err);
          setError(err instanceof Error ? err : new Error("Failed to fetch symbols"));
        }
      } 
      finally {
        if (isMounted) setIsSymbolsLoading(false);
      }
    };

    fetchSymbols();

    return () => {
      isMounted = false;
    };
  }, [initialData]);

  // récupère la liste des secteurs disponibles pour les symbols disponibles pour le filtre
  const availableSectors = React.useMemo(() => {
    const sectors = new Set(
      availableSymbolsData
        .map((item) => item.sector || "Other")
        .filter(Boolean)
    );

    return ["All", ...Array.from(sectors).sort()];
  }, [availableSymbolsData]);

  return { availableSymbolsData, isSymbolsLoading, availableSectors, error };
}
