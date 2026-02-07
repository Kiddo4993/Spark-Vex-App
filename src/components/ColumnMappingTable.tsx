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
};

const REQUIRED_FIELDS = [
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

export function ColumnMappingTable({
    columns,
    preview,
    mapping,
    onMappingChange,
}: {
    columns: string[];
    preview: any[][];
    mapping: ColumnMapping;
    onMappingChange: (mapping: ColumnMapping) => void;
}) {
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
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr>
                        {columns.map((col, idx) => {
                            const mappedField = Object.entries(mapping).find(([k, v]) => v === String(idx))?.[0] || "";
                            return (
                                <th key={idx} className="p-2 border-b border-gray-700 min-w-[150px]">
                                    <div className="mb-2 text-gray-400 truncate" title={col}>{col}</div>
                                    <select
                                        className="select w-full text-xs"
                                        value={mappedField}
                                        onChange={(e) => handleSelect(String(idx), e.target.value)}
                                    >
                                        <option value="">(Ignore)</option>
                                        {REQUIRED_FIELDS.map((f) => (
                                            <option key={f.key} value={f.key}>
                                                {f.label}
                                            </option>
                                        ))}
                                    </select>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {preview.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-gray-800">
                            {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2 text-gray-300 max-w-[150px] truncate">
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
