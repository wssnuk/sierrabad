export { auth as middleware } from "@/lib/auth.edge";

export const config = {
  matcher: ["/manager/:path*", "/admin/:path*"],
};
