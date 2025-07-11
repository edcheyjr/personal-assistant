import z from 'zod'

export const loginSchema = z.object({
    email: z.string(),
    password: z.string(),
    'remember-me': z.boolean().default(false).optional(),
})
