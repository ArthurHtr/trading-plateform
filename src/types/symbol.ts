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
  timeframes: Record<string, { min: string | null; max: string | null }>;
}
