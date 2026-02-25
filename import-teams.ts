import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

function generatePassword(length = 6): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function main() {
    const files = [
        path.join(process.env.HOME || "", "Downloads", "skills-standings (2).csv"), // HS
        path.join(process.env.HOME || "", "Downloads", "skills-standings (3).csv")  // MS
    ];

    let totalTeams = 0;
    let newTeamsCount = 0;

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

    const BATCH_SIZE = 50;
    for (let i = 0; i < teamArray.length; i += BATCH_SIZE) {
        const batch = teamArray.slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async (record) => {
            const teamNum = record["Team Number"];
            const upNum = String(teamNum).trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

            const existingTeam = await prisma.team.findUnique({
                where: { teamNumber: upNum },
                include: { user: true }
            });

            if (!existingTeam) {
                const plainPassword = generatePassword(6);
                const hashedPassword = await hash(plainPassword, 8); // faster hash for bulk initial seed

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
            }
        }));

        console.log(`Processed ${Math.min(i + BATCH_SIZE, teamArray.length)} / ${teamArray.length}...`);
    }

    console.log(`Done! Evaluated ${totalTeams} rows. Created ${newTeamsCount} new accounts/teams.`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
