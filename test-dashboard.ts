import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function testDashboard() {
  const teamId = "cmm1oyuvu0000sbsa8bkl3pri";

  console.log("Fetching team...");
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      performanceHistory: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  console.log("Team:", team ? team.teamNumber : null);

  console.log("Fetching calcRating...");
  const calcRating = await prisma.calculatedRating.findUnique({
    where: { uploaderId_subjectTeamId: { uploaderId: teamId, subjectTeamId: teamId } }
  });
  console.log("calcRating:", calcRating ? "Found" : null);

  console.log("Fetching scoutData...");
  const scoutData = await prisma.scoutingData.findUnique({
    where: { scouterId_subjectTeamId: { scouterId: teamId, subjectTeamId: teamId } }
  });
  console.log("scoutData:", scoutData ? "Found" : null);

  console.log("Fetching recentMatches...");
  const recentMatches = await prisma.match.findMany({
    where: {
      OR: [
        { redTeam1Id: teamId }, { redTeam2Id: teamId }, { redTeam3Id: teamId },
        { blueTeam1Id: teamId }, { blueTeam2Id: teamId }, { blueTeam3Id: teamId },
      ],
    },
    orderBy: { date: "desc" },
    take: 10,
    include: {
      redTeam1: { select: { teamNumber: true } },
      redTeam2: { select: { teamNumber: true } },
      redTeam3: { select: { teamNumber: true } },
      blueTeam1: { select: { teamNumber: true } },
      blueTeam2: { select: { teamNumber: true } },
      blueTeam3: { select: { teamNumber: true } },
    },
  });
  console.log("recentMatches:", recentMatches.length);

  console.log("Fetching connections...");
  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ fromTeamId: teamId }, { toTeamId: teamId }],
      status: "accepted",
    },
    include: {
      fromTeam: { select: { id: true, teamNumber: true } },
      toTeam: { select: { id: true, teamNumber: true } },
    },
  });
  console.log("connections:", connections.length);
  
  console.log("Dashboard logic executed successfully.");
}

testDashboard().catch(console.error).finally(() => prisma.$disconnect());
