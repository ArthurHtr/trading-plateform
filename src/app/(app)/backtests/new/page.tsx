import { BacktestCreateForm } from "@/components/backtests/creation/backtest-create-form";
import { requireSession } from "@/server/auth/guard.server";
import { getAvailableSymbols } from "@/server/data/symbols";

export default async function CreateBacktestPage() {
  const session = await requireSession();
  const availableSymbols = await getAvailableSymbols();

  return (
    <div className="container mx-auto py-10">
      <BacktestCreateForm initialSymbols={availableSymbols} />
    </div>
  );
}
