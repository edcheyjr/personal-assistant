'use client'

import { SessionProvider } from 'next-auth/react'
import {
    ThemeProvider as NextThemesProvider,
    ThemeProviderProps,
} from 'next-themes'
import { ThemeProvider } from './theme-provider'
import QueryProvider from './query-provider'
import { Session } from 'next-auth'
import { AgentProvider } from './agents-provider'

type ProviderType = {
    session?: Session
    children: React.ReactNode
}

/**
 * Add all provider in this one function and pass it on children in layout
 * @param {React.ReactNode} children child elements
 * @returns
 */
export default function Providers({
    children,
    session,
    ...props
}: ProviderType & ThemeProviderProps) {
    return (
        <SessionProvider session={session}>
            <QueryProvider>
                <ThemeProvider {...props}>
                    <AgentProvider>{children}</AgentProvider>
                </ThemeProvider>
            </QueryProvider>
        </SessionProvider>
    )
}
