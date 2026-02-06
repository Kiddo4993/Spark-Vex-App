import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          Spark <span className="text-vex-red">VEX</span>
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          ELO ratings, skills rankings & team collaboration for VEX robotics
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {session ? (
          <Link href="/dashboard" className="btn-primary">
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/auth/signin" className="btn-primary">
              Sign in
            </Link>
            <Link href="/auth/signup" className="btn-secondary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
