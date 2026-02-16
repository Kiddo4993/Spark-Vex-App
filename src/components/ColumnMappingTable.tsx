"use client";

export type ColumnMapping = {
    eventName?: string;
    date?: string;
    // Match Fields
    redTeam1?: string;
    redTeam2?: string;
    redTeam3?: string;
    blueTeam1?: string;
    blueTeam2?: string;
    blueTeam3?: string;
    redScore?: string;
    blueScore?: string;
    // Skills Fields
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
        // Remove if previously mapped to this column
        // Actually, one field per column? Or one column to one field?
        // We map Field -> ColumnIndex.

        // Clear any existing mapping for this field
        // But wait, the dropdown is changing the field for THIS column.

        // Check if this field is already mapped to another column?
        // Not strictly necessary, but good UX.

        if (field === "") {
            // Find if this colIndex was mapped strictly and remove it?
            // We need to iterate entries.
            const entry = Object.entries(newMapping).find(([k, v]) => v === colIndex);
            if (entry) {
                delete newMapping[entry[0] as keyof ColumnMapping];
            }
        } else {
            // Map field -> colIndex
            // Remove old mapping for this field to avoid duplicates
            // (e.g. RedTeam1 was col 0, now set col 1 to RedTeam1 -> update)
            newMapping[field as keyof ColumnMapping] = colIndex;
        }

        onMappingChange(newMapping);
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-vex-border bg-vex-surface/30 backdrop-blur-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-vex-darker/50">
                    <tr>
                        {columns.map((col, idx) => {
                            const mappedField = Object.entries(mapping).find(([k, v]) => v === String(idx))?.[0] || "";
                            return (
                                <th key={idx} className="p-3 border-b border-vex-border min-w-[150px]">
                                    <div className="mb-2 text-gray-300 font-medium truncate" title={col}>{col}</div>
                                    <select
                                        className="w-full text-xs bg-vex-dark border border-vex-border rounded px-2 py-1 text-white focus:border-vex-accent focus:ring-1 focus:ring-vex-accent outline-none"
                                        value={mappedField}
                                        onChange={(e) => handleSelect(String(idx), e.target.value)}
                                    >
                                        <option value="" className="text-gray-500">(Ignore)</option>
                                        {fields.map((f) => (
                                            <option key={f.key} value={f.key} className="text-white">
                                                {f.label}
                                            </option>
                                        ))}
                                    </select>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody className="divide-y divide-vex-border/50">
                    {preview.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-vex-surface/20 transition-colors">
                            {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 text-gray-400 max-w-[150px] truncate text-xs font-mono">
                                    {String(cell)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
