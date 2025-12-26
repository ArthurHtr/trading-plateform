import { BacktestCreateForm } from "@/components/backtests/creation/backtest-create-form";
import { requireSession } from "@/server/auth/guard.server";

export default async function CreateBacktestPage() {
  const session = await requireSession();

  return (
    <div className="container mx-auto py-10">
      <BacktestCreateForm />
    </div>
  );
}
