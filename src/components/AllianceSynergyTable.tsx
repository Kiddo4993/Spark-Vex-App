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
                        <th>Team</th>
                        <th>Rating</th>
                        <th>Confidence</th>
                        <th>Auto</th>
                        <th>Driver</th>
                        <th>Synergy</th>
                        <th>Grade</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const { label, cls } = gradeFor(row.synergyScore);
                        // Scale bar relative to 200 (approx max possible) or maxSynergy if higher
                        const barPct = Math.min(100, (row.synergyScore / 200) * 100);

                        return (
                            <tr key={row.teamNumber}>
                                <td className="p-3">
                                    <div className="flex flex-col">
                                        <span className="font-mono font-bold text-txt-1">{row.teamNumber}</span>
                                        {/* Re-scout Warning */}
                                        {row.confidence < 50 && (
                                            <div className="flex items-center gap-1 mt-0.5 text-danger" title="Re-scout recommended (Low Confidence)">
                                                <span className="text-[10px]">⚠️ Re-scout</span>
                                            </div>
                                        )}
                                        {/* Auto Conflict Warning */}
                                        {row.autoConflict && (
                                            <div className="flex items-center gap-1 mt-0.5 text-amber" title="Autonomous Side Conflict">
                                                <span className="text-[10px]">⚔️ Auto Conflict</span>
                                            </div>
                                        )}
                                        {/* Missing Scouting Warning */}
                                        {row.missingScouting && (
                                            <div className="flex items-center gap-1 mt-0.5 text-txt-3" title="Incomplete Scouting Data">
                                                <span className="text-[10px]">⚠️ Missing Data</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <span className="font-mono text-spark">{Math.round(row.performanceRating)}</span>
                                </td>
                                <td className="p-3">
                                    {/* Confidence Column */}
                                    <div className={`font-mono text-xs font-bold ${row.confidence > 80 ? "text-success" :
                                        row.confidence > 50 ? "text-amber" :
                                            "text-danger"
                                        }`}>
                                        {Math.round(row.confidence)}%
                                    </div>
                                </td>
                                <td className="p-3">
                                    <span className="font-mono text-amber">{row.autoStrength ?? "—"}</span>
                                </td>
                                <td className="p-3">
                                    <span className="font-mono text-success">{row.driverStrength ?? "—"}</span>
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <div className="text-right">
                                            <div className={`font-head text-lg font-extrabold leading-none ${row.synergyScore > 150 ? "text-success" :
                                                row.synergyScore > 100 ? "text-amber" :
                                                    "text-danger"
                                                }`}>
                                                {row.synergyScore.toFixed(0)}
                                            </div>
                                        </div>
                                        <div className="w-16 h-1 rounded-full bg-surface-base overflow-hidden">
                                            <div
                                                className={`h-full ${barColor(row.synergyScore)}`}
                                                style={{ width: `${barPct}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <span className={`synergy-pill ${cls}`}>{label}</span>
                                </td>
                                <td className="p-3">
                                    <Link
                                        href={`/dashboard/teams/${row.teamNumber}`}
                                        className="text-[11px] font-mono text-spark hover:text-txt-1 transition-colors"
                                    >
                                        View →
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
