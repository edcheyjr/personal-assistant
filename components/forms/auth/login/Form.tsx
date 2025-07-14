'use client'

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/inputs'
import { loginSchema } from '@/lib/validation/auth'
import { toast } from 'sonner'
import { signIn } from '@/lib/auth'
import { routes } from '@/lib/routes'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader } from 'lucide-react'
import { FormMessages } from '@/components/MessageInfo'

export default function LoginForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            'remember-me': false,
        },
    })
    const {
        formState: { isValid },
    } = form

    function onSubmit(values: z.infer<typeof loginSchema>) {
        console.log('submmitijnf')

        setLoading(true)
        toast.promise(
            signIn('credentials', {
                ...values,
                redirectTo: routes.personalAssistants,
                redirect: false,
            }),
            {
                loading: 'Loading...',
                success: (response) => {
                    if (response?.error) {
                        console.log('Error:', response)
                        throw new Error(
                            'Something went wrong. Check your credentials and try again or contact support if the problem persists.'
                        )
                    }
                    router.push(routes.personalAssistants)
                    return 'Login success, please wait...'
                },
                error: (response) => {
                    return 'Something went wrong. Check your credentials and try again or contact support if the problem persists.'
                },
            }
        )
        setLoading(false)
    }

    function onReset() {
        form.reset()
        form.clearErrors()
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                onReset={onReset}
                className="space-y-8 @container"
            >
                <div className="grid grid-cols-12 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState, formState }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel htmlFor="email">Email</FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <div className="relative w-full">
                                            <Input
                                                key="email-input-0"
                                                placeholder="info@examplecom"
                                                type="email"
                                                id="email-input-0"
                                                className=" "
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>

                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field, fieldState, formState }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                {fieldState.error ? (
                                    <FormMessages
                                        type="error"
                                        className="mb-2"
                                        messages={[fieldState.error.message]}
                                    />
                                ) : (
                                    <FormLabel htmlFor="product_code">
                                        Password
                                    </FormLabel>
                                )}

                                <div className="w-full">
                                    <FormControl>
                                        <div className="relative w-full">
                                            <PasswordInput
                                                key="password-input-0"
                                                placeholder="password"
                                                id="password-input-0"
                                                className=" "
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    {/* <FormDescription></FormDescription> */}
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="remember-me"
                        render={({ field: { value, onChange, ...field } }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="hidden shrink-0">
                                    remember me
                                </FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <FormLabel
                                            key="checkbox-0"
                                            className="border-0 p-0 w-full flex items-start has-[[data-state=checked]]:border-primary"
                                            htmlFor="checkbox-0"
                                        >
                                            <Checkbox
                                                id="checkbox-0"
                                                className="items-center"
                                                {...field}
                                                checked={value}
                                                onCheckedChange={onChange}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <FormLabel>
                                                    remember me
                                                </FormLabel>
                                                <p className="text-sm text-muted-foreground"></p>
                                            </div>
                                        </FormLabel>
                                    </FormControl>

                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                        <FormLabel className="hidden shrink-0">
                            Submit
                        </FormLabel>

                        <div className="w-full">
                            <FormControl>
                                <Button
                                    disabled={!isValid || loading}
                                    key="submit-button-0"
                                    id="submit-button-0"
                                    name=""
                                    className="w-full"
                                    type="submit"
                                    variant="default"
                                >
                                    {loading ? (
                                        <Loader className="size-5" />
                                    ) : (
                                        'Login'
                                    )}{' '}
                                </Button>
                            </FormControl>

                            <FormMessage />
                        </div>
                    </FormItem>
                </div>
            </form>
        </Form>
    )
}
