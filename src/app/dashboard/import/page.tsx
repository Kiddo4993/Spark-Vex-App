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
            setFileData(data.fullData); // Warning: storing in state might be heavy

            // Auto-detect mapping
            const newMapping: ColumnMapping = {};
            const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

            data.headers.forEach((header: string, index: number) => {
                const h = normalize(header);
                const idxStr = index.toString();

                if (importType === "match") {
                    if (h.includes("date") || h.includes("time") || h.includes("start")) newMapping.date = idxStr;
                    else if (h.includes("match") || h.includes("round")) newMapping.eventName = idxStr; // "Match" often contains "Q1", etc.
                    else if (h === "red1" || h === "redteam1") newMapping.redTeam1 = idxStr;
                    else if (h === "red2" || h === "redteam2") newMapping.redTeam2 = idxStr;
                    else if (h === "red3" || h === "redteam3") newMapping.redTeam3 = idxStr;
                    else if (h === "blue1" || h === "blueteam1") newMapping.blueTeam1 = idxStr;
                    else if (h === "blue2" || h === "blueteam2") newMapping.blueTeam2 = idxStr;
                    else if (h === "blue3" || h === "blueteam3") newMapping.blueTeam3 = idxStr;
                    else if (h === "redscore" || h === "redtotal") newMapping.redScore = idxStr;
                    else if (h === "bluescore" || h === "bluetotal") newMapping.blueScore = idxStr;
                } else {
                    // Skills Mapping
                    if (h.includes("rank")) newMapping.rank = idxStr;
                    else if (h.includes("team")) newMapping.team = idxStr; // "Team Number"
                    else if (h.includes("driver")) newMapping.driverScore = idxStr; // "Driver Score"
                    else if (h.includes("prog") || h.includes("auto")) newMapping.programmingScore = idxStr; // "Programming Score"
                    else if (h.includes("high") || h.includes("combined") || h.includes("score")) newMapping.highestScore = idxStr; // "Highest Score"
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
        setStatus("Importing matches and calculating ratings...");
        try {
            const res = await fetch("/api/import/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileData, mapping, importType }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setStatus(`Success! Imported ${data.count} matches.`);
            setStep("done");
        } catch (e: any) {
            setStatus("Error: " + e.message);
            setStep("map"); // allow retry
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Import Matches</h1>
                <p className="text-gray-400">Upload an XLS/CSV export from RobotEvents to update ratings.</p>
            </div>

            {step === "upload" && (
                <div className="space-y-6">
                    <div className="flex gap-4 p-1 bg-vex-surface/50 rounded-lg w-fit">
                        <button
                            onClick={() => setImportType("match")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${importType === "match" ? "bg-vex-accent text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                        >
                            Match Results
                        </button>
                        <button
                            onClick={() => setImportType("skills")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${importType === "skills" ? "bg-vex-accent text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                        >
                            Skills List
                        </button>
                    </div>
                    <ImportFileUpload onFileSelect={handleFileSelect} />
                </div>
            )}

            {step === "map" && (
                <div className="space-y-6">
                    <div className="glass-card p-6 border-l-[4px] border-l-vex-accent">
                        <h3 className="text-white font-bold mb-2">Map Columns ({importType === "match" ? "Matches" : "Skills"})</h3>
                        <p className="text-sm text-gray-400 mb-6">Select which column in your file corresponds to each field.</p>
                        <ColumnMappingTable
                            columns={headers}
                            preview={preview}
                            mapping={mapping}
                            onMappingChange={setMapping}
                            mode={importType}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setStep("upload")} className="btn-secondary">Cancel</button>
                        <button
                            onClick={async () => {
                                setStep("processing");
                                setStatus("Verifying data...");
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

            {step === "review" && reviewStats && (
                <div className="space-y-6">
                    <div className="glass-card p-8 text-center">
                        <h3 className="text-2xl font-bold text-white mb-6">Ready to Import</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
                            <div className="p-4 bg-vex-surface/40 rounded-lg border border-vex-border">
                                <span className="block text-gray-400 text-sm">{importType === "match" ? "Matches" : "Entries"} Found</span>
                                <span className="block text-3xl font-bold text-white">{reviewStats.matchCount || reviewStats.count}</span>
                            </div>
                            <div className="p-4 bg-vex-surface/40 rounded-lg border border-vex-border">
                                <span className="block text-gray-400 text-sm">Unique Teams</span>
                                <span className="block text-3xl font-bold text-white">{reviewStats.teamCount}</span>
                            </div>
                            <div className="p-4 bg-vex-surface/40 rounded-lg border border-vex-border">
                                <span className="block text-gray-400 text-sm">Date Range</span>
                                <span className="block text-lg font-bold text-white">
                                    {reviewStats.dateRange ?
                                        `${new Date(reviewStats.dateRange.start).toLocaleDateString()} - ${new Date(reviewStats.dateRange.end).toLocaleDateString()}`
                                        : "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className="text-left mb-8">
                            <h4 className="text-white font-bold mb-2">Sample Parsed Data</h4>
                            <div className="text-xs text-gray-400 font-mono bg-black/30 p-4 rounded overflow-x-auto">
                                {JSON.stringify(reviewStats.sample, null, 2)}
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={() => setStep("map")} className="btn-secondary px-6">Back</button>
                            <button onClick={handleImport} className="btn-primary px-8 bg-green-600 hover:bg-green-500 border-green-500">
                                Confirm & Import
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === "processing" && (
                <div className="text-center py-20 bg-vex-surface/20 rounded-xl border border-vex-border backdrop-blur-sm">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vex-accent mb-6 shadow-[0_0_15px_rgba(var(--vex-accent),0.5)]"></div>
                    <p className="text-white font-bold text-lg tracking-wide animate-pulse">{status}</p>
                </div>
            )}

            {step === "done" && (
                <div className="text-center py-20 bg-vex-surface/20 rounded-xl border border-vex-border backdrop-blur-sm">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-3xl border border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                            ✓
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Import Complete</h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">{status}</p>
                    <button onClick={() => router.push("/dashboard")} className="btn-primary px-8">Go to Dashboard</button>
                </div>
            )}
        </div>
    );
}
