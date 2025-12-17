import { headers } from "next/headers";
import { auth } from "@/features/authentification/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/backtests");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-10 text-center px-4">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Trading Platform
      </h1>
      <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
        Advanced backtesting engine with Python SDK support. 
        Visualize your trading strategies with interactive charts and detailed metrics.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button asChild size="lg">
          <Link href="/auth/sign-up">Get started</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/auth/sign-in">Log in <span aria-hidden="true">→</span></Link>
        </Button>
      </div>
    </div>
  )
}

