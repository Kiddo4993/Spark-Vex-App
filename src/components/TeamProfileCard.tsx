"use client";

type Team = {
  id: string;
  teamNumber: string;
  provinceState?: string | null;
  country: string | null;
  drivetrainType: string | null;
  autonomousSide: string | null;
  autonReliabilityPct: number | null;
  notes: string | null;
  strategyTags: string[];
  performanceRating: number;
  ratingUncertainty: number;
  matchCount: number;
  autoStrength: number | null;
  driverStrength: number | null;
};

type Skills = {
  driverSkillsScore: number | null;
  autonomousSkillsScore: number | null;
  combinedSkillsScore: number | null;
  provincialSkillsRank: number | null;
  worldwideSkillsRank: number | null;
  lastUpdated: string | Date;
} | null;

export function TeamProfileCard({
  team,
  skills,
  confidence,
  isOwn,
}: {
  team: Team;
  skills: Skills;
  confidence: number;
  isOwn: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="card">
        <p className="text-sm font-medium text-gray-400">Performance Rating</p>
        <p className="mt-1 text-2xl font-bold text-white">{Math.round(team.performanceRating)}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-vex-dark">
          <div
            className="h-full rounded-full bg-vex-accent"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">{team.matchCount} matches · ±{team.ratingUncertainty.toFixed(0)}</p>
      </div>
      <div className="card">
        <p className="text-sm font-medium text-gray-400">Skills</p>
        <p className="mt-1 text-2xl font-bold text-white">{skills?.combinedSkillsScore ?? "—"}</p>
        <p className="mt-1 text-xs text-gray-500">
          Driver: {skills?.driverSkillsScore ?? "—"} · Auton: {skills?.autonomousSkillsScore ?? "—"}
        </p>
        {skills?.worldwideSkillsRank != null && (
          <p className="mt-1 text-xs text-gray-400">World #{skills.worldwideSkillsRank}</p>
        )}
      </div>
      <div className="card sm:col-span-2 lg:col-span-1">
        <p className="text-sm font-medium text-gray-400">Region</p>
        <p className="mt-1 text-white">
          {[team.provinceState, team.country].filter(Boolean).join(", ") || "—"}
        </p>
        <p className="mt-2 text-sm text-gray-400">Drivetrain: {team.drivetrainType ?? "—"}</p>
        <p className="text-sm text-gray-400">Auton side: {team.autonomousSide ?? "—"}</p>
        {team.autonReliabilityPct != null && (
          <p className="text-sm text-gray-400">Auton reliability: {team.autonReliabilityPct}%</p>
        )}
        {team.autoStrength != null && (
          <p className="text-sm text-gray-400">Auton Strength: {team.autoStrength}/10</p>
        )}
        {team.driverStrength != null && (
          <p className="text-sm text-gray-400">Driver Strength: {team.driverStrength}/10</p>
        )}
      </div>
      {(team.notes || team.strategyTags?.length) ? (
        <div className="card sm:col-span-2">
          <p className="text-sm font-medium text-gray-400">Notes & strategy</p>
          {team.strategyTags?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {team.strategyTags.map((tag) => (
                <span key={tag} className="rounded bg-vex-dark px-2 py-0.5 text-xs text-vex-accent">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          {team.notes ? <p className="mt-2 text-sm text-gray-300">{team.notes}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
