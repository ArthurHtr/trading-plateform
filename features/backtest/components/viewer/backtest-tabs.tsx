import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Filter, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { OrdersTable } from "../../components/orders-table";
import { TradingChart } from "../../components/chart/trading-chart";

interface BacktestTabsProps {
  orders: any[];
  candlesLogs: any[];
  symbols: string[];
  finalPositions: { symbol: string; quantity: number }[];
}

export function BacktestTabs({ orders, candlesLogs, symbols, finalPositions }: BacktestTabsProps) {
  const [tradeFilterSymbol, setTradeFilterSymbol] = useState<string>("ALL");
  const [tradeFilterStartDate, setTradeFilterStartDate] = useState<string>("");
  const [tradeFilterEndDate, setTradeFilterEndDate] = useState<string>("");

  // Filter Orders
  const { executedOrders, rejectedOrders } = useMemo(() => {
    const filtered = orders.filter((order: any) => {
      const matchSymbol = tradeFilterSymbol === "ALL" || order.symbol === tradeFilterSymbol;
      let matchDate = true;
      if (tradeFilterStartDate) {
        matchDate = matchDate && new Date(order.timestamp) >= new Date(tradeFilterStartDate);
      }
      if (tradeFilterEndDate) {
        matchDate = matchDate && new Date(order.timestamp) <= new Date(tradeFilterEndDate);
      }
      return matchSymbol && matchDate;
    });

    return {
      executedOrders: filtered.filter((o: any) => o.status === "FILLED" || o.status === "LIQUIDATED"),
      rejectedOrders: filtered.filter((o: any) => o.status === "REJECTED")
    };
  }, [orders, tradeFilterSymbol, tradeFilterStartDate, tradeFilterEndDate]);

  // Extract Position Curve (for selected symbol in Trade History)
  const positionCurve = useMemo(() => {
    if (tradeFilterSymbol === "ALL") return [];
    
    return candlesLogs.map((log: any) => {
      const positions = log.snapshot_after?.positions || [];
      // positions is a list of objects {symbol, quantity, side, ...}
      const pos = positions.find((p: any) => p.symbol === tradeFilterSymbol);
      
      let quantity = 0;
      if (pos) {
        quantity = pos.quantity;
        // Handle SHORT positions as negative values
        if (pos.side === "SHORT") {
            quantity = -quantity;
        }
      }
      
      return {
        time: log.timestamp,
        value: quantity,
        open: quantity,
        high: quantity,
        low: quantity,
        close: quantity,
      };
    });
  }, [candlesLogs, tradeFilterSymbol]);

  return (
    <Tabs defaultValue="executed" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="executed">Executed Trades ({executedOrders.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected Orders ({rejectedOrders.length})</TabsTrigger>
          <TabsTrigger value="positions">Final Positions</TabsTrigger>
        </TabsList>

        {/* Filters - Visible for trade tabs */}
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
                value={tradeFilterSymbol}
                onChange={(e) => setTradeFilterSymbol(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
                <option value="ALL">All Symbols</option>
                {symbols.map((sym) => (
                <option key={sym} value={sym}>
                    {sym}
                </option>
                ))}
            </select>
            </div>
            <div className="flex items-center gap-2">
            <Input
                type="date"
                value={tradeFilterStartDate}
                onChange={(e) => setTradeFilterStartDate(e.target.value)}
                className="h-8 w-auto"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
                type="date"
                value={tradeFilterEndDate}
                onChange={(e) => setTradeFilterEndDate(e.target.value)}
                className="h-8 w-auto"
            />
            </div>
            {(tradeFilterSymbol !== "ALL" || tradeFilterStartDate || tradeFilterEndDate) && (
            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                setTradeFilterSymbol("ALL");
                setTradeFilterStartDate("");
                setTradeFilterEndDate("");
                }}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                title="Clear Filters"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear Filters</span>
            </Button>
            )}
        </div>
      </div>

      <TabsContent value="executed" className="mt-0">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Executed Trades History</CardTitle>
          </CardHeader>
          <CardContent>
            {tradeFilterSymbol !== "ALL" && positionCurve.length > 0 && (
              <div className="mb-6 space-y-2">
                 <h3 className="text-sm font-medium text-muted-foreground">Position History: {tradeFilterSymbol}</h3>
                 <div className="h-[250px] w-full border rounded-md overflow-hidden">
                   <TradingChart 
                      data={positionCurve} 
                      type="line" 
                      colors={{ lineColor: "#8884d8" }}
                      mainSeriesName="Position"
                   />
                 </div>
              </div>
            )}
            <div className="max-h-[600px] overflow-y-auto">
              <OrdersTable orders={executedOrders} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rejected" className="mt-0">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-destructive">Rejected Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto">
              <OrdersTable orders={rejectedOrders} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="positions" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Final Portfolio Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finalPositions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No open positions
                    </TableCell>
                  </TableRow>
                ) : (
                  finalPositions.map((pos) => (
                    <TableRow key={pos.symbol}>
                      <TableCell className="font-medium">{pos.symbol}</TableCell>
                      <TableCell className="text-right">{pos.quantity}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
