import { BacktestCreateForm } from "@/features/backtest/client/backtest-create-form";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/features/authentification/server/auth";

export default async function CreateBacktestPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="container mx-auto py-10">
      <BacktestCreateForm />
    </div>
  );
}
