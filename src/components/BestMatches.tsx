"use client";

import Link from "next/link";

type Match = {
    id: string;
    eventName: string;
    date: string;
    redScore: number;
    blueScore: number;
    redTeam1: { teamNumber: string };
    redTeam2: { teamNumber: string };
    redTeam3: { teamNumber: string };
    blueTeam1: { teamNumber: string };
    blueTeam2: { teamNumber: string };
    blueTeam3: { teamNumber: string };
};

export function BestMatches({ matches }: { matches: Match[] }) {
    if (matches.length === 0) return null;

    return (
        <div className="card border-l-[3px] border-l-amber">
            <div className="card-header flex items-center justify-between">
                <div className="section-title flex items-center gap-2">
                    <span>🔥</span> Best Matches
                </div>
            </div>
            <div className="px-5 py-2">
                {matches.map((m) => {
                    const redAlliance = [m.redTeam1.teamNumber, m.redTeam2.teamNumber]
                        .filter(Boolean)
                        .join(" · ");
                    const blueAlliance = [m.blueTeam1.teamNumber, m.blueTeam2.teamNumber]
                        .filter(Boolean)
                        .join(" · ");

                    return (
                        <div
                            key={m.id}
                            className="flex items-center gap-3.5 py-3 border-b border-line last:border-b-0"
                        >
                            <div className="flex-1 text-xs text-txt-2 truncate pr-2">
                                <div className="font-medium text-danger mb-0.5 truncate text-[11px] uppercase tracking-wider">
                                    {redAlliance}
                                </div>
                                <div className="font-medium text-spark truncate text-[11px] uppercase tracking-wider">
                                    {blueAlliance}
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end justify-center min-w-[50px]">
                                <div className="font-mono text-[14px] font-bold text-txt-1 tabular-nums">
                                    <span className="text-danger">{m.redScore}</span>
                                    <span className="text-txt-3 mx-1">–</span>
                                    <span className="text-spark">{m.blueScore}</span>
                                </div>
                                <div className="text-[9px] font-mono text-amber uppercase tracking-widest mt-0.5 bg-amber/10 px-1.5 py-0.5 rounded-sm">
                                    {m.redScore + m.blueScore} PTS
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
