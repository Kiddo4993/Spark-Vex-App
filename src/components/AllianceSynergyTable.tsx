"use client";

import Link from "next/link";

type SynergyRow = {
    teamNumber: string;
    performanceRating: number;
    confidence: number;
    autoStrength: number | null;
    driverStrength: number | null;
    synergyScore: number;
    missingScouting: boolean;
    autoConflict: boolean;
};



export function AllianceSynergyTable({ rows }: { rows: SynergyRow[] }) {
    if (rows.length === 0) {
        return (
            <div className="card">
                <div className="card-body text-center py-8 text-txt-3 text-sm">
                    No teams available for analysis. Add match data to see potential partners.
                </div>
            </div>
        );
    }

    // Sort simply by performance rating since synergy is removed
    const sortedRows = [...rows].sort((a, b) => b.performanceRating - a.performanceRating);

    return (
        <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="data-table w-full border-separate border-spacing-0 whitespace-nowrap">
                    <thead>
                        <tr>
                            <th className="pl-5">Team</th>
                            <th>Rating</th>
                            <th>Conf</th>
                            <th>Auto</th>
                            <th>Driver</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRows.map((row) => {
                            return (
                                <tr key={row.teamNumber} className={`group relative transition-colors duration-[180ms] ease-out hover:bg-surface-hover`}>
                                    <td className="p-4 pl-5">
                                        <div className="flex flex-col">
                                            <div className="font-mono font-bold text-lg text-txt-1">{row.teamNumber}</div>
                                            {/* Warnings */}
                                            <div className="flex gap-2 mt-1">
                                                {row.confidence < 50 && (
                                                    <div className="flex items-center gap-1 text-danger">
                                                        <span className="text-[9px] tracking-widest uppercase font-mono border border-danger/30 bg-danger/10 px-1 py-0.5">Re-scout</span>
                                                    </div>
                                                )}
                                                {row.autoConflict && (
                                                    <div className="flex items-center gap-1 text-txt-1">
                                                        <span className="text-[9px] tracking-widest uppercase font-mono border border-txt-1/30 bg-txt-1/10 px-1 py-0.5">Auto Conflict</span>
                                                    </div>
                                                )}
                                                {row.missingScouting && (
                                                    <div className="flex items-center gap-1 text-txt-3">
                                                        <span className="text-[9px] tracking-widest uppercase font-mono border border-txt-3/30 bg-txt-3/10 px-1 py-0.5">Missing Data</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <div className="font-mono text-xl font-bold text-blue-500">
                                            {Math.round(row.performanceRating)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`font-mono text-sm ${row.confidence > 80 ? "text-blue-400" : row.confidence > 50 ? "text-txt-2" : "text-danger"}`}>
                                            {Math.round(row.confidence)}%
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-txt-1">{row.autoStrength ?? "—"}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-txt-1">{row.driverStrength ?? "—"}</span>
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
