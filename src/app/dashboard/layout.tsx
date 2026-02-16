import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");
  const teamNumber = (session.user as { teamNumber: string }).teamNumber;

  return (
    <div className="flex min-h-screen bg-surface-bg">
      <Sidebar teamNumber={teamNumber} />
      <div className="flex-1 min-w-0 overflow-x-hidden">
        {/* Top bar */}
        <div className="h-14 bg-surface-bg/85 backdrop-blur-xl border-b border-line flex items-center px-7 sticky top-0 z-50">
          <div className="text-[13px] text-txt-3 flex items-center gap-1.5">
            <span>Spark VEX</span>
            <span>›</span>
            <strong className="text-txt-1 font-medium">Dashboard</strong>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-surface-card border border-line rounded-[10px] px-3 py-1.5 w-[220px] text-[13px] text-txt-3 cursor-text hover:border-line-hi transition-colors">
              🔍 <span className="opacity-50 text-[11px]">Search teams, matches…</span>
            </div>
          </div>
        </div>
        <main className="p-7">{children}</main>
      </div>
    </div>
  );
}
