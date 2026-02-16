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
            className="border-2 border-dashed border-vex-border rounded-xl p-10 text-center hover:border-vex-accent hover:bg-vex-surface/50 transition-all duration-300 cursor-pointer bg-vex-surface/20 backdrop-blur-sm group"
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
                <div className="text-white space-y-2">
                    <p className="text-4xl mb-4">📄</p>
                    <p className="text-lg font-bold">File selected:</p>
                    <p className="text-vex-accent font-mono text-sm bg-vex-dark/50 py-1 px-3 rounded-full inline-block border border-vex-border">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400 mt-4 group-hover:text-white transition-colors">Click to change</p>
                </div>
            ) : (
                <div className="text-gray-400 space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-vex-surface flex items-center justify-center border border-vex-border group-hover:border-vex-accent group-hover:scale-110 transition-all duration-300">
                        <span className="text-2xl">📂</span>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-white group-hover:text-vex-accent transition-colors">
                            Click to upload or drag & drop
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Supports .xls, .xlsx, .csv (max 10MB)</p>
                    </div>
                </div>
            )}
        </div>
    );
}
