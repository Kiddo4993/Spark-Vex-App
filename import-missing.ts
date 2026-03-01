import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL } },
});

function generatePassword(length = 6): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function main() {

    const csvTeams = new Map<string, any>();
    for (const file of ["highschool.csv", "middleschool.csv"]) {
        if (!fs.existsSync(file)) { console.warn(`Missing: ${file}`); continue; }
        const records = parse(fs.readFileSync(file, "utf8"), { columns: true, skip_empty_lines: true, trim: true });
        for (const r of records) {
            const t = r["Team Number"];
            if (!t) continue;
            const up = t.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            if (up && !csvTeams.has(up)) csvTeams.set(up, r);
        }
    }
    console.log(`CSV unique teams: ${csvTeams.size}`);


    const dbTeams = await prisma.team.findMany({ select: { teamNumber: true } });
    const existingSet = new Set(dbTeams.map(t => t.teamNumber));
    console.log(`DB existing teams: ${existingSet.size}`);


    const missing: [string, any][] = [];
    for (const [num, record] of csvTeams) {
        if (!existingSet.has(num)) missing.push([num, record]);
    }
    console.log(`Missing teams to create: ${missing.length}`);

    if (missing.length === 0) {
        console.log("All teams already exist!");
        return;
    }


    let created = 0;
    for (const [upNum, record] of missing) {
        try {
            const plainPassword = generatePassword(6);
            const hashedPassword = await hash(plainPassword, 8);

            const team = await prisma.team.create({
                data: {
                    teamNumber: upNum,
                    generatedPassword: plainPassword,
                    country: record["Country / Region"] || null,
                    provinceState: record["Event Region"] || null,
                },
            });

            await prisma.user.create({
                data: { teamId: team.id, password: hashedPassword },
            });
            created++;
            if (created % 10 === 0) console.log(`Created ${created} / ${missing.length}...`);
        } catch (err: any) {
            console.error(`Error creating ${upNum}:`, err.message);
        }
    }

    console.log(`\nDone! Created ${created} new teams. Total should now be ${existingSet.size + created}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
