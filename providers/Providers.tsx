'use client'

import {
    ThemeProvider as NextThemesProvider,
    ThemeProviderProps,
} from 'next-themes'
import { ThemeProvider } from './theme-provider'

type ProviderType = {
    children: React.ReactNode
}

/**
 * Add all provider in this one function and pass it on children in layout
 * @param {React.ReactNode} children child elements
 * @returns
 */
export default function Providers({
    children,
    ...props
}: ProviderType & ThemeProviderProps) {
    return <ThemeProvider {...props}>{children}</ThemeProvider>
}
