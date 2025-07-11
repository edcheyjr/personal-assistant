import LoginForm from '@/components/forms/auth/login'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {}

const Login = (props: Props) => {
    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">
                            Login
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <LoginForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Login
