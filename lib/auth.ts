import NextAuth, { CredentialsSignin } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { apiRoutes } from './api.routes'
import { loginSchema } from './validation/auth'
import { routes } from './routes'
import { ErrorDetail } from '@/types/errors'
import { CONTENT_TYPE } from '@/utils/constants'

class InvalidLoginError extends CredentialsSignin {
    code = 'Invalid email or password'
}
class NotfoundError extends CredentialsSignin {
    code = 'User not found'
}
class UnauthorizedError extends CredentialsSignin {
    code = 'Unauthorized Access'
}
class UnknownError extends CredentialsSignin {
    code = 'Unknown Error'
}
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: '' },
                password: {
                    label: 'Password',
                    type: 'password',
                    placeholder: '',
                },
            },
            async authorize(credentials: any, req) {
                const validatedUserCredentials = loginSchema.safeParse({
                    email: credentials?.email,
                    password: credentials?.password,
                })
                if (!validatedUserCredentials.success) {
                    return null
                }
                const credentialDetails = {
                    username: validatedUserCredentials.data.email,
                    password: validatedUserCredentials.data.password,
                }
                console.log('credentialDetails', credentialDetails)
                try {
                    const response = await fetch(apiRoutes.login, {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': CONTENT_TYPE[0],
                        },
                        method: 'POST',
                        body: JSON.stringify(credentialDetails),
                    })

                    if (response.status == 400) {
                        throw new Error('bad request', {
                            cause: response.status,
                        })
                    } else if (response.status == 401) {
                        throw new UnauthorizedError()
                    } else if (response.status == 403) {
                        throw new InvalidLoginError()
                    } else if (response.status == 404) {
                        throw new NotfoundError()
                    } else if (!response.ok) {
                        const responseData =
                            (await response.json()) as ErrorDetail[]
                        console.error('Error Details', responseData)
                        throw new UnknownError(response.statusText)
                    }

                    const user = await response.json()

                    if (user) {
                        return { email: credentialDetails.username, ...user }
                    } else {
                        throw new Error('user not found')
                    }
                } catch (error: any) {
                    console.log('error', error)
                    // throw new Error(
                    //     `${
                    //         error.message && error.message != 'fetch failed'
                    //             ? error.message
                    //             : 'failed to connect check your network please.'
                    //     } `,
                    //     {
                    //         cause: error,
                    //     }
                    // )
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            return { ...token, ...user }
        },
        async session({ session, token, user }) {
            session.user = token as any
            return session
        },
    },
    session: {
        strategy: 'jwt',
        // this should be same as the token expiration time in the backend
        maxAge: 7200, // 120 min as backend
    },
    // trustHost: true, enable on https
    debug: process.env.APP_ENV === 'development',
    pages: {
        signIn: routes.auth.login,
        error: routes.auth.error,
        signOut: routes.auth.login,
        // newUser: '/register',
    },
})
