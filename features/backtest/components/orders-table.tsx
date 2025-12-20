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
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Fee</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                {format(new Date(order.timestamp), "yyyy-MM-dd HH:mm:ss")}
              </TableCell>
              <TableCell className="font-medium">{order.symbol}</TableCell>
              <TableCell>
                <Badge
                  variant={order.side === "BUY" ? "default" : "destructive"}
                >
                  {order.side}
                </Badge>
              </TableCell>
              <TableCell>{order.type}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge 
                    variant={order.status === "LIQUIDATED" || order.status === "REJECTED" ? "destructive" : "outline"}
                    className={order.status === "LIQUIDATED" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    {order.status}
                  </Badge>
                  {order.reason && (
                    <span className="text-xs text-muted-foreground max-w-[200px] truncate" title={order.reason}>
                      {order.reason}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">{order.quantity}</TableCell>
              <TableCell className="text-right">
                ${order.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-red-500">
                ${order.fee.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                ${(order.quantity * order.price).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
