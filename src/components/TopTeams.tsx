"use client";

import Link from "next/link";

type Team = {
    id: string;
    teamNumber: string;
    performanceRating: number;
    ratingUncertainty: number;
    matchCount: number;
};

export function TopTeams({ teams }: { teams: Team[] }) {
    if (teams.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-3">
                <h2 className="section-title">Top Teams</h2>
                <Link
                    href="/auth/signin"
                    className="text-xs font-mono text-spark hover:text-txt-1 transition-colors tracking-wider"
                >
                    View all →
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {teams.map((team, i) => {
                    const confidence = Math.min(
                        100,
                        Math.round(Math.max(0, 1 - team.ratingUncertainty / 50) * 100)
                    );

                    return (
                        <Link
                            key={team.id}
                            href="/auth/signin"
                            className="team-card group block"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="font-mono text-xl font-bold text-txt-1 group-hover:text-spark transition-colors tracking-tight">
                                    {team.teamNumber}
                                </div>
                                <span className="text-[10px] font-mono bg-spark/15 text-spark px-2 py-0.5 rounded-md">
                                    #{i + 1}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="stat-label">Bayesian Rating</p>
                                    <p className="font-head text-3xl font-extrabold text-txt-1 tracking-tight leading-none">
                                        {Math.round(team.performanceRating)}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <p className="stat-label !mb-0">Confidence</p>
                                        <span className="text-xs font-mono text-txt-2">{confidence}%</span>
                                    </div>
                                    <div className="rating-bar-bg !h-1.5">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${confidence > 80
                                                    ? "bg-success"
                                                    : confidence > 50
                                                        ? "bg-amber"
                                                        : "bg-danger"
                                                }`}
                                            style={{ width: `${confidence}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-line">
                                    <span className="text-[10px] font-mono text-txt-3 tracking-wider">
                                        {team.matchCount} MATCHES
                                    </span>
                                    <span className="text-xs font-mono text-txt-3">
                                        ±{team.ratingUncertainty.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
