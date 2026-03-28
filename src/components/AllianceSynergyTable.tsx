"use client";

import Link from "next/link";

type SynergyRow = {
    teamNumber: string;
    performanceRating: number;
    confidence: number;
    autoStrength: number | null;
    driverStrength: number | null;
    autonomousSide: string | null;
    synergyScore: number;
    missingScouting: boolean;
    autoConflict: boolean;
};

function autonSideLabel(side: string | null) {
    const map: Record<string, string> = {
        left: "Left",
        right: "Right",
        skills: "Skills",
        both: "Both",
        none: "None",
    };
    return side ? map[side] || side : null;
}

export function AllianceSynergyTable({
    rows,
    myTeamAutonSide,
}: {
    rows: SynergyRow[];
    myTeamAutonSide?: string | null;
}) {
    if (rows.length === 0) {
        return (
            <div className="card">
                <div className="card-body text-center py-8 text-txt-3 text-sm">
                    No teams available for analysis. Add match data to see potential partners.
                </div>
            </div>
        );
    }

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
                            // Compute conflict/compatible status
                            const s1 = myTeamAutonSide?.toLowerCase();
                            const s2 = row.autonomousSide?.toLowerCase();
                            let compatLabel: "conflict" | "compatible" | null = null;
                            if (s1 && s2 && s1 !== "none" && s2 !== "none" && s1 !== "skills" && s2 !== "skills") {
                                compatLabel = (s1 === s2 && s1 !== "both") ? "conflict" : "compatible";
                            }

                            const sideLabel = autonSideLabel(row.autonomousSide);

                            return (
                                <tr key={row.teamNumber} className="group relative transition-colors duration-[180ms] ease-out hover:bg-surface-hover">
                                    <td className="p-4 pl-5">
                                        <Link href={`/dashboard/teams/${encodeURIComponent(row.teamNumber)}`} className="flex flex-col hover:underline decoration-txt-3">
                                            <div className="font-mono font-bold text-lg text-txt-1">{row.teamNumber}</div>
                                            {/* Auto side label */}
                                            {sideLabel && (
                                                <div className="text-[10px] font-mono text-txt-3 tracking-widest uppercase mt-0.5">
                                                    {sideLabel} Auto
                                                </div>
                                            )}
                                            {/* Badges */}
                                            <div className="flex gap-2 mt-1 flex-wrap">
                                                {row.confidence < 50 && (
                                                    <span className="text-[9px] tracking-widest uppercase font-mono border border-danger/30 bg-danger/10 px-1 py-0.5 text-danger">Re-scout</span>
                                                )}
                                                {/* Conflict / Compatible badge */}
                                                {compatLabel === "conflict" && (
                                                    <span className="text-[9px] tracking-widest uppercase font-mono border border-danger/40 bg-danger/10 px-1 py-0.5 text-danger">Auto Conflict</span>
                                                )}
                                                {compatLabel === "compatible" && (
                                                    <span className="text-[9px] tracking-widest uppercase font-mono border border-blue-500/30 bg-blue-500/10 px-1 py-0.5 text-blue-400">Compatible</span>
                                                )}
                                                {row.missingScouting && (
                                                    <span className="text-[9px] tracking-widest uppercase font-mono border border-txt-3/30 bg-txt-3/10 px-1 py-0.5 text-txt-3">Missing Data</span>
                                                )}
                                            </div>
                                        </Link>
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
