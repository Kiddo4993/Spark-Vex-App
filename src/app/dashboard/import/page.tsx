"use client";

import { useState } from "react";
import { ImportFileUpload } from "@/components/ImportFileUpload";
import { ColumnMappingTable, ColumnMapping } from "@/components/ColumnMappingTable";
import { useRouter } from "next/navigation";

type ImportMethod = "file" | "api";
type ApiStep = "key" | "search" | "fetching" | "review";

export default function ImportPage() {
    const router = useRouter();
    const [importMethod, setImportMethod] = useState<ImportMethod>("file");

    // --- File upload state ---
    const [step, setStep] = useState<"upload" | "map" | "processing" | "review" | "done">("upload");
    const [importType, setImportType] = useState<"match" | "skills">("match");
    const [fileData, setFileData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [preview, setPreview] = useState<any[][]>([]);
    const [mapping, setMapping] = useState<ColumnMapping>({});
    const [status, setStatus] = useState("");
    const [reviewStats, setReviewStats] = useState<any>(null);

    // --- RobotEvents API state ---
    const [apiStep, setApiStep] = useState<ApiStep>("key");
    const [apiKey, setApiKey] = useState("");
    const [apiKeyValid, setApiKeyValid] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [eventQuery, setEventQuery] = useState("");
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [apiMatches, setApiMatches] = useState<any[]>([]);
    const [apiMatchCount, setApiMatchCount] = useState(0);
    const [apiTeamCount, setApiTeamCount] = useState(0);
    const [apiImportStatus, setApiImportStatus] = useState("");

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

    // --- RobotEvents API handlers ---
    const validateApiKey = async () => {
        setApiLoading(true);
        setApiError("");
        try {
            const res = await fetch("/api/import/robotevents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey, action: "validate" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setApiKeyValid(true);
            setApiStep("search");
        } catch (e: any) {
            setApiError(e.message || "Invalid API key");
        } finally {
            setApiLoading(false);
        }
    };

    const searchEvents = async () => {
        setApiLoading(true);
        setApiError("");
        try {
            const res = await fetch("/api/import/robotevents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey, action: "searchEvents", query: eventQuery }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setEvents(data.events || []);
            if (data.events.length === 0) {
                setApiError("No events found. Try a different search term.");
            }
        } catch (e: any) {
            setApiError(e.message || "Failed to search events");
        } finally {
            setApiLoading(false);
        }
    };

    const fetchEventMatches = async (event: any) => {
        setSelectedEvent(event);
        setApiStep("fetching");
        setApiLoading(true);
        setApiError("");
        try {
            const res = await fetch("/api/import/robotevents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey, action: "fetchMatches", eventId: event.id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setApiMatches(data.matches || []);
            setApiMatchCount(data.matchCount || 0);
            setApiTeamCount(data.teamCount || 0);
            setApiStep("review");
        } catch (e: any) {
            setApiError(e.message || "Failed to fetch matches");
            setApiStep("search");
        } finally {
            setApiLoading(false);
        }
    };

    const importApiMatches = async () => {
        setApiLoading(true);
        setApiImportStatus("Importing matches and recalculating ratings…");
        setApiError("");
        try {
            const rows = apiMatches.map((m) => [
                m.eventName, m.date,
                m.redTeam1, m.redTeam2, m.redTeam3,
                m.blueTeam1, m.blueTeam2, m.blueTeam3,
                String(m.redScore), String(m.blueScore),
            ]);

            const apiMapping: ColumnMapping = {
                eventName: "0", date: "1",
                redTeam1: "2", redTeam2: "3", redTeam3: "4",
                blueTeam1: "5", blueTeam2: "6", blueTeam3: "7",
                redScore: "8", blueScore: "9",
            };

            const res = await fetch("/api/import/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileData: rows, mapping: apiMapping, importType: "match" }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setApiImportStatus(`Success! Imported ${data.count} matches.`);
            setStep("done");
        } catch (e: any) {
            setApiError(e.message || "Import failed");
            setApiImportStatus("");
        } finally {
            setApiLoading(false);
        }
    };

    const switchMethod = (method: ImportMethod) => {
        setImportMethod(method);
        setStep("upload");
        setApiStep("key");
        setApiError("");
        setApiKeyValid(false);
        setEvents([]);
        setSelectedEvent(null);
        setApiMatches([]);
        setApiImportStatus("");
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="page-title">Import Data</h1>
                <p className="page-subtitle">Import match data from a file or directly from the RobotEvents API.</p>
            </div>

            {/* Import Method Selector */}
            {step !== "done" && (
                <div className="flex gap-2">
                    <button
                        onClick={() => switchMethod("file")}
                        className={`filter-chip ${importMethod === "file" ? "on" : ""}`}
                    >
                        📄 Upload File
                    </button>
                    <button
                        onClick={() => switchMethod("api")}
                        className={`filter-chip ${importMethod === "api" ? "on" : ""}`}
                    >
                        🌐 RobotEvents API
                    </button>
                </div>
            )}

            {/* ============ FILE UPLOAD PATH ============ */}
            {importMethod === "file" && (
                <>
                    {step === "upload" && (
                        <div className="space-y-5">
                            <div className="flex gap-2">
                                <button onClick={() => setImportType("match")} className={`filter-chip ${importType === "match" ? "on" : ""}`}>Match Results</button>
                                <button onClick={() => setImportType("skills")} className={`filter-chip ${importType === "skills" ? "on" : ""}`}>Skills List</button>
                            </div>
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
                                    disabled={importType === "match" ? (!mapping.date || !mapping.redScore || !mapping.blueScore) : (!mapping.team || !mapping.highestScore)}
                                >
                                    Review Import
                                </button>
                            </div>
                        </div>
                    )}

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
                                            {reviewStats.dateRange ? `${new Date(reviewStats.dateRange.start).toLocaleDateString()} – ${new Date(reviewStats.dateRange.end).toLocaleDateString()}` : "N/A"}
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
                                    <button onClick={handleImport} className="btn-primary bg-success hover:bg-success/90 border-success/50">Confirm &amp; Import</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ============ ROBOTEVENTS API PATH ============ */}
            {importMethod === "api" && step !== "done" && (
                <>
                    {apiStep === "key" && (
                        <div className="card p-6 space-y-4">
                            <div>
                                <h3 className="section-title mb-1">Enter API Key</h3>
                                <p className="text-xs text-txt-3">
                                    Get your API key from{" "}
                                    <a href="https://www.robotevents.com/api" target="_blank" rel="noopener noreferrer" className="text-spark hover:underline">
                                        robotevents.com/api
                                    </a>
                                </p>
                            </div>
                            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="input" placeholder="Paste your RobotEvents API key…" />
                            {apiError && (
                                <div className="alert alert-warn">
                                    <span className="alert-icon">⚠️</span>
                                    <div className="alert-body">{apiError}</div>
                                </div>
                            )}
                            <button onClick={validateApiKey} disabled={!apiKey || apiLoading} className="btn-primary">
                                {apiLoading ? "Validating…" : "Validate Key"}
                            </button>
                        </div>
                    )}

                    {apiStep === "search" && (
                        <div className="space-y-4">
                            <div className="card p-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-success text-sm">✓ API Key Valid</span>
                                    <button onClick={() => { setApiStep("key"); setApiKeyValid(false); }} className="text-[10px] text-txt-3 hover:text-txt-1">Change</button>
                                </div>
                                <div>
                                    <h3 className="section-title mb-1">Find Event</h3>
                                    <p className="text-xs text-txt-3">Search for an event by name to import its match data.</p>
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={eventQuery} onChange={(e) => setEventQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchEvents()} className="input flex-1" placeholder="e.g. Worlds, State Championship…" />
                                    <button onClick={searchEvents} disabled={!eventQuery || apiLoading} className="btn-primary">
                                        {apiLoading ? "Searching…" : "Search"}
                                    </button>
                                </div>
                                {apiError && (
                                    <div className="alert alert-warn">
                                        <span className="alert-icon">⚠️</span>
                                        <div className="alert-body">{apiError}</div>
                                    </div>
                                )}
                            </div>

                            {events.length > 0 && (
                                <div className="card overflow-hidden p-0">
                                    <table className="data-table">
                                        <thead>
                                            <tr><th>Event</th><th>SKU</th><th>Location</th><th></th></tr>
                                        </thead>
                                        <tbody>
                                            {events.map((ev) => (
                                                <tr key={ev.id}>
                                                    <td className="p-3">
                                                        <div className="font-semibold text-txt-1 text-sm">{ev.name}</div>
                                                        <div className="text-[10px] text-txt-3 font-mono">{ev.start ? new Date(ev.start).toLocaleDateString() : ""}</div>
                                                    </td>
                                                    <td className="p-3 font-mono text-xs text-txt-3">{ev.sku}</td>
                                                    <td className="p-3 text-xs text-txt-3">{ev.location}</td>
                                                    <td className="p-3">
                                                        <button onClick={() => fetchEventMatches(ev)} className="btn-primary text-xs py-1 px-3">Fetch Matches</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {apiStep === "fetching" && (
                        <div className="text-center py-20 card">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-spark mb-5"></div>
                            <p className="text-txt-1 font-head font-bold tracking-wide animate-pulse">Fetching matches from {selectedEvent?.name}…</p>
                        </div>
                    )}

                    {apiStep === "review" && (
                        <div className="space-y-5">
                            <div className="card p-6 text-center">
                                <h3 className="font-head text-xl font-bold text-txt-1 mb-6">Ready to Import from {selectedEvent?.name}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
                                    <div className="stat-card c-cyan">
                                        <div className="stat-label">Matches Found</div>
                                        <div className="stat-value">{apiMatchCount}</div>
                                    </div>
                                    <div className="stat-card c-amber">
                                        <div className="stat-label">Unique Teams</div>
                                        <div className="stat-value">{apiTeamCount}</div>
                                    </div>
                                    <div className="stat-card c-green">
                                        <div className="stat-label">Event</div>
                                        <div className="text-sm font-mono text-txt-1 mt-1">{selectedEvent?.sku}</div>
                                    </div>
                                </div>
                                <div className="text-left mb-6">
                                    <h4 className="section-title mb-2">Sample Matches</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {apiMatches.slice(0, 5).map((m, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-surface-bg rounded-[10px] border border-line text-xs font-mono">
                                                <span className="text-txt-3 w-20 flex-shrink-0">{m.eventName}</span>
                                                <span className="text-danger">{m.redTeam1} {m.redTeam2} {m.redTeam3}</span>
                                                <span className="font-bold text-txt-1">{m.redScore} – {m.blueScore}</span>
                                                <span className="text-spark">{m.blueTeam1} {m.blueTeam2} {m.blueTeam3}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {apiError && (
                                    <div className="alert alert-warn mb-4">
                                        <span className="alert-icon">⚠️</span>
                                        <div className="alert-body">{apiError}</div>
                                    </div>
                                )}
                                <div className="flex justify-center gap-3">
                                    <button onClick={() => { setApiStep("search"); setApiError(""); }} className="btn-ghost">Back</button>
                                    <button onClick={importApiMatches} disabled={apiLoading || apiMatches.length === 0} className="btn-primary bg-success hover:bg-success/90 border-success/50">
                                        {apiLoading ? "Importing…" : `Confirm & Import ${apiMatchCount} Matches`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ============ SHARED STATES ============ */}
            {importMethod === "file" && step === "processing" && (
                <div className="text-center py-20 card">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-spark mb-5"></div>
                    <p className="text-txt-1 font-head font-bold tracking-wide animate-pulse">{status}</p>
                </div>
            )}

            {step === "done" && (
                <div className="text-center py-20 card">
                    <div className="flex justify-center mb-5">
                        <div className="h-14 w-14 rounded-full bg-success/15 flex items-center justify-center text-success text-2xl border border-success/30">✓</div>
                    </div>
                    <h3 className="font-head text-xl font-bold text-txt-1 mb-2">Import Complete</h3>
                    <p className="text-sm text-txt-3 mb-6 max-w-md mx-auto">{status || apiImportStatus}</p>
                    <button onClick={() => router.push("/dashboard")} className="btn-primary">Go to Dashboard</button>
                </div>
            )}
        </div>
    );
}
