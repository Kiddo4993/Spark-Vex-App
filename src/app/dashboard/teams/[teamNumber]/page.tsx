import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TeamProfileCard } from "@/components/TeamProfileCard";
import { TeamProfileForm } from "@/components/TeamProfileForm";
import { ScoutingForm } from "@/components/ScoutingForm";

import { cookies } from "next/headers";

export default async function TeamProfilePage({
  params,
}: {
  params: Promise<{ teamNumber: string }>;
}) {
  const { teamNumber } = await params;

  const session = await getServerSession(authOptions);
  const myTeamId = session?.user ? (session.user as { teamId: string }).teamId : null;

  const cookieStore = await cookies();
  const viewerId = cookieStore.get("viewer_team_id")?.value || myTeamId;

  const team = await prisma.team.findFirst({
    where: {
      teamNumber: {
        equals: teamNumber,
        mode: "insensitive"
      }
    },
    include: {
      performanceHistory: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!team) notFound();

  // Load the current viewer's public perspective of this team's performance
  const calcRating = viewerId ? await prisma.calculatedRating.findUnique({
    where: { uploaderId_subjectTeamId: { uploaderId: viewerId, subjectTeamId: team.id } }
  }) : null;

  // Load the current user's *private* scouting records for this team
  const scoutData = myTeamId ? await prisma.scoutingData.findUnique({
    where: { scouterId_subjectTeamId: { scouterId: myTeamId, subjectTeamId: team.id } }
  }) : null;

  // Load the current user's full team to compare Auton sides
  const myTeamData = myTeamId && myTeamId !== team.id ? await prisma.team.findUnique({
    where: { id: myTeamId },
    select: { autonomousSide: true }
  }) : null;

  const combinedTeam = {
    ...team,
    performanceRating: calcRating?.performanceRating ?? null,
    ratingUncertainty: calcRating?.ratingUncertainty ?? null,
    matchCount: calcRating?.matchCount ?? 0,
  };

  const isOwn = team.id === myTeamId;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/teams" className="text-txt-3 hover:text-txt-1 transition-colors text-sm">
          ← Teams
        </Link>
      </div>
      <TeamProfileCard
        team={combinedTeam}
        autoStrength={scoutData?.autoStrength ?? null}
        driverStrength={scoutData?.driverStrength ?? null}
        myTeamAutonSide={myTeamData?.autonomousSide ?? null}
      />

      {myTeamId && (
        <ScoutingForm
          teamNumber={team.teamNumber}
          initialAuto={scoutData?.autoStrength ?? null}
          initialDriver={scoutData?.driverStrength ?? null}
          initialNotes={scoutData?.notes ?? null}
        />
      )}

      {isOwn && (
        <TeamProfileForm team={combinedTeam} />
      )}
    </div>
  );
}
