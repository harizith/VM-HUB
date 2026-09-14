import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Check if the user is authenticated
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/student/:path*",
    "/admin/:path*"
  ],
};
