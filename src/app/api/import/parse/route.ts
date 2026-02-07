import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse as array of arrays
        const json = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

        if (json.length === 0) {
            return NextResponse.json({ error: "Empty file" }, { status: 400 });
        }

        const headers = json[0].map(String);
        const preview = json.slice(1, 6); // First 5 rows

        // Auto-detect suggestion?
        // We can iterate headers and see if they match expected keywords.
        // ... skipping for brevity, user can map manually.

        return NextResponse.json({ headers, preview, fullData: json });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Parse failed" }, { status: 500 });
    }
}
