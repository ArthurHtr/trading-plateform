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
  type: "MARKET" | "LIMIT";
  status: "FILLED" | "CANCELED" | "REJECTED";
  quantity: number;
  price: number;
  timestamp: string;
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
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                {format(new Date(order.timestamp), "yyyy-MM-dd HH:mm:ss")}
              </TableCell>
              <TableCell>{order.symbol}</TableCell>
              <TableCell>
                <Badge
                  variant={order.side === "BUY" ? "default" : "destructive"}
                >
                  {order.side}
                </Badge>
              </TableCell>
              <TableCell>{order.type}</TableCell>
              <TableCell>
                <Badge variant="outline">{order.status}</Badge>
              </TableCell>
              <TableCell className="text-right">{order.quantity}</TableCell>
              <TableCell className="text-right">
                ${order.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                ${(order.quantity * order.price).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
