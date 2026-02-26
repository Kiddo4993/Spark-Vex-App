"use client";

import { useState, useEffect } from "react";
import { ImportFileUpload } from "@/components/ImportFileUpload";
import { ColumnMappingTable, ColumnMapping } from "@/components/ColumnMappingTable";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ImportPage() {
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();

    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [sessionStatus, router]);

    // --- File upload state ---
    const [step, setStep] = useState<"upload" | "map" | "processing" | "review" | "done">("upload");
    const [importType, setImportType] = useState<"match">("match");
    const [fileData, setFileData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [preview, setPreview] = useState<any[][]>([]);
    const [mapping, setMapping] = useState<ColumnMapping>({});
    const [status, setStatus] = useState("");
    const [reviewStats, setReviewStats] = useState<any>(null);
    const [wipeData, setWipeData] = useState(true);
    const [updatedTeams, setUpdatedTeams] = useState<any[]>([]);

    // --- File upload handlers ---
    const handleFileSelect = async (file: File) => {
        setStatus("Parsing file...");
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/import/parse", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setHeaders(data.headers);
            setPreview(data.preview);
            setFileData(data.fullData);

            const newMapping: ColumnMapping = {};
            const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

            data.headers.forEach((header: string, index: number) => {
                const h = normalize(header);
                const idxStr = index.toString();

                if (importType === "match") {
                    if (h.includes("date") || h.includes("time") || h.includes("start")) newMapping.date = idxStr;
                    else if (h.includes("match") || h.includes("round")) newMapping.eventName = idxStr;
                    else if (h === "red1" || h === "redteam1") newMapping.redTeam1 = idxStr;
                    else if (h === "red2" || h === "redteam2") newMapping.redTeam2 = idxStr;
                    else if (h === "red3" || h === "redteam3") newMapping.redTeam3 = idxStr;
                    else if (h === "blue1" || h === "blueteam1") newMapping.blueTeam1 = idxStr;
                    else if (h === "blue2" || h === "blueteam2") newMapping.blueTeam2 = idxStr;
                    else if (h === "blue3" || h === "blueteam3") newMapping.blueTeam3 = idxStr;
                    else if (h === "redscore" || h === "redtotal") newMapping.redScore = idxStr;
                    else if (h === "bluescore" || h === "bluetotal") newMapping.blueScore = idxStr;
                } else {
                    if (h.includes("rank")) newMapping.rank = idxStr;
                    else if (h.includes("team")) newMapping.team = idxStr;
                    else if (h.includes("driver")) newMapping.driverScore = idxStr;
                    else if (h.includes("prog") || h.includes("auto")) newMapping.programmingScore = idxStr;
                    else if (h.includes("high") || h.includes("combined") || h.includes("score")) newMapping.highestScore = idxStr;
                }
            });

            setMapping(newMapping);
            setStep("map");
            setStatus("");
        } catch (e: any) {
            alert("Error: " + e.message);
            setStatus("");
        }
    };

    const handleImport = async () => {
        setStep("processing");
        setStatus("Importing and recalculating ratings…");
        try {
            const res = await fetch("/api/import/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileData, mapping, importType, wipeData }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            if (data.updatedTeams) {
                setUpdatedTeams(data.updatedTeams);
            }

            setStatus(`Success! Imported ${data.count} ${importType === "match" ? "matches" : "entries"}.`);
            setStep("done");
        } catch (e: any) {
            setStatus("Error: " + e.message);
            setStep("map");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between border-b pb-4 border-line">
                <div>
                    <h1 className="font-head text-4xl font-extrabold text-txt-1 tracking-tight uppercase">Data Import</h1>
                    <p className="text-xs font-mono tracking-widest uppercase text-txt-3 mt-1">Upload Match Data from .XLS Files</p>
                </div>
            </div>

            {step === "upload" && (
                <div className="space-y-5">
                    <ImportFileUpload onFileSelect={handleFileSelect} />
                    {status && <p className="text-sm text-txt-3 animate-pulse">{status}</p>}
                </div>
            )}

            {step === "map" && (
                <div className="space-y-5">
                    <div className="card p-5 border-l-[3px] border-l-spark">
                        <h3 className="section-title mb-1">Map Columns — {importType === "match" ? "Matches" : "Skills"}</h3>
                        <p className="text-xs text-txt-3 mb-5">Select which column corresponds to each field.</p>
                        <ColumnMappingTable columns={headers} preview={preview} mapping={mapping} onMappingChange={setMapping} mode={importType} />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setStep("upload")} className="btn-ghost">Cancel</button>
                        <button
                            onClick={async () => {
                                setStep("processing");
                                setStatus("Verifying data…");
                                try {
                                    const res = await fetch("/api/import/process", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ fileData, mapping, dryRun: true, importType }),
                                    });
                                    const data = await res.json();
                                    if (data.error) throw new Error(data.error);
                                    setReviewStats(data);
                                    setStep("review");
                                    setStatus("");
                                } catch (e: any) {
                                    setStatus("Error: " + e.message);
                                    setStep("map");
                                }
                            }}
                            className="btn-primary"
                            disabled={!mapping.date || !mapping.redScore || !mapping.blueScore}
                        >
                            Review Import
                        </button>
                    </div>
                </div>
            )}

            {step === "review" && reviewStats && (
                <div className="space-y-5">
                    <div className="card overflow-hidden">
                        <div className="card-header bg-surface-bg border-b border-line py-2 text-center">
                            <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">Ready to Import</span>
                        </div>
                        <div className="p-5 bg-surface-card">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-line mb-6 divide-y md:divide-y-0 md:divide-x divide-line bg-surface-bg">
                                <div className="p-4 flex flex-col items-center justify-center">
                                    <div className="text-[10px] font-mono tracking-widest uppercase text-txt-3 mb-1">{importType === "match" ? "Matches" : "Entries"} Found</div>
                                    <div className="font-mono text-2xl font-bold text-cyan-400">{reviewStats.matchCount || reviewStats.count}</div>
                                </div>
                                <div className="p-4 flex flex-col items-center justify-center">
                                    <div className="text-[10px] font-mono tracking-widest uppercase text-txt-3 mb-1">Unique Teams</div>
                                    <div className="font-mono text-2xl font-bold text-amber-500">{reviewStats.teamCount}</div>
                                </div>
                                <div className="p-4 flex flex-col items-center justify-center">
                                    <div className="text-[10px] font-mono tracking-widest uppercase text-txt-3 mb-1">Date Range</div>
                                    <div className="font-mono text-sm text-txt-1 mt-1 text-center">
                                        {reviewStats.dateRange ? `${new Date(reviewStats.dateRange.start).toLocaleDateString()} – ${new Date(reviewStats.dateRange.end).toLocaleDateString()}` : "N/A"}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-[11px] font-mono tracking-widest uppercase text-txt-1 mb-2">Sample Parsed Data</h4>
                                <pre className="text-[10px] text-txt-3 font-mono bg-surface-bg p-4 border border-line overflow-x-auto selection:bg-spark/20">
                                    {JSON.stringify(reviewStats.sample, null, 2)}
                                </pre>
                            </div>

                            <div className="mb-8 flex items-center justify-center gap-3 bg-danger/5 border border-danger/20 p-4">
                                <input
                                    type="checkbox"
                                    id="wipeData"
                                    checked={wipeData}
                                    onChange={(e) => setWipeData(e.target.checked)}
                                    className="w-4 h-4 rounded-none border-danger/50 bg-surface-bg text-danger focus:ring-danger focus:ring-1 appearance-none checked:bg-danger checked:after:content-['✓'] checked:after:text-surface-bg checked:after:flex checked:after:justify-center checked:after:items-center checked:after:text-xs cursor-pointer"
                                />
                                <label htmlFor="wipeData" className="text-[11px] font-mono tracking-widest uppercase text-danger font-bold select-none cursor-pointer">
                                    ⚠ Wipe all existing match data and reset ratings (teams and accounts are preserved)
                                </label>
                            </div>

                            <div className="flex justify-center gap-3">
                                <button onClick={() => setStep("map")} className="btn-ghost !text-[11px] !font-mono !tracking-widest !uppercase">Cancel</button>
                                <button onClick={handleImport} className="btn-primary bg-success hover:bg-success/90 border-success/50 w-full md:w-auto">
                                    [ CONFIRM & IMPORT ]
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === "processing" && (
                <div className="text-center py-20 border border-line bg-surface-bg">
                    <div className="inline-block animate-spin rounded-none h-10 w-10 border-t-2 border-r-2 border-spark mb-6"></div>
                    <p className="text-[11px] text-spark font-mono uppercase tracking-widest font-bold animate-pulse">{status.toUpperCase()}</p>
                </div>
            )}

            {step === "done" && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="text-center py-20 border border-line bg-success/5">
                        <div className="flex justify-center mb-6">
                            <div className="h-14 w-14 bg-success flex items-center justify-center text-surface-bg text-2xl font-bold font-mono border-2 border-success/30">✓</div>
                        </div>
                        <h3 className="text-[14px] font-mono tracking-widest uppercase font-bold text-success mb-3"> IMPORT COMPLETE </h3>
                        <p className="text-[11px] font-mono tracking-widest uppercase text-txt-3 mb-8 max-w-md mx-auto">{status}</p>
                        <button onClick={() => router.push("/dashboard")} className="btn-primary">
                            [ GO TO DASHBOARD ]
                        </button>
                    </div>

                    {updatedTeams.length > 0 && (
                        <div className="card border border-line">
                            <div className="bg-surface-bg border-b border-line px-4 py-3 flex items-center justify-between">
                                <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-txt-1">
                                    UPDATED TEAM RATINGS
                                </span>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-txt-3">
                                    {updatedTeams.length} TEAMS AFFECTED
                                </span>
                            </div>
                            <div className="overflow-x-auto max-h-96">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-surface-card z-10">
                                        <tr>
                                            <th className="p-3 text-[10px] font-mono tracking-wider uppercase text-txt-2 border-b border-r border-line">TEAM NUMBER</th>
                                            <th className="p-3 text-[10px] font-mono tracking-wider uppercase text-txt-2 border-b border-r border-line text-right">NEW RATING</th>
                                            <th className="p-3 text-[10px] font-mono tracking-wider uppercase text-txt-2 border-b border-line text-right">UNCERTAINTY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...updatedTeams].sort((a, b) => b.performanceRating - a.performanceRating).map((team: any) => (
                                            <tr key={team.teamNumber} className="hover:bg-surface-hover transition-colors border-b border-line last:border-b-0">
                                                <td className="p-3 border-r border-line">
                                                    <span className="font-mono text-[13px] font-bold text-txt-1 tracking-wider">{team.teamNumber}</span>
                                                </td>
                                                <td className="p-3 border-r border-line text-right">
                                                    <span className="font-mono text-[13px] font-bold text-txt-1">{team.performanceRating.toFixed(1)}</span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <span className="font-mono text-[11px] text-txt-3">±{team.ratingUncertainty.toFixed(1)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
