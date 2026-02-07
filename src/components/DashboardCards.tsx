"use client";

type Team = {
  teamNumber: number;
  performanceRating: number;
  ratingUncertainty: number;
  matchCount: number;
  provinceState: string | null;
  country: string | null;
};

type Skills = {
  driverSkillsScore: number | null;
  autonomousSkillsScore: number | null;
  combinedSkillsScore: number | null;
  provincialSkillsRank: number | null;
  worldwideSkillsRank: number | null;
  lastUpdated: string | Date;
} | null;

export function DashboardCards({
  team,
  skills,
  confidence,
}: {
  team: Team;
  skills: Skills;
  confidence: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="card">
        <p className="text-sm font-medium text-gray-400">Performance Rating</p>
        <p className="mt-1 text-3xl font-bold text-white">{Math.round(team.performanceRating)}</p>
        <p className="mt-1 text-xs text-gray-500">{team.matchCount} matches</p>
      </div>
      <div className="card">
        <p className="text-sm font-medium text-gray-400">Confidence</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-vex-dark">
            <div
              className="h-full rounded-full bg-vex-accent transition-all"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-lg font-bold text-white">{confidence}%</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">Uncertainty: ±{team.ratingUncertainty.toFixed(0)}</p>
      </div>
      <div className="card">
        <p className="text-sm font-medium text-gray-400">Skills</p>
        <p className="mt-1 text-2xl font-bold text-white">
          {skills?.combinedSkillsScore ?? "—"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Driver: {skills?.driverSkillsScore ?? "—"} · Auton: {skills?.autonomousSkillsScore ?? "—"}
        </p>
      </div>
      <div className="card">
        <p className="text-sm font-medium text-gray-400">Skills Rank</p>
        <p className="mt-1 text-2xl font-bold text-white">
          {skills?.worldwideSkillsRank != null ? `#${skills.worldwideSkillsRank}` : "—"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {team.provinceState && skills?.provincialSkillsRank != null
            ? `Provincial #${skills.provincialSkillsRank}`
            : team.provinceState ?? "—"}
        </p>
      </div>
    </div>
  );
}
