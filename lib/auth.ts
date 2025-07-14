import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { apiRoutes } from './api.routes'
import { loginSchema } from './validation/auth'
import { AuthUser } from '@/types/user'

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
                console.log('credentials', credentials)
                const validatedUserCredentials = loginSchema.safeParse({
                    email: credentials?.email,
                    password: credentials?.password,
                })
                if (!validatedUserCredentials.success) {
                    return null
                }
                const credentialDetails = {
                    email: validatedUserCredentials.data.email,
                    password: validatedUserCredentials.data.password,
                }

                try {
                    console.log('apiRoute.login', apiRoutes.login)
                    const response = await fetch(apiRoutes.login, {
                        method: 'POST',
                        body: JSON.stringify(credentialDetails),
                    })

                    if (response.status == 400) {
                        throw new Error('bad request', {
                            cause: response.status,
                        })
                    } else if (response.status == 401) {
                        throw new Error('unauthorized request', {
                            cause: response.status,
                        })
                    } else if (response.status == 403) {
                        throw new Error(
                            'forbidden, wrong password or email, please try again.',
                            {
                                cause: response.status,
                            }
                        )
                    } else if (response.status == 404) {
                        throw new Error('not found', {
                            cause: response.status,
                        })
                    } else if (!response.ok) {
                        throw new Error('server error', {
                            cause: response.status,
                        })
                    } else {
                    }

                    const user = await response.json()

                    if (user) {
                        return user
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
    trustHost: true,
    //   necessary in production
    debug: process.env.APP_ENV === 'development',
    pages: {
        signIn: '/login',
        signOut: '/login',
        newUser: '/register',
    },
})
