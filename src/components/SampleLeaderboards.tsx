"use client";

import { useState } from "react";
import Link from "next/link";

type Team = {
    id: string;
    teamNumber: string;
    performanceRating: number;
    ratingUncertainty: number;
    matchCount: number;
};

type SampleDataset = {
    label: string;
    teams: Team[];
};

export function SampleLeaderboards({ datasets }: { datasets: SampleDataset[] }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!datasets || datasets.length === 0) return null;

    const currentDataset = datasets[selectedIndex];
    const teams = currentDataset.teams;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-2 mb-2 gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="section-title text-gold m-0">Sample Rankings</h2>
                    <select
                        value={selectedIndex}
                        onChange={(e) => setSelectedIndex(Number(e.target.value))}
                        className="bg-surface-bg border border-line text-txt-1 text-xs font-mono py-1 px-2 uppercase tracking-widest focus:outline-none focus:border-spark transition-colors cursor-pointer"
                    >
                        {datasets.map((ds, i) => (
                            <option key={ds.label} value={i}>
                                • {ds.label}
                            </option>
                        ))}
                    </select>
                </div>

                <Link
                    href="/skills"
                    className="text-[11px] font-mono text-txt-3 hover:text-txt-1 transition-colors uppercase tracking-widest sm:self-center self-start"
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
                            <tr key={team.id || team.teamNumber}>
                                <td className="text-center font-mono text-txt-3">{i + 1}</td>
                                <td>
                                    <span className="team-num-chip bg-line-hi transition-colors block w-max cursor-default">
                                        {team.teamNumber}
                                    </span>
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
                    {teams.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-6 text-txt-3 font-mono text-xs uppercase tracking-widest">
                                No teams in this sample.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
