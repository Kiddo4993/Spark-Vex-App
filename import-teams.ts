import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
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
    // All CSV files to process — HS + MS standings
    const files = [
        path.join(process.cwd(), "highschool.csv"),
        path.join(process.cwd(), "middleschool.csv")
    ];

    let totalTeams = 0;
    let newTeamsCount = 0;
    let skippedCount = 0;

    const allRecords: any[] = [];
    for (const file of files) {
        if (!fs.existsSync(file)) {
            console.warn(`File not found: ${file}`);
            continue;
        }
        console.log(`Reading file: ${file}`);
        const content = fs.readFileSync(file, "utf8");
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
        allRecords.push(...records);
    }

    // De-duplicate in memory to avoid multiple upserts of same team
    const uniqueTeams = new Map<string, any>();
    for (const record of allRecords) {
        totalTeams++;
        const teamNum = record["Team Number"];
        if (!teamNum) continue;

        const upNum = String(teamNum).trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        if (!upNum) continue;

        if (!uniqueTeams.has(upNum)) {
            uniqueTeams.set(upNum, record);
        }
    }

    const teamArray = Array.from(uniqueTeams.values());
    console.log(`Processing ${teamArray.length} unique teams out of ${totalTeams} total rows...`);

    // Sequential processing to avoid connection pool exhaustion
    for (let i = 0; i < teamArray.length; i++) {
        const record = teamArray[i];
        const teamNum = record["Team Number"];
        const upNum = String(teamNum).trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

        try {
            const existingTeam = await prisma.team.findUnique({
                where: { teamNumber: upNum },
                include: { user: true }
            });

            if (!existingTeam) {
                const plainPassword = generatePassword(6);
                const hashedPassword = await hash(plainPassword, 8);

                const team = await prisma.team.create({
                    data: {
                        teamNumber: upNum,
                        generatedPassword: plainPassword,
                        country: record["Country / Region"] || null,
                        provinceState: record["Event Region"] || null,
                    }
                });

                await prisma.user.create({
                    data: {
                        teamId: team.id,
                        password: hashedPassword,
                    }
                });
                newTeamsCount++;
            } else if (!existingTeam.user) {
                const plainPassword = generatePassword(6);
                const hashedPassword = await hash(plainPassword, 8);

                await prisma.team.update({
                    where: { id: existingTeam.id },
                    data: { generatedPassword: plainPassword }
                });

                await prisma.user.create({
                    data: {
                        teamId: existingTeam.id,
                        password: hashedPassword,
                    }
                });
                newTeamsCount++;
            } else {
                skippedCount++;
            }
        } catch (err) {
            console.error(`Error processing team ${upNum}:`, err);
        }

        if ((i + 1) % 100 === 0) {
            console.log(`Processed ${i + 1} / ${teamArray.length} (new: ${newTeamsCount}, skipped: ${skippedCount})...`);
        }
    }

    console.log(`\nDone! Evaluated ${totalTeams} rows (${teamArray.length} unique).`);
    console.log(`Created ${newTeamsCount} new accounts. Skipped ${skippedCount} existing accounts.`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
