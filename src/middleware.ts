import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const { pathname } = req.nextUrl;
  const authPages = ["/login", "/register"];

  const isAuthPage = authPages.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const protectedPaths = [
    "/",
    "/invoices",
    "/clients",
    "/settings",
    "/templates",
    "/api/invoices",
    "/api/clients",
    "/api/settings",
    "/api/pdf",
    "/api/upload",
    "/api/dashboard",
    "/api/feedback",
  ];

  const requiresAuth = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (requiresAuth && !isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const loginUrl = new URL("/login", req.url);
    const callbackPath = `${pathname}${req.nextUrl.search}`;
    loginUrl.searchParams.set("callbackUrl", callbackPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/invoices/:path*",
    "/clients/:path*",
    "/settings/:path*",
    "/templates/:path*",
    "/api/invoices/:path*",
    "/api/clients/:path*",
    "/api/settings/:path*",
    "/api/pdf/:path*",
    "/api/upload/:path*",
    "/api/dashboard/:path*",
    "/api/feedback/:path*",
  ],
};
