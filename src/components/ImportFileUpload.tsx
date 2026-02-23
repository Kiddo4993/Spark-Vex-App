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
            className="border-2 border-dashed border-line bg-surface-bg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-spark transition-colors group"
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
                <div className="space-y-2 text-center">
                    <div className="font-mono text-xl font-bold text-spark mb-2 uppercase tracking-widest">[ FILE SELECTED ]</div>
                    <div className="font-mono text-sm text-txt-1 bg-spark/10 py-1 px-3 border border-spark/20 uppercase tracking-widest">
                        {selectedFile.name}
                    </div>
                    <div className="text-[10px] text-txt-3 font-mono mt-3 uppercase tracking-widest group-hover:text-txt-1 transition-colors">
                        Click to change
                    </div>
                </div>
            ) : (
                <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-surface-hover flex items-center justify-center border border-line group-hover:border-spark group-hover:bg-spark/5 transition-all">
                        <span className="font-mono text-xl font-bold text-txt-1 group-hover:text-spark">↑</span>
                    </div>
                    <div>
                        <div className="font-mono text-[11px] font-bold text-txt-1 uppercase tracking-widest group-hover:text-spark transition-colors">
                            Click to upload or drag & drop
                        </div>
                        <div className="text-[10px] text-txt-3 mt-2 font-mono uppercase tracking-widest">
                            .XLS · .XLSX · .CSV (MAX 10 MB)
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
