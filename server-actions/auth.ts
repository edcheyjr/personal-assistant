'use server'

import { loginSchema } from '@/lib/validation/auth'
import { AuthUser } from '@/types/user'
import { redirect } from 'next/navigation'
import z from 'zod'

export async function loginUser(data: z.infer<typeof loginSchema>) {
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

    // For custom auth, redirect to Auth0 login
    try {
        // In your custom auth system, the login is handled by Auth0 redirect
        // This server action now just handles the redirect
        redirect(`https://${process.env.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${process.env.AUTH0_CLIENT_ID}&redirect_uri=${process.env.AUTH0_REDIRECT_URI}&scope=openid profile email&audience=${process.env.AUTH0_AUDIENCE}`)
    } catch (error: any) {
        const errorMessage = 'Failed to initiate login process.'
        return { success: false, message: errorMessage, data: null }
    }
}
