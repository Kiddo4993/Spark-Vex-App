"use client";

import { useState, useEffect } from "react";
import { AllianceSynergyTable } from "@/components/AllianceSynergyTable";

type MyTeamInfo = {
    teamNumber: string;
    autonomousSide: string | null;
    drivetrainType: string | null;
    autoStrength: number | null;
    driverStrength: number | null;
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

export default function AllianceSelectionPage() {
    const [data, setData] = useState<any[]>([]);
    const [myTeam, setMyTeam] = useState<MyTeamInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [minConfidence, setMinConfidence] = useState(0);

    useEffect(() => {
        fetch("/api/alliance-synergy")
            .then((res) => res.json())
            .then((json) => {
                if (json?.results && Array.isArray(json.results)) {
                    setData(json.results);
                    setMyTeam(json.myTeam ?? null);
                } else if (Array.isArray(json)) {
                    // fallback for old shape
                    setData(json);
                }
                setLoading(false);
            })
            .catch((e) => {
                console.error(e);
                setLoading(false);
            });
    }, []);

    const filtered = data.filter((d) => d.confidence >= minConfidence);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="page-title">Alliance Selection</h1>
                    <p className="page-subtitle">Find your ideal alliance partner based on synergy analysis.</p>

                    {/* My team's auto info strip */}
                    {myTeam && (
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            <span className="text-[10px] font-mono text-txt-3 tracking-widest uppercase">
                                {myTeam.teamNumber} (You) —
                            </span>
                            {myTeam.autonomousSide ? (
                                <span className="text-[10px] font-mono bg-surface-card border border-line px-2 py-0.5 text-txt-2 tracking-widest uppercase">
                                    Auto: {autonSideLabel(myTeam.autonomousSide)}
                                </span>
                            ) : null}
                            {myTeam.autoStrength !== null ? (
                                <span className="text-[10px] font-mono bg-surface-card border border-line px-2 py-0.5 text-amber-400 tracking-widest uppercase">
                                    Auto Str: {myTeam.autoStrength}
                                </span>
                            ) : null}
                            {myTeam.driverStrength !== null ? (
                                <span className="text-[10px] font-mono bg-surface-card border border-line px-2 py-0.5 text-green-400 tracking-widest uppercase">
                                    Driver: {myTeam.driverStrength}
                                </span>
                            ) : null}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3 bg-surface-card border border-line rounded-[10px] p-3">
                    <span className="text-[11px] font-mono text-txt-2 tracking-wider">MIN CONFIDENCE</span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={minConfidence}
                        onChange={(e) => setMinConfidence(Number(e.target.value))}
                        className="accent-spark w-24"
                    />
                    <span className="font-mono text-sm text-spark font-bold">{minConfidence}%</span>
                </div>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2" role="group">
                {[0, 25, 50, 75].map((v) => (
                    <button
                        key={v}
                        onClick={() => setMinConfidence(v)}
                        className={`filter-chip ${minConfidence === v ? "on" : ""}`}
                    >
                        {v === 0 ? "All" : `≥${v}%`}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12 text-txt-3 text-sm">Loading synergy data…</div>
            ) : (
                <>
                    {filtered.some((d) => d.missingScouting) && (
                        <div className="alert alert-warn mb-4">
                            <span className="alert-icon">[!]</span>
                            <div className="alert-body">
                                Some teams have missing scouting data. Update their driver and autonomous strengths for accurate synergy scores.
                            </div>
                        </div>
                    )}
                    {filtered.some((d) => d.autoConflict) && (
                        <div className="alert alert-danger mb-4">
                            <span className="alert-icon">[!]</span>
                            <div className="alert-body">
                                Some potential partners have matching autonomous routines. This may cause conflicts during the match.
                            </div>
                        </div>
                    )}
                    {filtered.some((d) => d.confidence < 50) && (
                        <div className="alert alert-warn mb-4">
                            <span className="alert-icon">[!]</span>
                            <div className="alert-body">
                                Some teams have low confidence ratings. Consider re-scouting before finalizing your alliance picks.
                            </div>
                        </div>
                    )}
                    <AllianceSynergyTable
                        myTeamAutonSide={myTeam?.autonomousSide ?? null}
                        rows={filtered.map((r) => ({
                            teamNumber: r.team.teamNumber,
                            performanceRating: r.team.performanceRating,
                            confidence: r.confidence,
                            autoStrength: r.team.autoStrength,
                            driverStrength: r.team.driverStrength,
                            autonomousSide: r.team.autonomousSide ?? null,
                            synergyScore: r.synergyScore,
                            missingScouting: r.missingScouting,
                            autoConflict: r.autoConflict,
                        }))}
                    />
                </>
            )}
        </div>
    );
}

