import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { confidenceFromUncertainty, INITIAL_UNCERTAINTY } from "@/lib/bayesian";
import { TeamProfileCard } from "@/components/TeamProfileCard";
import { TeamProfileForm } from "@/components/TeamProfileForm";
import { SkillsForm } from "@/components/SkillsForm";

export default async function TeamProfilePage({
  params,
}: {
  params: Promise<{ teamNumber: string }>;
}) {
  const { teamNumber } = await params;
  const num = parseInt(teamNumber, 10);
  if (Number.isNaN(num)) notFound();

  const session = await getServerSession(authOptions);
  const myTeamId = session?.user ? (session.user as { teamId: string }).teamId : null;

  const team = await prisma.team.findUnique({
    where: { teamNumber: num },
    include: {
      skillsRecords: { orderBy: { lastUpdated: "desc" }, take: 1 },
      performanceHistory: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!team) notFound();

  const skills = team.skillsRecords[0] ?? null;
  const confidence = confidenceFromUncertainty(team.ratingUncertainty, INITIAL_UNCERTAINTY);
  const isOwn = team.id === myTeamId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/teams" className="text-gray-400 hover:text-white">
          ← Teams
        </Link>
        <h1 className="text-2xl font-bold text-white">Team {team.teamNumber}</h1>
      </div>
      <TeamProfileCard
        team={team}
        skills={skills}
        confidence={confidence}
        isOwn={isOwn}
      />
      {isOwn && (
        <>
          <TeamProfileForm team={team} />
          <SkillsForm initialSkills={skills} />
        </>
      )}
    </div>
  );
}
