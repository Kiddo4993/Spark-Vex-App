"use client";

export type ColumnMapping = {
    eventName?: string;
    date?: string;
    redTeam1?: string;
    redTeam2?: string;
    redTeam3?: string;
    blueTeam1?: string;
    blueTeam2?: string;
    blueTeam3?: string;
    redScore?: string;
    blueScore?: string;
    rank?: string;
    team?: string;
    driverScore?: string;
    programmingScore?: string;
    highestScore?: string;
};

const MATCH_FIELDS = [
    { key: "eventName", label: "Event Name" },
    { key: "date", label: "Date" },
    { key: "redTeam1", label: "Red Team 1" },
    { key: "redTeam2", label: "Red Team 2" },
    { key: "redTeam3", label: "Red Team 3" },
    { key: "blueTeam1", label: "Blue Team 1" },
    { key: "blueTeam2", label: "Blue Team 2" },
    { key: "blueTeam3", label: "Blue Team 3" },
    { key: "redScore", label: "Red Score" },
    { key: "blueScore", label: "Blue Score" },
];

const SKILLS_FIELDS = [
    { key: "rank", label: "Rank" },
    { key: "team", label: "Team Number" },
    { key: "driverScore", label: "Driver Score" },
    { key: "programmingScore", label: "Programming Score" },
    { key: "highestScore", label: "Highest/Combined Score" },
];

export function ColumnMappingTable({
    columns,
    preview,
    mapping,
    onMappingChange,
    mode = "match",
}: {
    columns: string[];
    preview: any[][];
    mapping: ColumnMapping;
    onMappingChange: (mapping: ColumnMapping) => void;
    mode?: "match" | "skills";
}) {
    const fields = mode === "skills" ? SKILLS_FIELDS : MATCH_FIELDS;

    function handleSelect(colIndex: string, field: string) {
        const newMapping = { ...mapping };

        if (field === "") {
            const entry = Object.entries(newMapping).find(([, v]) => v === colIndex);
            if (entry) {
                delete newMapping[entry[0] as keyof ColumnMapping];
            }
        } else {
            newMapping[field as keyof ColumnMapping] = colIndex;
        }

        onMappingChange(newMapping);
    }

    return (
        <div className="border border-line bg-surface-bg">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => {
                                const mappedField = Object.entries(mapping).find(([, v]) => v === String(idx))?.[0] || "";
                                return (
                                    <th key={idx} className="p-3 min-w-[150px] border-b border-r border-line bg-surface-card last:border-r-0 align-top">
                                        <div className="mb-3 text-[10px] text-txt-3 font-mono uppercase tracking-widest font-bold truncate" title={col}>{col}</div>
                                        <select
                                            className="w-full bg-surface-bg border border-line text-txt-1 text-[11px] font-mono p-1.5 focus:border-spark focus:outline-none focus:ring-1 focus:ring-spark appearance-none rounded-none cursor-pointer"
                                            value={mappedField}
                                            onChange={(e) => handleSelect(String(idx), e.target.value)}
                                        >
                                            <option value="">( IGN )</option>
                                            {fields.map((f) => (
                                                <option key={f.key} value={f.key}>
                                                    {f.label.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {preview.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-line last:border-b-0 hover:bg-surface-hover transition-colors">
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-3 text-txt-3 max-w-[150px] truncate text-[11px] font-mono border-r border-line last:border-r-0">
                                        {String(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
