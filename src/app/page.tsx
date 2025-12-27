import { getSession } from "@/server/auth/guard.server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LineChart, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function LandingPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            SimTrading
          </h1>
          <p className="text-lg text-muted-foreground">
            Plateforme de trading algorithmique professionnelle
          </p>
        </div>

        <Card className="border-muted/40 shadow-lg">
          <CardContent className="flex flex-col gap-4 p-6">
            <Button asChild size="lg" className="w-full text-base font-semibold">
              <Link href="/auth/sign-in">
                Se connecter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Ou
                </span>
              </div>
            </div>
            <Button asChild variant="outline" size="lg" className="w-full text-base">
              <Link href="/auth/sign-up">Créer un compte</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SimTrading. All rights reserved.
        </p>
      </div>
    </div>
  );
}
