import { PortfolioCreateForm } from "@/components/portfolios/portfolio-create-form";

export default function NewPortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Portfolio</h1>
        <p className="text-muted-foreground">Create a new collection of symbols.</p>
      </div>
      <PortfolioCreateForm />
    </div>
  );
}
