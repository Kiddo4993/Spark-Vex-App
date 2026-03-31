import { withAuth } from "next-auth/middleware";

/**
 * Route Middleware
 * Secures protected routes by checking for a valid NextAuth session.
 * Unauthenticated users are automatically redirected to signIn.
 */
export default withAuth({
  pages: { signIn: "/auth/signin" },
});

// Protect all API and dashboard routes except auth flow
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/import/:path*",
    "/api/admin/:path*",
    "/api/connections/:path*",
    "/api/notes/:path*",
  ],
};
