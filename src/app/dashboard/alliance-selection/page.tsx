"use client";

import { useState, useEffect } from "react";
import { AllianceSynergyTable } from "@/components/AllianceSynergyTable";

export default function AllianceSelectionPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [minConfidence, setMinConfidence] = useState(0);

    useEffect(() => {
        fetch("/api/alliance-synergy")
            .then((res) => res.json())
            .then((json) => {
                if (Array.isArray(json)) setData(json);
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
                    {filtered.some((d) => d.confidence < 50) && (
                        <div className="alert alert-warn">
                            <span className="alert-icon">⚠️</span>
                            <div className="alert-body">
                                Some teams have low confidence ratings. Consider re-scouting before finalizing your alliance picks.
                            </div>
                        </div>
                    )}
                    <AllianceSynergyTable rows={filtered} />
                </>
            )}
        </div>
    );
}
