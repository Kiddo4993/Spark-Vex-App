// TopTeams.tsx
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
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-vex-border pb-4">
                <h2 className="text-2xl font-bold text-white tracking-wide uppercase">Top Teams</h2>
                <Link href="/auth/signin" className="text-xs font-bold text-vex-accent hover:text-white transition-colors uppercase tracking-[0.2em]">
                    View all →
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {teams.map((team) => {
                    // Calculate confidence (capped at 100%)
                    const confidence = Math.min(
                        100,
                        Math.round(Math.max(0, 1 - team.ratingUncertainty / 50) * 100)
                    );

                    return (
                        <Link
                            key={team.id}
                            href={`/auth/signin`}
                            className="card group hover:border-vex-accent/50 transition-all duration-300 transform hover:-translate-y-1 block h-full bg-vex-surface/40 hover:bg-vex-surface/80"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-3xl font-bold text-white group-hover:text-vex-accent transition-colors">
                                    {team.teamNumber}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-vex-blue/20 text-vex-blue uppercase tracking-wider">
                                    Rank #{teams.indexOf(team) + 1}
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Bayesian Rating</p>
                                    <p className="text-4xl font-bold text-white tabular-nums leading-none tracking-tight">{Math.round(team.performanceRating)}</p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Confidence</p>
                                        <span className="text-xs font-bold text-gray-300">{confidence}%</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-vex-darker overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${confidence > 80 ? 'bg-green-500' : confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${confidence}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-vex-border/50">
                                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                                        {team.matchCount} Matches
                                    </span>
                                    <span className="text-xs font-mono text-gray-500">
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
