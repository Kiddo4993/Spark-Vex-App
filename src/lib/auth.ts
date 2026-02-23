import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/signin" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Team Number or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;

        const login = credentials.login.trim();

        // Try to find user by email first (for admin accounts)
        let user = await prisma.user.findFirst({
          where: { email: login },
          include: { team: true },
        });

        // If not found by email, try to find by team number
        if (!user) {
          const team = await prisma.team.findUnique({
            where: { teamNumber: login.toUpperCase() },
            include: { user: true },
          });
          if (team?.user) {
            user = { ...team.user, team } as any;
          }
        }

        if (!user || !(await compare(credentials.password, user.password))) return null;

        return {
          id: user.id,
          email: user.email || undefined,
          teamId: user.teamId,
          teamNumber: user.team.teamNumber,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.teamId = (user as any).teamId;
        token.teamNumber = (user as any).teamNumber;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.teamId = token.teamId;
        (session.user as any).teamNumber = token.teamNumber as string;
        (session.user as any).isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
};
