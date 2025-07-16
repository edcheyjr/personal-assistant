'use server'

import { signIn } from '@/lib/auth'
import { loginSchema } from '@/lib/validation/auth'
import { AuthUser } from '@/types/user'
import { AuthError } from 'next-auth'
import z from 'zod'

export async function loginUser(data: z.infer<typeof loginSchema>) {
    const apiResponse: Response | null = null
    const userDTO: AuthUser | null = null

    //  Validate user credentials
    const validationInfo = loginSchema.safeParse(data)
    if (!validationInfo.success) {
        return {
            success: false,
            message: validationInfo.error.message,
            data: null,
            errors: validationInfo.error.flatten().fieldErrors,
        }
    }
    const validatedData = validationInfo.data

    // Sign in the user and redirect to the dashboard
    try {
        await signIn('credentials', validatedData)
    } catch (error: any) {
        let errorMessage: string =
            'Failed to login. Please check if your credentials are valid or try again later.'
        if (error instanceof AuthError) {
            console.log('error', error)
            switch (error.name) {
                case 'CredentialsSignin':
                    errorMessage = 'Invalid Credentials'
                    break
                default:
                    errorMessage = 'Something went wrong'
            }
        }
        return { success: false, message: errorMessage, data: null }
    }
    return {
        success: true,
        message: 'You have been logged in successfully',
        data: { urlToRedirect: '/' },
    }
}
