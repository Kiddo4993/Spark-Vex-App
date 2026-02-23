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
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2 mb-2">
                <h2 className="section-title text-gold">Live Leaderboard</h2>
                <Link
                    href="/dashboard/teams"
                    className="text-[11px] font-mono text-txt-3 hover:text-txt-1 transition-colors uppercase tracking-widest"
                >
                    View all ↗
                </Link>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th className="w-12 text-center">Rank</th>
                        <th>Team</th>
                        <th className="text-right">Rating</th>
                        <th className="w-32 hidden sm:table-cell">Confidence</th>
                        <th className="text-right hidden sm:table-cell">Matches</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.map((team, i) => {
                        const confidence = Math.min(
                            100,
                            Math.round(Math.max(0, 1 - team.ratingUncertainty / 50) * 100)
                        );
                        let barColor = "bar-red";
                        if (confidence > 80) barColor = "bar-green";
                        else if (confidence > 50) barColor = "bar-amber";

                        return (
                            <tr key={team.id}>
                                <td className="text-center font-mono text-txt-3">{i + 1}</td>
                                <td>
                                    <Link href={`/dashboard/teams/${team.teamNumber}`} className="team-num-chip hover:bg-line-hi transition-colors block w-max">
                                        {team.teamNumber}
                                    </Link>
                                </td>
                                <td className="text-right font-mono font-bold text-[15px] text-txt-1">
                                    {Math.round(team.performanceRating * 10) / 10}
                                </td>
                                <td className="hidden sm:table-cell">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 mini-bar">
                                            <div className={`mini-bar-fill ${barColor}`} style={{ width: `${confidence}%` }} />
                                        </div>
                                    </div>
                                </td>
                                <td className="text-right font-mono text-xs text-txt-3 hidden sm:table-cell">
                                    {team.matchCount}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
