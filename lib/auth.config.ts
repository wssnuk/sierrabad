import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string } | undefined)?.role;
      const isAdminPath = nextUrl.pathname.startsWith("/admin");
      const isManagerPath = nextUrl.pathname.startsWith("/manager");

      if (isAdminPath) {
        return isLoggedIn && role === "ADMIN";
      }
      if (isManagerPath) {
        return isLoggedIn;
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
