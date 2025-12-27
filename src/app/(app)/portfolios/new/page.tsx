import { PortfolioCreateForm } from "@/components/portfolios/portfolio-create-form";
import { getAvailableSymbols } from "@/server/data/symbols";

export default async function NewPortfolioPage() {
  const availableSymbols = await getAvailableSymbols();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Portfolio</h1>
        <p className="text-muted-foreground">Create a new collection of symbols.</p>
      </div>
      <PortfolioCreateForm initialSymbols={availableSymbols} />
    </div>
  );
}
