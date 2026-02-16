"use client";

import Link from "next/link";

type SynergyRow = {
    teamNumber: string;
    performanceRating: number;
    confidence: number;
    autoStrength: number | null;
    driverStrength: number | null;
    synergyScore: number;
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
                        const barPct = Math.max(5, (row.synergyScore / maxSynergy) * 100);

                        return (
                            <tr key={row.teamNumber}>
                                <td>
                                    <span className="font-mono font-bold text-txt-1">{row.teamNumber}</span>
                                </td>
                                <td>
                                    <span className="font-mono text-spark">{Math.round(row.performanceRating)}</span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 min-w-[80px]">
                                        <div className="mini-bar w-12">
                                            <div
                                                className={`mini-bar-fill ${row.confidence > 80 ? "bar-green" : row.confidence > 50 ? "bar-amber" : "bar-red"}`}
                                                style={{ width: `${row.confidence}%` }}
                                            />
                                        </div>
                                        <span className="font-mono text-[11px] text-txt-2">{row.confidence}%</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="font-mono text-amber">{row.autoStrength ?? "—"}</span>
                                </td>
                                <td>
                                    <span className="font-mono text-success">{row.driverStrength ?? "—"}</span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 min-w-[100px]">
                                        <div className="mini-bar w-16">
                                            <div
                                                className={`mini-bar-fill ${barColor(row.synergyScore)}`}
                                                style={{ width: `${barPct}%` }}
                                            />
                                        </div>
                                        <span className="font-mono text-[11px] text-txt-1">{Math.round(row.synergyScore)}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`synergy-pill ${cls}`}>{label}</span>
                                </td>
                                <td>
                                    <Link
                                        href={`/dashboard/teams?teamNumber=${row.teamNumber}`}
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
