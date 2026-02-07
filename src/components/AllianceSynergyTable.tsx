"use client";

import Link from "next/link";

type SynergyResult = {
    team: {
        id: string;
        teamNumber: number;
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
        <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-vex-dark bg-vex-dark/40">
                            <th className="px-4 py-3 font-medium text-gray-300">Team</th>
                            <th className="px-4 py-3 font-medium text-gray-300">Rating</th>
                            <th className="px-4 py-3 font-medium text-gray-300">Confidence</th>
                            <th className="px-4 py-3 font-medium text-gray-300">Auto Side</th>
                            <th className="px-4 py-3 font-medium text-gray-300">Auto Str</th>
                            <th className="px-4 py-3 font-medium text-gray-300">Driver Str</th>
                            <th className="px-4 py-3 font-medium text-gray-300">Synergy</th>
                            <th className="px-4 py-3 font-medium text-gray-300">Match</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => {
                            const { team, synergyScore, confidence } = row;

                            let scoreColor = "text-vex-red";
                            if (synergyScore > 150) scoreColor = "text-green-400";
                            else if (synergyScore >= 100) scoreColor = "text-yellow-400";

                            return (
                                <tr key={team.id} className="border-b border-vex-dark/60 hover:bg-vex-dark/30">
                                    <td className="px-4 py-3 font-medium text-white">{team.teamNumber}</td>
                                    <td className="px-4 py-3 text-gray-200">{Math.round(team.performanceRating)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-vex-dark">
                                                <div
                                                    className={`h-full rounded-full ${confidence > 50 ? 'bg-vex-accent' : 'bg-red-500'}`}
                                                    style={{ width: `${confidence}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400">{confidence}%</span>
                                            {confidence < 50 && <span title="Low Confidence (Needs Scouting)">⚠️</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{team.autonomousSide || "—"}</td>
                                    <td className="px-4 py-3 text-gray-400">{team.autoStrength != null ? `${team.autoStrength}/10` : "—"}</td>
                                    <td className="px-4 py-3 text-gray-400">{team.driverStrength != null ? `${team.driverStrength}/10` : "—"}</td>
                                    <td className={`px-4 py-3 font-bold ${scoreColor}`}>{Math.round(synergyScore)}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/dashboard/teams/${team.teamNumber}`}
                                            className="text-vex-accent hover:underline"
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
