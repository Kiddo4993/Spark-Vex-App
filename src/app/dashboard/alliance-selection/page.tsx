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
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Alliance Selection</h1>
                    <p className="text-gray-400">Find your ideal alliance partner based on synergy.</p>
                </div>
                <div className="flex items-center gap-3 bg-vex-darker/50 p-3 rounded-lg border border-gray-700">
                    <span className="text-sm text-gray-300">Min Confidence: {minConfidence}%</span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={minConfidence}
                        onChange={(e) => setMinConfidence(Number(e.target.value))}
                        className="accent-vex-accent"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading synergy data...</div>
            ) : (
                <AllianceSynergyTable data={filtered} />
            )}
        </div>
    );
}
