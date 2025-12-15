import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/features/authentification/server/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/shared/components/ui/button";
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
import { Plus } from "lucide-react";

export default async function BacktestsListPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const backtests = await prisma.backtest.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backtests</h1>
          <p className="text-muted-foreground">
            Manage and view your backtest results.
          </p>
        </div>
        <Link href="/backtests/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Backtest
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy</TableHead>
              <TableHead>Symbols</TableHead>
              <TableHead>Timeframe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backtests.map((backtest) => (
              <TableRow key={backtest.id}>
                <TableCell className="font-medium">
                  <div className="font-semibold">{backtest.strategyName}</div>
                  {backtest.strategyParams && typeof backtest.strategyParams === 'object' && (
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {Object.entries(backtest.strategyParams as Record<string, any>)
                        .filter(([key]) => key !== 'prices')
                        .map(([key, value]) => (
                        <div key={key} className="flex gap-1">
                          <span className="opacity-70">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {backtest.symbols.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{backtest.timeframe}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      backtest.status === "COMPLETED"
                        ? "default"
                        : backtest.status === "FAILED"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {backtest.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(backtest.createdAt), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/backtests/${backtest.id}`}>
                    <Button variant="outline" size="sm">
                      View Results
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {backtests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No backtests found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
