import React from 'react'

// Theme colors that would be stored in localStorage
export const colorOptions: string[] = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#EF4444', // Red
    '#F59E0B', // Yellow
    '#6366F1', // Indigo
    '#6B7280', // Gray
    '#A855F7', // Violet
]

// Hook to get theme color (in real app, this would use localStorage)
export function useThemeColor() {
    const [themeColor, setThemeColor] = React.useState(colorOptions[0])

    React.useEffect(() => {
        // localStorage?.setItem('themeColor', themeColor)
    }, [themeColor])

    return { themeColor, setThemeColor }
}

// Generate CSS variables for the theme color
export function generateThemeCSS(color: string) {
    // Convert hex to RGB for better color manipulation
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    return {
        '--theme-primary': `${r} ${g} ${b}`,
        '--theme-primary-foreground': '255 255 255',
        '--theme-primary-hover': `${Math.max(0, r - 20)} ${Math.max(
            0,
            g - 20
        )} ${Math.max(0, b - 20)}`,
        '--theme-primary-light': `${Math.min(255, r + 40)} ${Math.min(
            255,
            g + 40
        )} ${Math.min(255, b + 40)}`,
        '--theme-primary-alpha': `${r} ${g} ${b}`,
    }
}
