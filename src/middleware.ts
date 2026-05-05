import { NextResponse, type NextRequest } from "next/server";

/**
 * Gates every /admin route behind ADMIN_TOKEN.
 *
 * Auth flow is intentionally simple, this is an internal dashboard, not a
 * public app:
 *   1. First time, visit /admin/searches?token=YOUR_TOKEN
 *   2. If the token matches env, middleware sets a cookie and strips the
 *      token from the URL
 *   3. Cookie is httpOnly + sameSite=lax + secure in prod, valid for 7 days
 *   4. Without a valid cookie, /admin/* responds 404 to hide its existence
 *
 * If you need real auth later (multiple admins, audit log, MFA), swap this
 * out for NextAuth or Clerk. For now this is enough.
 */
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    // Misconfigured env: treat as no-access. Better than open admin.
    return new NextResponse(null, { status: 404 });
  }

  const cookieToken = req.cookies.get("admin_token")?.value;
  if (cookieToken === expected) {
    return NextResponse.next();
  }

  const queryToken = searchParams.get("token");
  if (queryToken && queryToken === expected) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("token");
    const res = NextResponse.redirect(url);
    res.cookies.set("admin_token", queryToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  // No valid auth. 404 hides the route from casual scanners.
  return new NextResponse(null, { status: 404 });
}

export const config = {
  matcher: "/admin/:path*",
};
