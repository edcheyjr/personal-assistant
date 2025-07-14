'use client'
import React from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Props = {}

const ErrorPage = (props: Props) => {
    const handleRefresh = () => {
        window.location.reload()
    }

    const handleGoHome = () => {
        window.location.href = '/'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 dark:bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        Oops! Something went wrong
                    </h1>

                    <p className="text-muted-foreground mb-6">
                        We're sorry, but something unexpected happened. Don't
                        worry, it's not your fault.
                    </p>

                    <div className="space-y-3">
                        <Button
                            variant={'default'}
                            onClick={handleRefresh}
                            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="size-4" />
                            Try Again
                        </Button>

                        <Button
                            onClick={handleGoHome}
                            variant="secondary"
                            className="w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <Home className="size-4" />
                            Go Home
                        </Button>
                    </div>

                    <div className="mt-8 text-sm text-muted-foreground">
                        <p>Error Code: 500</p>
                        <p className="mt-1">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ErrorPage
