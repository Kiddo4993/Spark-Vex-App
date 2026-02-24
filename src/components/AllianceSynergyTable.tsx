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

function gradeFor(score: number) {
    if (score >= 150) return { label: "Excellent", cls: "pill-excellent" };
    if (score >= 100) return { label: "Good", cls: "pill-good" };
    return { label: "Weak", cls: "pill-weak" };
}

function barColor(score: number) {
    if (score >= 150) return "bar-green";
    if (score >= 100) return "bar-amber";
    return "bar-red";
}

export function AllianceSynergyTable({ rows }: { rows: SynergyRow[] }) {
    if (rows.length === 0) {
        return (
            <div className="card">
                <div className="card-body text-center py-8 text-txt-3 text-sm">
                    No teams available for synergy analysis. More teams need to sign up and record matches.
                </div>
            </div>
        );
    }

    const maxSynergy = Math.max(...rows.map((r) => r.synergyScore), 1);

    return (
        <div className="card overflow-hidden p-0">
            <table className="data-table">
                <thead>
                    <tr>
                        <th className="pl-5">Team</th>
                        <th className="text-right">Synergy</th>
                        <th>Rating</th>
                        <th>Conf</th>
                        <th>Auto</th>
                        <th>Driver</th>
                        <th className="text-right"></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const { label, cls } = gradeFor(row.synergyScore);
                        // Scale bar relative to 200 (approx max possible) or maxSynergy if higher
                        const barPct = Math.min(100, (row.synergyScore / 200) * 100);

                        let gradeBorder = "border-danger";
                        if (row.synergyScore >= 150) gradeBorder = "border-success";
                        else if (row.synergyScore >= 100) gradeBorder = "border-amber";

                        return (
                            <tr key={row.teamNumber} className={`group relative transition-all duration-[180ms] ease-out hover:bg-surface-hover ${gradeBorder} border-l-[3px]`}>
                                <td className="p-4 pl-5">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-lg text-txt-1">{row.teamNumber}</span>
                                            <span className={`synergy-pill ${cls} px-1.5 py-0 text-[9px] uppercase tracking-widest bg-transparent border border-current`}>{label}</span>
                                        </div>
                                        {/* Warnings */}
                                        <div className="flex gap-2 mt-1">
                                            {row.confidence < 50 && (
                                                <div className="flex items-center gap-1 text-danger">
                                                    <span className="text-[9px] tracking-widest uppercase font-mono">⚠️ Re-scout</span>
                                                </div>
                                            )}
                                            {row.autoConflict && (
                                                <div className="flex items-center gap-1 text-amber">
                                                    <span className="text-[9px] tracking-widest uppercase font-mono">⚔️ Auto Conflict</span>
                                                </div>
                                            )}
                                            {row.missingScouting && (
                                                <div className="flex items-center gap-1 text-txt-3">
                                                    <span className="text-[9px] tracking-widest uppercase font-mono">⚠️ Missing Data</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4 text-left">
                                    <div className="flex flex-col items-end justify-center">
                                        <div className={`font-mono text-xl font-bold leading-none ${row.synergyScore >= 150 ? "text-success" : row.synergyScore >= 100 ? "text-amber" : "text-danger"}`}>
                                            {row.synergyScore.toFixed(0)}
                                        </div>
                                        <div className="w-12 h-1 mt-1.5 bg-line rounded-none overflow-hidden">
                                            <div
                                                className={`h-full ${barColor(row.synergyScore)}`}
                                                style={{ width: `${barPct}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
{/* 
                                <td className="p-4">
                                    <span className="font-mono text-txt-2">{Math.round(row.performanceRating)}</span>
                                </td> */}
                                <td className="p-4">
                                    <div className={`font-mono text-xs ${row.confidence > 80 ? "text-success" : row.confidence > 50 ? "text-amber" : "text-danger"}`}>
                                        {Math.round(row.confidence)}%
                                    </div>
                                </td>
                                {/* <td className="p-4">
                                    <span className="font-mono text-amber-500">{row.autoStrength ?? "—"}</span>
                                </td>
                                <td className="p-4">
                                    <span className="font-mono text-green-500">{row.driverStrength ?? "—"}</span>
                                </td> */}

                                <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms]">
                                    <Link
                                        href={`/dashboard/teams/${row.teamNumber}`}
                                        className="btn-ghost py-1 px-3 text-[10px]"
                                    >
                                        PROFILE ↗
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
