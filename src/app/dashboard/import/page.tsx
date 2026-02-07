"use client";

import { useState } from "react";
import { ImportFileUpload } from "@/components/ImportFileUpload";
import { ColumnMappingTable, ColumnMapping } from "@/components/ColumnMappingTable";
import { useRouter } from "next/navigation";

export default function ImportPage() {
    const router = useRouter();
    const [step, setStep] = useState<"upload" | "map" | "processing" | "done">("upload");
    const [fileData, setFileData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [preview, setPreview] = useState<any[][]>([]);
    const [mapping, setMapping] = useState<ColumnMapping>({});
    const [status, setStatus] = useState("");

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
            setStep("map");
            setStatus("");

            // Basic auto-detect could go here
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
                body: JSON.stringify({ fileData, mapping }),
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
                <h1 className="text-2xl font-bold text-white">Import Matches</h1>
                <p className="text-gray-400">Upload an XLS/CSV export from RobotEvents to update ratings.</p>
            </div>

            {step === "upload" && (
                <ImportFileUpload onFileSelect={handleFileSelect} />
            )}

            {step === "map" && (
                <div className="space-y-4">
                    <div className="bg-vex-darker/30 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-white font-medium mb-2">Map Columns</h3>
                        <p className="text-sm text-gray-400 mb-4">Select which column in your file corresponds to each field.</p>
                        <ColumnMappingTable
                            columns={headers}
                            preview={preview}
                            mapping={mapping}
                            onMappingChange={setMapping}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button onClick={() => setStep("upload")} className="btn-secondary">Cancel</button>
                        <button
                            onClick={handleImport}
                            className="btn-primary"
                            disabled={!mapping.date || !mapping.redScore || !mapping.blueScore}
                        >
                            Import Matches
                        </button>
                    </div>
                </div>
            )}

            {step === "processing" && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-vex-accent mb-4"></div>
                    <p className="text-white">{status}</p>
                </div>
            )}

            {step === "done" && (
                <div className="text-center py-12 bg-green-900/20 rounded-lg border border-green-800">
                    <p className="text-2xl mb-2">✅</p>
                    <h3 className="text-xl font-bold text-white mb-2">Import Complete</h3>
                    <p className="text-gray-300 mb-6">{status}</p>
                    <button onClick={() => router.push("/dashboard")} className="btn-primary">Go to Dashboard</button>
                </div>
            )}
        </div>
    );
}
