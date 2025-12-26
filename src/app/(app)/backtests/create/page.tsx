import { BacktestCreateForm } from "@/components/backtests/backtest-create-form";
import { requireNonDemo, requireSession } from "@/server/auth/guard.server";

export default async function CreateBacktestPage() {
  await requireNonDemo();

  return (
    <div className="container mx-auto py-10">
      <BacktestCreateForm />
    </div>
  );
}
