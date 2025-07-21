import { colorOptions, generateThemeCSS } from '@/lib/theme'
import { ColorKey } from '@/utils/constants'
import Cookies from 'js-cookie'
import React from 'react'

interface ThemeContextType {
    themeColor: string
    themeColorCss: {
        '--theme-primary': string
        '--theme-primary-foreground': string
        '--theme-primary-hover': string
        '--theme-primary-light': string
        '--theme-primary-alpha': string
    }
    setThemeColor: (color: string) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
    undefined
)

interface ThemeProviderProps {
    children: React.ReactNode
    initialThemeColor?: string // Server-sent cookie value
}

export function ColorThemeProvider({
    children,
    initialThemeColor,
}: ThemeProviderProps) {
    // Use the server-sent cookie as initial value if available,
    // otherwise fall back to client-side cookie or default
    const [themeColor, setThemeColor] = React.useState(
        () => initialThemeColor || Cookies.get(ColorKey) || colorOptions[0]
    )

    // Sync with client-side cookie if it changes elsewhere
    React.useEffect(() => {
        const color = Cookies.get(ColorKey)
        if (color && color !== themeColor) {
            setThemeColor(color)
        }
    }, [])

    const setThemeColorAndPersist = (color: string) => {
        setThemeColor(color)
        Cookies.set(ColorKey, color, {
            expires: 365,
            sameSite: 'Lax', // Recommended for SSR
            path: '/', // Make available across entire site
        })
    }

    const value = {
        themeColor,
        setThemeColor: setThemeColorAndPersist,
        themeColorCss: generateThemeCSS(themeColor),
    }

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    )
}

export function useThemeColor() {
    const context = React.useContext(ThemeContext)

    if (context === undefined) {
        throw new Error(
            'useThemeColor must be used within a ColorThemeProvider'
        )
    }

    return context
}
