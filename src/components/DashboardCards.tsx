"use client";

import { Team, PerformanceHistory, SkillsRecord } from "@prisma/client";

interface Props {
  team: Team & {
    performanceHistory: PerformanceHistory[];
    skillsRecords: SkillsRecord[];
  };
  skills: SkillsRecord | null;
  confidence: string; // "High" | "Medium" | "Low"
}

export function DashboardCards({ team, skills, confidence }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Performance Rating */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400">Bayesian Rating</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {team.performanceRating.toFixed(1)}
          </span>
          <span className="text-sm text-vex-accent">ELO</span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          ±{team.ratingUncertainty.toFixed(1)} uncertainty
        </div>
      </div>

      {/* Confidence Level */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400">Confidence</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={`text-3xl font-bold ${confidence === "High"
              ? "text-green-400"
              : confidence === "Medium"
                ? "text-yellow-400"
                : "text-red-400"
              }`}
          >
            {confidence}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500">Based on match variance</div>
      </div>

      {/* Driver Skills */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400">Driver Skills</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {skills?.driverSkillsScore ?? "-"}
          </span>
          <span className="text-sm text-gray-500">pts</span>
        </div>
      </div>

      {/* Programming Skills */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400">Auto Skills</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {skills?.autonomousSkillsScore ?? "-"}
          </span>
          <span className="text-sm text-gray-500">pts</span>
        </div>
      </div>
    </div>
  );
}
