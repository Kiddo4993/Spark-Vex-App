"use client";

import { useState } from "react";
import { ImportFileUpload } from "@/components/ImportFileUpload";
import { ColumnMappingTable, ColumnMapping } from "@/components/ColumnMappingTable";
import { useRouter } from "next/navigation";

export default function ImportPage() {
    const router = useRouter();
    const [step, setStep] = useState<"upload" | "map" | "processing" | "review" | "done">("upload");
    const [importType, setImportType] = useState<"match" | "skills">("match");
    const [fileData, setFileData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [preview, setPreview] = useState<any[][]>([]);
    const [mapping, setMapping] = useState<ColumnMapping>({});
    const [status, setStatus] = useState("");
    const [reviewStats, setReviewStats] = useState<any>(null);

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
                body: JSON.stringify({ fileData, mapping, importType }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setStatus(`Success! Imported ${data.count} ${importType === "match" ? "matches" : "entries"}.`);
            setStep("done");
        } catch (e: any) {
            setStatus("Error: " + e.message);
            setStep("map");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="page-title">Import Data</h1>
                <p className="page-subtitle">Upload an XLS/CSV export from RobotEvents to update ratings.</p>
            </div>

            {/* Step: Upload */}
            {step === "upload" && (
                <div className="space-y-5">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setImportType("match")}
                            className={`filter-chip ${importType === "match" ? "on" : ""}`}
                        >
                            Match Results
                        </button>
                        <button
                            onClick={() => setImportType("skills")}
                            className={`filter-chip ${importType === "skills" ? "on" : ""}`}
                        >
                            Skills List
                        </button>
                    </div>
                    <ImportFileUpload onFileSelect={handleFileSelect} />
                    {status && <p className="text-sm text-txt-3 animate-pulse">{status}</p>}
                </div>
            )}

            {/* Step: Map Columns */}
            {step === "map" && (
                <div className="space-y-5">
                    <div className="card p-5 border-l-[3px] border-l-spark">
                        <h3 className="section-title mb-1">Map Columns — {importType === "match" ? "Matches" : "Skills"}</h3>
                        <p className="text-xs text-txt-3 mb-5">Select which column corresponds to each field.</p>
                        <ColumnMappingTable
                            columns={headers}
                            preview={preview}
                            mapping={mapping}
                            onMappingChange={setMapping}
                            mode={importType}
                        />
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
                            disabled={importType === "match"
                                ? (!mapping.date || !mapping.redScore || !mapping.blueScore)
                                : (!mapping.team || !mapping.highestScore)
                            }
                        >
                            Review Import
                        </button>
                    </div>
                </div>
            )}

            {/* Step: Review */}
            {step === "review" && reviewStats && (
                <div className="space-y-5">
                    <div className="card p-6 text-center">
                        <h3 className="font-head text-xl font-bold text-txt-1 mb-6">Ready to Import</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
                            <div className="stat-card c-cyan">
                                <div className="stat-label">{importType === "match" ? "Matches" : "Entries"} Found</div>
                                <div className="stat-value">{reviewStats.matchCount || reviewStats.count}</div>
                            </div>
                            <div className="stat-card c-amber">
                                <div className="stat-label">Unique Teams</div>
                                <div className="stat-value">{reviewStats.teamCount}</div>
                            </div>
                            <div className="stat-card c-green">
                                <div className="stat-label">Date Range</div>
                                <div className="text-sm font-mono text-txt-1 mt-1">
                                    {reviewStats.dateRange ?
                                        `${new Date(reviewStats.dateRange.start).toLocaleDateString()} – ${new Date(reviewStats.dateRange.end).toLocaleDateString()}`
                                        : "N/A"}
                                </div>
                            </div>
                        </div>

                        <div className="text-left mb-6">
                            <h4 className="section-title mb-2">Sample Parsed Data</h4>
                            <pre className="text-xs text-txt-3 font-mono bg-surface-bg p-4 rounded-[10px] overflow-x-auto border border-line">
                                {JSON.stringify(reviewStats.sample, null, 2)}
                            </pre>
                        </div>

                        <div className="flex justify-center gap-3">
                            <button onClick={() => setStep("map")} className="btn-ghost">Back</button>
                            <button onClick={handleImport} className="btn-primary bg-success hover:bg-success/90 border-success/50">
                                Confirm &amp; Import
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step: Processing */}
            {step === "processing" && (
                <div className="text-center py-20 card">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-spark mb-5"></div>
                    <p className="text-txt-1 font-head font-bold tracking-wide animate-pulse">{status}</p>
                </div>
            )}

            {/* Step: Done */}
            {step === "done" && (
                <div className="text-center py-20 card">
                    <div className="flex justify-center mb-5">
                        <div className="h-14 w-14 rounded-full bg-success/15 flex items-center justify-center text-success text-2xl border border-success/30">
                            ✓
                        </div>
                    </div>
                    <h3 className="font-head text-xl font-bold text-txt-1 mb-2">Import Complete</h3>
                    <p className="text-sm text-txt-3 mb-6 max-w-md mx-auto">{status}</p>
                    <button onClick={() => router.push("/dashboard")} className="btn-primary">Go to Dashboard</button>
                </div>
            )}
        </div>
    );
}
