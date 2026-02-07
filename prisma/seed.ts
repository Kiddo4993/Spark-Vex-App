import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const team1 = await prisma.team.upsert({
    where: { teamNumber: 12345 },
    update: {},
    create: {
      teamNumber: 12345,
      provinceState: "Ontario",
      country: "Canada",
      drivetrainType: "mecanum",
      autonomousSide: "left",
      autonReliabilityPct: 85,
      notes: "Strong auton, defensive endgame",
      strategyTags: ["defensive", "fast auton"],
      performanceRating: 100,
      ratingUncertainty: 50,
      matchCount: 0,
    },
  });

  const team2 = await prisma.team.upsert({
    where: { teamNumber: 67890 },
    update: {},
    create: {
      teamNumber: 67890,
      provinceState: "Ontario",
      country: "Canada",
      drivetrainType: "tank",
      autonomousSide: "right",
      autonReliabilityPct: 70,
      strategyTags: ["offensive"],
      performanceRating: 120,
      ratingUncertainty: 40,
      matchCount: 5,
    },
  });

  const team3 = await prisma.team.upsert({
    where: { teamNumber: 11111 },
    update: {},
    create: {
      teamNumber: 11111,
      provinceState: "Quebec",
      country: "Canada",
      drivetrainType: "mecanum",
      autonomousSide: "skills",
      performanceRating: 80,
      ratingUncertainty: 60,
      matchCount: 2,
    },
  });

  const team4 = await prisma.team.upsert({
    where: { teamNumber: 22222 },
    update: {},
    create: {
      teamNumber: 22222,
      provinceState: "Ontario",
      country: "Canada",
      performanceRating: 100,
      ratingUncertainty: 50,
      matchCount: 0,
    },
  });

  const team5 = await prisma.team.upsert({
    where: { teamNumber: 33333 },
    update: {},
    create: {
      teamNumber: 33333,
      provinceState: "Ontario",
      country: "Canada",
      performanceRating: 100,
      ratingUncertainty: 50,
      matchCount: 0,
    },
  });

  const team6 = await prisma.team.upsert({
    where: { teamNumber: 44444 },
    update: {},
    create: {
      teamNumber: 44444,
      provinceState: "Quebec",
      country: "Canada",
      performanceRating: 100,
      ratingUncertainty: 50,
      matchCount: 0,
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

  const s1 = await prisma.skillsRecord.findFirst({ where: { teamId: team1.id } });
  if (!s1) {
    await prisma.skillsRecord.create({
      data: {
        teamId: team1.id,
        driverSkillsScore: 120,
        autonomousSkillsScore: 80,
        combinedSkillsScore: 200,
        provincialSkillsRank: 1,
        worldwideSkillsRank: 1,
      },
    });
  }

  const s2 = await prisma.skillsRecord.findFirst({ where: { teamId: team2.id } });
  if (!s2) {
    await prisma.skillsRecord.create({
      data: {
        teamId: team2.id,
        driverSkillsScore: 100,
        autonomousSkillsScore: 60,
        combinedSkillsScore: 160,
        provincialSkillsRank: 2,
        worldwideSkillsRank: 2,
      },
    });
  }

  const s3 = await prisma.skillsRecord.findFirst({ where: { teamId: team3.id } });
  if (!s3) {
    await prisma.skillsRecord.create({
      data: {
        teamId: team3.id,
        driverSkillsScore: 90,
        autonomousSkillsScore: 70,
        combinedSkillsScore: 160,
        provincialSkillsRank: 1,
        worldwideSkillsRank: 3,
      },
    });
  }

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
