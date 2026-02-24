import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");
  const teamNumber = (session.user as { teamNumber: string }).teamNumber;
  const isAdmin = (session.user as any).isAdmin === true;

  // Auto-redirect admin to admin panel if they land on dashboard root
  if (isAdmin && !teamNumber.includes("/")) {
    // Actually, dashboard layout is a wrapper. We should check the current path if possible, 
    // but getServerSession doesn't have the path.
    // Better to do this in the dashboard/page.tsx or middleware for the root route.
  }

  return (
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
          <div className="ml-auto flex items-center gap-2.5">
            <DashboardNav />
          </div>
        </div>
        <main className="p-7">{children}</main>
      </div>
    </div>
  );
}
