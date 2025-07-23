import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { routes } from '@/lib/routes'

export default auth((req) => {
    console.log('Middleware executing for:', req.nextUrl.pathname)

    const { pathname } = req.nextUrl
    console.log('req.auth', req.auth?.user)

    // Define public routes that don't require authentication
    const publicRoutes = [
        routes.auth.login,
        routes.auth.register, // if you have this
        routes.auth.verify?.email, // if you have this
        '/auth', // catch-all for auth routes
    ].filter(Boolean) // Remove any undefined routes

    // Check if current path is a public route
    const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
    )

    if (req.auth && req.auth.user) {
        // User is authenticated

        // Admin route protection (uncomment if needed)
        // if (pathname.startsWith(routes.admin) && !req.auth.user.is_admin) {
        //     const url = new URL(routes.auth.login, req.nextUrl.origin)
        //     return NextResponse.redirect(url)
        // }

        // Email verification check (uncomment if needed)
        // if (!req.auth.user.is_verified && !pathname.startsWith(routes.auth.verify.email)) {
        //     const url = new URL(routes.auth.verify.email, req.nextUrl.origin)
        //     return NextResponse.redirect(url)
        // }

        // If user is authenticated and trying to access login page, redirect to dashboard/home
        if (pathname.startsWith(routes.auth.login)) {
            const url = new URL('/personal-assistants', req.nextUrl.origin) // or routes.dashboard
            return NextResponse.redirect(url)
        }

        return NextResponse.next()
    } else {
        // User is not authenticated

        // Allow access to public routes
        if (isPublicRoute) {
            return NextResponse.next()
        }

        // Redirect to login for protected routes
        const url = new URL(routes.auth.login, req.nextUrl.origin)
        // Preserve the original URL as a redirect parameter
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
    }
})

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|auth|.*embed.*).*)',
    ],
}
