const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
async function main() {
    const uc = await p.user.count();
    const tc = await p.team.count();
    console.log("Users:", uc, "Teams:", tc);
    if (tc > 0) {
        const sample = await p.team.findMany({ take: 3, select: { teamNumber: true, generatedPassword: true } });
        console.log("Sample teams:", JSON.stringify(sample));
    }
    if (uc > 0) {
        const sample = await p.user.findMany({ take: 3, select: { email: true, isAdmin: true, teamId: true } });
        console.log("Sample users:", JSON.stringify(sample));
    }
    await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
