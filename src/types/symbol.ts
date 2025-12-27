export interface SymbolData {
  symbol: string;
  name?: string;
  base_asset: string;
  quote_asset: string;
  sector?: string;
  industry?: string;
  exchange?: string;
  price_step: number;
  quantity_step: number;
  min_quantity: number;
  candle_coverage_by_symbol: Record<string, { minTimestamp: number | null; maxTimestamp: number | null }>;
}
