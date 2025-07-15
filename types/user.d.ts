import { DefaultSession, User } from 'next-auth'
import { JWT } from 'next-auth/jwt'
declare module 'next-auth' {
    interface Session {
        user: DefaultSession['user'] & IAuthenticatedUser
    }
}

declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT {
        user: AuthUser
    }
}

export interface AuthUser {
    access_token: string
    token_type: string
    token_type: 'bearer'
    id: string
    iat: number
    exp: number
    jti: string
}
