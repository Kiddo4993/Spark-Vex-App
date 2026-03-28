import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { ChatProvider } from "@/components/ChatProvider";
import { GlobalChatPanel } from "@/components/GlobalChatPanel";
import { ChatToggleButton } from "@/components/ChatToggleButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const user = session.user as any;
  const teamNumber = user.teamNumber as string;
  const myTeamId = user.teamId as string;
  const isAdmin = user.isAdmin === true;

  const cookieStore = await cookies();
  const currentViewerId = cookieStore.get("viewer_team_id")?.value;

  // grab connected teams for the chat provider
  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ fromTeamId: myTeamId }, { toTeamId: myTeamId }],
      status: "accepted",
    },
    include: {
      fromTeam: { select: { id: true, teamNumber: true } },
      toTeam: { select: { id: true, teamNumber: true } },
    },
  });
  const connectedTeams = connections.map((c) =>
    c.fromTeamId === myTeamId ? c.toTeam : c.fromTeam
  );

  return (
    <ChatProvider currentTeamId={myTeamId} connectedTeams={connectedTeams}>
      <div className="flex min-h-screen bg-surface-bg">
        <Sidebar teamNumber={teamNumber} isAdmin={isAdmin} />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          {/* Top bar */}
          <div className="h-14 bg-surface-bg/85 backdrop-blur-xl border-b border-line flex items-center px-7 sticky top-0 z-50">
            <div className="text-[13px] text-txt-3 flex items-center gap-1.5">
              <span>Spark VEX</span>
              <span>›</span>
              <strong className="text-txt-1 font-medium">Dashboard</strong>
            </div>
          </div>
          <main className="p-7">{children}</main>
        </div>
        <GlobalChatPanel />
        <ChatToggleButton />
      </div>
    </ChatProvider>
  );
}
