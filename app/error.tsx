'use client'
import React from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {}

const ErrorPage = (props: Props) => {
    const handleRefresh = () => {
        window.location.reload()
    }

    const handleGoHome = () => {
        window.location.href = '/'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-3 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Oops! Something went wrong
                </h1>

                <p className="text-gray-600 mb-6">
                    We're sorry, but something unexpected happened. Don't worry,
                    it's not your fault.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={handleRefresh}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>

                    <Button
                        onClick={handleGoHome}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Button>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                    <p>Error Code: 500</p>
                    <p className="mt-1">
                        If this problem persists, please contact support.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage
