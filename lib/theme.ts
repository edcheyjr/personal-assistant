// Theme colors that would be stored in localStorage
export const colorOptions: string[] = [
    '#8B5CF6', // Purple or '#af46fc'
    '#3B82F6', // Blue
    '#10B981', // Green
    '#EF4444', // Red
    '#F59E0B', // Yellow
    '#6366F1', // Indigo
    '#6B7280', // Gray
    '#A855F7', // Violet
]

// Rgb
export const getThemeRGB = (color: string) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16) || 0
    const g = parseInt(hex.substring(2, 4), 16) || 0
    const b = parseInt(hex.substring(4, 6), 16) || 0
    return { r, g, b }
}

// Generate CSS variables for the theme color
export function generateThemeCSS(color: string) {
    // Remove # if present and ensure we have a valid hex string
    const hex = color.replace('#', '').padEnd(6, '0').substring(0, 6)

    // Parse RGB values with fallbacks to prevent NaN
    const r = parseInt(hex.substring(0, 2), 16) || 0
    const g = parseInt(hex.substring(2, 4), 16) || 0
    const b = parseInt(hex.substring(4, 6), 16) || 0

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
