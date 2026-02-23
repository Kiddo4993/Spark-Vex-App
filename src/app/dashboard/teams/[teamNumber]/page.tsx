import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TeamProfileCard } from "@/components/TeamProfileCard";
import { TeamProfileForm } from "@/components/TeamProfileForm";
import { SkillsForm } from "@/components/SkillsForm";
import { TeamAwards } from "@/components/TeamAwards";

export default async function TeamProfilePage({
  params,
}: {
  params: Promise<{ teamNumber: string }>;
}) {
  const { teamNumber } = await params;

  const session = await getServerSession(authOptions);
  const myTeamId = session?.user ? (session.user as { teamId: string }).teamId : null;

  const team = await prisma.team.findFirst({
    where: {
      teamNumber: {
        equals: teamNumber,
        mode: "insensitive"
      }
    },
    include: {
      skillsRecords: { orderBy: { lastUpdated: "desc" }, take: 1 },
      performanceHistory: { orderBy: { createdAt: "desc" }, take: 20 },
      awards: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!team) notFound();

  const skills = team.skillsRecords[0] ?? null;
  const isOwn = team.id === myTeamId;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/teams" className="text-txt-3 hover:text-txt-1 transition-colors text-sm">
          ← Teams
        </Link>
      </div>
      <TeamProfileCard team={team} />
      <TeamAwards teamNumber={team.teamNumber} awards={team.awards} />
      {isOwn && (
        <>
          <TeamProfileForm team={team} />
          <SkillsForm initialSkills={skills} />
        </>
      )}
    </div>
  );
}
