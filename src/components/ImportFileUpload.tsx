"use client";

import { useState, useRef } from "react";

export function ImportFileUpload({
    onFileSelect,
}: {
    onFileSelect: (file: File) => void;
}) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            onFileSelect(file);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
            onFileSelect(file);
        }
    }

    return (
        <div
            className="dropzone group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept=".xls,.xlsx,.csv"
                onChange={handleFileChange}
            />
            {selectedFile ? (
                <div className="space-y-2">
                    <p className="text-3xl mb-3">📄</p>
                    <p className="font-head text-sm font-bold text-txt-1">File selected</p>
                    <p className="font-mono text-xs text-spark bg-spark/10 py-1 px-3 rounded-full inline-block border border-spark/20">
                        {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-txt-3 font-mono mt-3 group-hover:text-txt-1 transition-colors">
                        Click to change
                    </p>
                </div>
            ) : (
                <div className="text-txt-3 space-y-3">
                    <div className="mx-auto w-14 h-14 rounded-xl bg-surface-hover flex items-center justify-center border border-line group-hover:border-spark group-hover:scale-105 transition-all">
                        <span className="text-xl">↑</span>
                    </div>
                    <div>
                        <p className="font-head text-sm font-bold text-txt-1 group-hover:text-spark transition-colors">
                            Click to upload or drag &amp; drop
                        </p>
                        <p className="text-xs text-txt-3 mt-1 font-mono">
                            .xls · .xlsx · .csv (max 10 MB)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
