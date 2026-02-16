"use client";

import Link from "next/link";

type SynergyResult = {
    team: {
        id: string;
        teamNumber: string;
        autonomousSide: string | null;
        autoStrength: number | null;
        driverStrength: number | null;
        performanceRating: number;
    };
    synergyScore: number;
    autoCompatibility: number;
    strengthScore: number;
    confidence: number;
};

export function AllianceSynergyTable({ data }: { data: SynergyResult[] }) {
    if (data.length === 0) {
        return <div className="p-8 text-center text-gray-400">No data available. Import matches to calculate synergy.</div>;
    }

    return (
        <div className="card overflow-hidden p-0 border border-vex-border bg-vex-surface/20 backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-vex-border bg-vex-darker/50">
                            <th className="px-4 py-3 font-bold text-white uppercase tracking-wider text-xs">Team</th>
                            <th className="px-4 py-3 font-bold text-white uppercase tracking-wider text-xs">Rating</th>
                            <th className="px-4 py-3 font-bold text-white uppercase tracking-wider text-xs">Confidence</th>
                            <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider text-xs hidden sm:table-cell">Auto Side</th>
                            <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider text-xs hidden md:table-cell">Auto Str</th>
                            <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider text-xs hidden md:table-cell">Driver Str</th>
                            <th className="px-4 py-3 font-bold text-vex-accent uppercase tracking-wider text-xs">Synergy</th>
                            <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-wider text-xs">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-vex-border/30">
                        {data.map((row) => {
                            const { team, synergyScore, confidence } = row;

                            let scoreColor = "text-vex-red";
                            if (synergyScore > 110) scoreColor = "text-green-400 shadow-green-400/20 drop-shadow-sm";
                            else if (synergyScore >= 100) scoreColor = "text-yellow-400";

                            return (
                                <tr key={team.id} className="hover:bg-vex-surface/30 transition-colors">
                                    <td className="px-4 py-3 font-bold text-white">{team.teamNumber}</td>
                                    <td className="px-4 py-3 text-gray-300 font-mono">{Math.round(team.performanceRating)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-vex-darker border border-vex-border/50">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${confidence > 80 ? 'bg-green-500' : confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${confidence}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 font-mono">{confidence}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell text-xs">{team.autonomousSide || "—"}</td>
                                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">{team.autoStrength != null ? `${team.autoStrength}/10` : "—"}</td>
                                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">{team.driverStrength != null ? `${team.driverStrength}/10` : "—"}</td>
                                    <td className={`px-4 py-3 font-bold text-lg ${scoreColor}`}>{Math.round(synergyScore)}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/dashboard/teams?teamNumber=${team.teamNumber}`}
                                            className="text-xs font-bold text-vex-accent hover:text-white transition-colors border border-vex-accent/30 hover:bg-vex-accent/20 px-3 py-1 rounded"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
