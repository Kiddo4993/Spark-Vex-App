import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/auth/signin" },
});

export const config = {
  matcher: [
    "/dashboard/import/:path*",
    "/dashboard/connections/:path*",
    "/api/import/:path*",
    "/api/connections/:path*",
    "/api/notes/:path*",
  ],
};
