import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const team1 = await prisma.team.upsert({
    where: { teamNumber: "12345" },
    update: {},
    create: {
      teamNumber: "12345",
      provinceState: "Ontario",
      country: "Canada",
      drivetrainType: "mecanum",
      autonomousSide: "left",
      autonReliabilityPct: 85,
      notes: "Strong auton, defensive endgame",
      strategyTags: ["defensive", "fast auton"],
    },
  });

  const team2 = await prisma.team.upsert({
    where: { teamNumber: "67890" },
    update: {},
    create: {
      teamNumber: "67890",
      provinceState: "Ontario",
      country: "Canada",
      drivetrainType: "tank",
      autonomousSide: "right",
      autonReliabilityPct: 70,
      strategyTags: ["offensive"],
    },
  });

  const team3 = await prisma.team.upsert({
    where: { teamNumber: "11111" },
    update: {},
    create: {
      teamNumber: "11111",
      provinceState: "Quebec",
      country: "Canada",
      drivetrainType: "mecanum",
      autonomousSide: "skills",
    },
  });

  const password = await hash("password123", 12);
  await prisma.user.upsert({
    where: { email: "team12345@example.com" },
    update: {},
    create: {
      email: "team12345@example.com",
      password,
      teamId: team1.id,
    },
  });

  console.log("Seed complete: teams 12345, 67890, 11111, 22222, 33333, 44444");
  console.log("Demo login: team12345@example.com / password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
