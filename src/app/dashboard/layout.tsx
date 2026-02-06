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
  const teamNumber = (session.user as { teamNumber: number }).teamNumber;

  return (
    <div className="min-h-screen bg-vex-darker">
      <header className="sticky top-0 z-10 border-b border-vex-dark bg-vex-darker/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="text-lg font-bold text-white">
            Spark <span className="text-vex-red">VEX</span> · Team {teamNumber}
          </Link>
          <DashboardNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 md:p-6">{children}</main>
    </div>
  );
}
