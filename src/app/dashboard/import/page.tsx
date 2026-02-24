"use client";

import { useState, useEffect } from "react";
import { ImportFileUpload } from "@/components/ImportFileUpload";
import { ColumnMappingTable, ColumnMapping } from "@/components/ColumnMappingTable";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type ImportMethod = "file" | "api";
type ApiStep = "key" | "search" | "fetching" | "review";

export default function ImportPage() {
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();

    useEffect(() => {
        if (sessionStatus === "authenticated" && (session?.user as any).isAdmin !== true) {
            router.push("/dashboard");
        }
    }, [sessionStatus, session, router]);
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
    const [wipeData, setWipeData] = useState(true);

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
                body: JSON.stringify({ fileData, mapping, importType, wipeData }),
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
                body: JSON.stringify({ fileData: rows, mapping: apiMapping, importType: "match", wipeData }),
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between border-b pb-4 border-line">
                <div>
                    <h1 className="font-head text-4xl font-extrabold text-txt-1 tracking-tight uppercase">Data Import</h1>
                    <p className="text-xs font-mono tracking-widest uppercase text-txt-3 mt-1">Upload Match Data or Fetch from API</p>
                </div>

                {/* Import Method Selector */}
                {step !== "done" && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => switchMethod("file")}
                            className={`px-4 py-2 text-[11px] font-mono tracking-widest uppercase font-bold transition-colors border ${importMethod === "file" ? "bg-spark text-surface-bg border-spark" : "border-line text-txt-3 hover:text-txt-1 hover:border-txt-1"}`}
                        >
                            [ FILE ]
                        </button>
                        <button
                            onClick={() => switchMethod("api")}
                            className={`px-4 py-2 text-[11px] font-mono tracking-widest uppercase font-bold transition-colors border ${importMethod === "api" ? "bg-spark text-surface-bg border-spark" : "border-line text-txt-3 hover:text-txt-1 hover:border-txt-1"}`}
                        >
                            [ ROBOTEVENTS ]
                        </button>
                    </div>
                )}
            </div>

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
                                            ⚠ Wipe all existing match data and delete ALL teams and accounts
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
                </>
            )}

            {/* ============ ROBOTEVENTS API PATH ============ */}
            {importMethod === "api" && step !== "done" && (
                <>
                    {apiStep === "key" && (
                        <div className="card overflow-hidden">
                            <div className="card-header bg-surface-bg border-b border-line py-2">
                                <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">API Authentication</span>
                            </div>
                            <div className="p-6 bg-surface-card space-y-4">
                                <div>
                                    <p className="text-[11px] font-mono tracking-widest uppercase text-txt-3 mb-4">
                                        GET YOUR API KEY FROM{" "}
                                        <a href="https://www.robotevents.com/api" target="_blank" rel="noopener noreferrer" className="text-spark font-bold hover:underline">
                                            ROBOTEVENTS.COM/API
                                        </a>
                                    </p>
                                    <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="input font-mono tracking-widest" placeholder="PASTE YOUR ROBOTEVENTS API KEY…" />
                                </div>
                                {apiError && (
                                    <div className="bg-danger/10 border border-danger/30 p-3 text-[11px] font-mono text-danger uppercase tracking-widest text-center">
                                        {apiError}
                                    </div>
                                )}
                                <div className="pt-2">
                                    <button onClick={validateApiKey} disabled={!apiKey || apiLoading} className="btn-primary w-full sm:w-auto">
                                        {apiLoading ? "VALIDATING…" : "[ VALIDATE KEY ]"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {apiStep === "search" && (
                        <div className="space-y-6">
                            <div className="card overflow-hidden">
                                <div className="card-header bg-surface-bg border-b border-line py-2 flex justify-between items-center">
                                    <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">Find Event</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono tracking-widest text-success uppercase font-bold">✓ KEY VALID</span>
                                        <button onClick={() => { setApiStep("key"); setApiKeyValid(false); }} className="text-[10px] font-mono tracking-widest text-txt-3 hover:text-txt-1 uppercase transition-colors">[ CHANGE ]</button>
                                    </div>
                                </div>
                                <div className="p-6 bg-surface-card space-y-4">
                                    <p className="text-[11px] font-mono tracking-widest uppercase text-txt-3 mb-2">SEARCH BY EVENT NAME OR SKU</p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input type="text" value={eventQuery} onChange={(e) => setEventQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchEvents()} className="input font-mono tracking-widest flex-1 uppercase" placeholder="e.g. WORLDS, STATE CHAMPIONSHIP…" />
                                        <button onClick={searchEvents} disabled={!eventQuery || apiLoading} className="btn-primary w-full sm:w-auto">
                                            {apiLoading ? "SEARCHING…" : "[ SEARCH ]"}
                                        </button>
                                    </div>
                                    {apiError && (
                                        <div className="bg-danger/10 border border-danger/30 p-3 text-[11px] font-mono text-danger uppercase tracking-widest text-center mt-2">
                                            {apiError}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {events.length > 0 && (
                                <div className="border border-line bg-surface-bg">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm border-collapse">
                                            <thead>
                                                <tr className="border-b border-line bg-surface-card">
                                                    <th className="p-3 text-[10px] text-txt-3 font-mono uppercase tracking-widest font-bold border-r border-line">EVENT</th>
                                                    <th className="p-3 text-[10px] text-txt-3 font-mono uppercase tracking-widest font-bold border-r border-line w-32">SKU</th>
                                                    <th className="p-3 text-[10px] text-txt-3 font-mono uppercase tracking-widest font-bold border-r border-line">LOCATION</th>
                                                    <th className="p-3 w-32"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {events.map((ev) => (
                                                    <tr key={ev.id} className="border-b border-line last:border-b-0 hover:bg-surface-hover transition-colors">
                                                        <td className="p-3 border-r border-line">
                                                            <div className="font-bold text-txt-1 text-[13px] tracking-wide uppercase">{ev.name}</div>
                                                            <div className="text-[10px] text-txt-3 font-mono uppercase tracking-widest mt-1">{ev.start ? new Date(ev.start).toLocaleDateString() : ""}</div>
                                                        </td>
                                                        <td className="p-3 border-r border-line font-mono text-[11px] text-spark tracking-widest uppercase">{ev.sku}</td>
                                                        <td className="p-3 border-r border-line text-[11px] font-mono text-txt-2 tracking-widest uppercase">{ev.location}</td>
                                                        <td className="p-3 text-center">
                                                            <button onClick={() => fetchEventMatches(ev)} className="bg-spark/10 text-spark border border-spark/30 hover:bg-spark hover:text-surface-bg transition-colors text-[10px] font-mono tracking-widest font-bold uppercase py-1.5 px-3">
                                                                FETCH
                                                            </button>
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

                    {apiStep === "fetching" && (
                        <div className="text-center py-20 border border-line bg-surface-bg">
                            <div className="inline-block animate-spin rounded-none h-10 w-10 border-t-2 border-r-2 border-spark mb-6"></div>
                            <p className="text-[11px] text-spark font-mono uppercase tracking-widest font-bold animate-pulse">FETCHING MATCHES FROM {selectedEvent?.sku || "EVENT"}…</p>
                        </div>
                    )}

                    {apiStep === "review" && (
                        <div className="space-y-5">
                            <div className="card overflow-hidden">
                                <div className="card-header bg-surface-bg border-b border-line py-2 text-center">
                                    <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">Ready to Import from {selectedEvent?.name}</span>
                                </div>
                                <div className="p-5 bg-surface-card">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-line mb-6 divide-y md:divide-y-0 md:divide-x divide-line bg-surface-bg">
                                        <div className="p-4 flex flex-col items-center justify-center">
                                            <div className="text-[10px] font-mono tracking-widest uppercase text-txt-3 mb-1">Matches Found</div>
                                            <div className="font-mono text-2xl font-bold text-cyan-400">{apiMatchCount}</div>
                                        </div>
                                        <div className="p-4 flex flex-col items-center justify-center">
                                            <div className="text-[10px] font-mono tracking-widest uppercase text-txt-3 mb-1">Unique Teams</div>
                                            <div className="font-mono text-2xl font-bold text-amber-500">{apiTeamCount}</div>
                                        </div>
                                        <div className="p-4 flex flex-col items-center justify-center">
                                            <div className="text-[10px] font-mono tracking-widest uppercase text-txt-3 mb-1">Event SKU</div>
                                            <div className="font-mono text-xs text-txt-1 mt-1 text-center">{selectedEvent?.sku}</div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-[11px] font-mono tracking-widest uppercase text-txt-1 mb-2">Sample Matches</h4>
                                        <div className="space-y-0 border border-line divide-y divide-line max-h-60 overflow-y-auto">
                                            {apiMatches.slice(0, 5).map((m, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-surface-bg text-[10px] font-mono hover:bg-surface-hover transition-colors">
                                                    <span className="text-txt-3 w-16 truncate flex-shrink-0" title={m.eventName}>{m.eventName}</span>
                                                    <span className="text-danger flex-1 truncate text-right">{m.redTeam1} {m.redTeam2} {m.redTeam3}</span>
                                                    <span className="font-bold text-txt-1 text-base mx-2 tracking-widest">{m.redScore} - {m.blueScore}</span>
                                                    <span className="text-spark flex-1 truncate">{m.blueTeam1} {m.blueTeam2} {m.blueTeam3}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {apiError && (
                                        <div className="mb-4 bg-danger/10 border border-danger/30 p-3 text-[11px] font-mono text-danger uppercase tracking-widest text-center">
                                            {apiError}
                                        </div>
                                    )}

                                    <div className="mb-8 flex items-center justify-center gap-3 bg-danger/5 border border-danger/20 p-4">
                                        <input
                                            type="checkbox"
                                            id="apiWipeData"
                                            checked={wipeData}
                                            onChange={(e) => setWipeData(e.target.checked)}
                                            className="w-4 h-4 rounded-none border-danger/50 bg-surface-bg text-danger focus:ring-danger focus:ring-1 appearance-none checked:bg-danger checked:after:content-['✓'] checked:after:text-surface-bg checked:after:flex checked:after:justify-center checked:after:items-center checked:after:text-xs cursor-pointer"
                                        />
                                        <label htmlFor="apiWipeData" className="text-[11px] font-mono tracking-widest uppercase text-danger font-bold select-none cursor-pointer">
                                            ⚠ Wipe all existing match data and delete ALL teams and accounts
                                        </label>
                                    </div>

                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => { setApiStep("search"); setApiError(""); }} className="btn-ghost !text-[11px] !font-mono !tracking-widest !uppercase">Back</button>
                                        <button onClick={importApiMatches} disabled={apiLoading || apiMatches.length === 0} className="btn-primary bg-success hover:bg-success/90 border-success/50 w-full md:w-auto">
                                            {apiLoading ? "IMPORTING…" : `[ CONFIRM & IMPORT ${apiMatchCount} MATCHES ]`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ============ SHARED STATES ============ */}
            {importMethod === "file" && step === "processing" && (
                <div className="text-center py-20 border border-line bg-surface-bg">
                    <div className="inline-block animate-spin rounded-none h-10 w-10 border-t-2 border-r-2 border-spark mb-6"></div>
                    <p className="text-[11px] text-spark font-mono uppercase tracking-widest font-bold animate-pulse">{status.toUpperCase()}</p>
                </div>
            )}

            {step === "done" && (
                <div className="text-center py-20 border border-line bg-success/5">
                    <div className="flex justify-center mb-6">
                        <div className="h-14 w-14 bg-success flex items-center justify-center text-surface-bg text-2xl font-bold font-mono border-2 border-success/30">✓</div>
                    </div>
                    <h3 className="text-[14px] font-mono tracking-widest uppercase font-bold text-success mb-3"> IMPORT COMPLETE </h3>
                    <p className="text-[11px] font-mono tracking-widest uppercase text-txt-3 mb-8 max-w-md mx-auto">{status || apiImportStatus}</p>
                    <button onClick={() => router.push("/dashboard")} className="btn-primary">
                        [ GO TO DASHBOARD ]
                    </button>
                </div>
            )}
        </div>
    );
}
