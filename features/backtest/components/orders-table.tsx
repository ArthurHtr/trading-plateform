"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { format } from "date-fns";
import { ArrowUp, ArrowDown, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT" | "LIQUIDATION";
  status: "FILLED" | "CANCELED" | "REJECTED" | "LIQUIDATED";
  quantity: number;
  price: number;
  fee: number;
  timestamp: string;
  reason?: string;
}

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const hasRejected = orders.some(o => o.status === "REJECTED");

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Date</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            {!hasRejected && <TableHead className="text-right">Price</TableHead>}
            {!hasRejected && <TableHead className="text-right">Fee</TableHead>}
            {!hasRejected && <TableHead className="text-right">Total</TableHead>}
            {hasRejected && <TableHead>Reason</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="group">
              <TableCell className="font-mono text-xs text-muted-foreground">
                {format(new Date(order.timestamp), "yyyy-MM-dd HH:mm:ss")}
              </TableCell>
              <TableCell className="font-semibold">{order.symbol}</TableCell>
              <TableCell>
                <div className={cn(
                    "flex items-center gap-1 font-medium",
                    order.side === "BUY" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                    {order.side === "BUY" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    {order.side}
                </div>
              </TableCell>
              <TableCell>
                  <Badge variant="outline" className="text-xs font-normal">
                      {order.type}
                  </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                    {order.status === "FILLED" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {order.status === "LIQUIDATED" && <AlertCircle className="w-4 h-4 text-red-600" />}
                    {order.status === "REJECTED" && <XCircle className="w-4 h-4 text-orange-500" />}
                    
                    <span className={cn(
                        "text-sm font-medium",
                        order.status === "FILLED" && "text-green-600 dark:text-green-400",
                        order.status === "LIQUIDATED" && "text-red-600 dark:text-red-400",
                        order.status === "REJECTED" && "text-orange-600 dark:text-orange-400",
                    )}>
                        {order.status}
                    </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                  {order.quantity}
              </TableCell>
              
              {!hasRejected && (
                  <>
                    <TableCell className="text-right font-mono">
                        ${order.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-500 text-xs">
                        {order.fee > 0 ? `-$${order.fee.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                        ${(order.quantity * order.price).toFixed(2)}
                    </TableCell>
                  </>
              )}

              {hasRejected && (
                  <TableCell className="text-destructive text-sm max-w-[300px] truncate" title={order.reason}>
                      {order.reason || "-"}
                  </TableCell>
              )}
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={hasRejected ? 7 : 9} className="h-24 text-center text-muted-foreground">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
