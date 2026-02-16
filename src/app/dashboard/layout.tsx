import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");
  const teamNumber = (session.user as { teamNumber: string }).teamNumber;

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="sticky top-0 z-10 border-b border-warm-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-2xl font-graffiti text-warm-900 transition-colors group-hover:text-vex-red">
              SPARKS VEX
            </span>
            <div className="hidden sm:block h-4 w-px bg-warm-300 mx-2"></div>
            <span className="hidden sm:block text-sm text-warm-500 italic">
              Team {teamNumber}
            </span>
          </Link>
          <DashboardNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
    </div>
  );
}
