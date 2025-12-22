import { BacktestCreateForm } from "@/features/backtest/client/backtest-create-form";
import { redirect } from "next/navigation";
import { getSession } from "@/features/authentification/server/auth";

export default async function CreateBacktestPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="container mx-auto py-10">
      <BacktestCreateForm />
    </div>
  );
}
