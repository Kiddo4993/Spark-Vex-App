"use client";

type Team = {
  performanceRating: number;
  ratingUncertainty: number;
  matchCount: number;
};

export function DashboardCards({
  team,
  autoStrength,
  driverStrength,
  confidence,
}: {
  team: Team;
  autoStrength: number | null;
  driverStrength: number | null;
  confidence: string;
}) {
  const winRate = team.matchCount > 0 ? "—" : "—";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Bayesian Rating */}
      <div className="stat-card c-cyan">
        <div className="stat-label">Bayesian Rating</div>
        <div className="stat-value text-cyan-400">{Math.round(team.performanceRating * 10) / 10}</div>
        <div className="stat-meta text-[10px]">
          ±{team.ratingUncertainty.toFixed(1)} uncertainty
        </div>
      </div>

      {/* Confidence */}
      <div className="stat-card c-amber">
        <div className="stat-label">Model Confidence</div>
        <div className="stat-value text-amber-500">{confidence}</div>
        <div className="stat-meta text-[10px]">
          Based on {team.matchCount} matches
        </div>
      </div>

      {/* Scouting */}
      <div className="stat-card c-green">
        <div className="stat-label">Scouting (Auto/Driv)</div>
        <div className="stat-value flex items-baseline gap-2">
          <span className="text-amber-500">{autoStrength ?? "—"}</span>
          <span className="text-txt-3 text-lg">/</span>
          <span className="text-green-500">{driverStrength ?? "—"}</span>
        </div>
        <div className="stat-meta text-[10px]">
          0–10 Human evaluation
        </div>
      </div>
    </div>
  );
}
