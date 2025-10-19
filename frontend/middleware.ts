import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

const protectedPaths = [
  "/dashboard",
  "/learn",
  "/instructor",
  "/profile",
  "/settings",
];
const instructorPaths = ["/instructor"];
const authPaths = ["/auth/signin", "/auth/signup"];

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: "as-needed",
});

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // remove locale from path
  const pathnameWithoutLocale = locales.reduce(
    (path, locale) => path.replace(`/${locale}`, ""),
    pathname
  );

  // ✅ check if token exists in cookies
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = !!token; // true if token exists
  // لو عايز تعمل decode للـ JWT وتجيب role
  // ممكن هنا تضيف jwt.decode(token) وتشوف الـ role
  const isInstructor = false;

  const isProtectedPath = protectedPaths.some((path) =>
    pathnameWithoutLocale.startsWith(path)
  );
  const isInstructorPath = instructorPaths.some((path) =>
    pathnameWithoutLocale.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) =>
    pathnameWithoutLocale.startsWith(path)
  );

  // // 🔒 redirect if trying to access protected route without token
  // if (isProtectedPath && !isAuthenticated) {
  //   const locale = request.nextUrl.locale || defaultLocale;
  //   return NextResponse.redirect(
  //     new URL(`/${locale}/auth/signin?callbackUrl=${pathname}`, request.url)
  //   );
  // }

  // 👨‍🏫 instructor-only route
  // if (isInstructorPath && !isInstructor) {
  //   const locale = request.nextUrl.locale || defaultLocale;
  //   return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  // }

  // 🚫 if logged in, block access to /auth
  // if (isAuthPath && isAuthenticated) {
  //   const locale = request.nextUrl.locale || defaultLocale;
  //   const callbackUrl = searchParams.get("callbackUrl");
  //   return NextResponse.redirect(
  //     new URL(callbackUrl || `/${locale}/dashboard`, request.url)
  //   );
  // }

  // 🌍 apply intl
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(ar|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
