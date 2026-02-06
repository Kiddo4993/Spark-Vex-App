import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      teamId: string;
      teamNumber: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    teamId: string;
    teamNumber: number;
  }
}
