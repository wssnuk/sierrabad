import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/manager") ||
        nextUrl.pathname.startsWith("/admin");

      if (isProtected) {
        return isLoggedIn;
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
