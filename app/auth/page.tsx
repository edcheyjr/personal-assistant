import LoginForm from '@/components/forms/auth/login'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeMenu } from '@/components/ThemeMenu'
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams'

type Props = {}

const Login = (props: Props) => {
    return (
        <BackgroundBeamsWithCollision>
            <div className="min-h-screen size-full mx-auto">
                <div className="w-full flex justify-end p-6">
                    <ThemeMenu />
                </div>
                <div className="py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center h-[80vh]">
                    <div className="max-w-md w-full space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-center">
                                    Login
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 ">
                                <LoginForm />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </BackgroundBeamsWithCollision>
    )
}

export default Login
