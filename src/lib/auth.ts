import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/signin", newUser: "/auth/signup" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { team: true },
        });
        if (!user || !(await compare(credentials.password, user.password))) return null;
        return {
          id: user.id,
          email: user.email,
          teamId: user.teamId,
          teamNumber: user.team.teamNumber,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.teamId = (user as { teamId: string }).teamId;
        token.teamNumber = (user as { teamNumber: number }).teamNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { teamId: string }).teamId = token.teamId as string;
        (session.user as { teamNumber: number }).teamNumber = token.teamNumber as number;
      }
      return session;
    },
  },
};
