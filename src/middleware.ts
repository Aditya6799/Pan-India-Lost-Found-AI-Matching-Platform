import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_ROUTES = [
  "/dashboard",
  "/report/lost",
  "/report/found",
  "/profile",
];

const ADMIN_ROUTES = ["/admin"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract path without locale prefix (e.g. /en/dashboard -> /dashboard)
  const pathnameWithoutLocale = pathname.replace(/^\/(en|hi)/, "") || "/";

  // Check auth session cookie (supports both secure and non-secure cookies)
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  if (isProtectedRoute || isAdminRoute) {
    if (!sessionToken) {
      // Find the locale to redirect appropriately
      const localeMatch = pathname.match(/^\/(en|hi)/);
      const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
      const signInUrl = new URL(`/${locale}/auth/sign-in`, request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Delegate response to next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
