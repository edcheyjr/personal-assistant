import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/providers/Providers'
import { Toaster } from '@/components/ui/sonner'
import { ColorKey, MAX_TOAST_NOTIFICATION_COUNT } from '@/utils/constants'
import { cookies } from 'next/headers'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'personal assistants',
    description: 'create your very own personal assistant',
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const cookieStore = await cookies()
    const themeColor = cookieStore.get(ColorKey)
    console.log(themeColor?.name, themeColor?.value)
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <div className="relative min-h-screen font-[family-name:var(--font-geist-sans)]">
                    <Providers
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        initialThemeColor={themeColor?.value}
                    >
                        {children}
                        <Toaster
                            expand
                            visibleToasts={MAX_TOAST_NOTIFICATION_COUNT}
                            closeButton
                            richColors
                        />
                    </Providers>
                </div>
            </body>
        </html>
    )
}
