import { TeamsSearch } from "@/components/TeamsSearch";

export default async function TeamsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Teams</h1>
        <p className="page-subtitle">Browse all registered teams and their Bayesian ratings.</p>
      </div>
      <TeamsSearch />
    </div>
  );
}
