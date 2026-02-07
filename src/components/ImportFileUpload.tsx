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
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-vex-accent transition-colors cursor-pointer bg-vex-darker/50"
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
                <div className="text-white">
                    <p className="text-lg font-medium">File selected:</p>
                    <p className="text-vex-accent">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500 mt-2">Click to change</p>
                </div>
            ) : (
                <div className="text-gray-400">
                    <p className="text-4xl mb-4">📂</p>
                    <p className="text-lg font-medium text-white">
                        Drag & drop XLS/CSV file or click to browse
                    </p>
                    <p className="text-sm mt-2">Supports .xls, .xlsx, .csv (max 10MB)</p>
                </div>
            )}
        </div>
    );
}
