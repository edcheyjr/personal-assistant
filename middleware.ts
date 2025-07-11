import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

import { routes } from '@/lib/routes'

export default auth((req) => {
    const { pathname } = req.nextUrl
    if (req.auth && req.auth.user) {
        // if (pathname.startsWith(routes.admin) && !req.auth.user.is_admin) {
        //     // Redirect to login page if user is not an admin and tries to access /admin
        //     const url = new URL(routes.auth.login, req.nextUrl.origin)
        //     return NextResponse.redirect(url)
        // }

        // Uncomment the following lines if you want to handle email verification
        // if (!req.auth.user.is_verified) {
        //   // Redirect to email verification page if user is not verified
        //   const url = new URL(routes.auth.verify.email, req.nextUrl.origin)
        //   return NextResponse.redirect(url)
        // }
        return NextResponse.next()
    } else {
        const url = new URL(routes.auth.login, req.nextUrl.origin)
        return NextResponse.redirect(url)
    }
})

export const config = {
    // FIXME: embed regex improve to check all case where the path include the word embed
    matcher: [
        '/^$((?!api|_next/static|_next/image|favicon.ico|auth|.*embed.*).*)', //this are path which don't require authentication
    ],
}
