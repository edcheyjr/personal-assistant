import { NextRequest, NextResponse } from "next/server";
import { routes } from "@/lib/routes";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // if (process.env.NODE_ENV === "development") {
  //   return NextResponse.next();
  // }

  // Get user from cookies
  const userCookie = req.cookies.get("user");
  const accessToken = req.cookies.get("access_token");

  let user = null;
  try {
    user = userCookie ? JSON.parse(userCookie.value) : null;
  } catch {
    // If JSON parsing fails, user remains null
    console.log("failed to parse the user data");
  }

  console.log("User from cookie:", user);
  console.log("Has access token:", !!accessToken);

  // Define public routes that don't require authentication
  const publicRoutes = [
    routes.auth.login,
    routes.auth.register, // if you have this
    routes.auth.verify?.email, // if you have this
    "/auth", // catch-all for auth routes
  ].filter(Boolean); // Remove any undefined routes

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if user is authenticated (has both user data and access token)
  const isAuthenticated = user && accessToken;

  if (isAuthenticated) {
    // If user is authenticated and trying to access login page, redirect to dashboard/home
    if (pathname.startsWith(routes.auth.login)) {
      const url = new URL("/", req.nextUrl.origin); // or routes.dashboard
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } else {
    // User is not authenticated

    // Allow access to public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Redirect to login for protected routes
    const url = new URL(routes.auth.login, req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*embed.*).*)",
  ],
};
