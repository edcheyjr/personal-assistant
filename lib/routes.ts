export const routes = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        resetpassword: '/auth/reset-password',
        error: '/auth/error',
        verify: {
            email: '/auth/verify/email',
        },
    },
    admin: '/admin',
    personalAssistants: '/personal-assistants',
} as const
