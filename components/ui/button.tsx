import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
// Theme colors that would be stored in localStorage
const colorOptions: string[] = [
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
function useThemeColor() {
    const [themeColor, setThemeColor] = React.useState(colorOptions[0])

    React.useEffect(() => {
        localStorage?.setItem('themeColor', themeColor)
    }, [themeColor])

    return { themeColor, setThemeColor }
}

// Generate CSS variables for the theme color
function generateThemeCSS(color: string) {
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
    }
}

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default: 'shadow-xs text-white',
                destructive:
                    'bg-red-500 text-white shadow-xs hover:bg-red-600 focus-visible:ring-red-200 dark:focus-visible:ring-red-400',
                outline:
                    'border border-gray-300 bg-white shadow-xs hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white',
                secondary:
                    'bg-gray-100 text-gray-900 shadow-xs hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
                ghost: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                link: 'underline-offset-4 hover:underline',
                success:
                    'bg-green-500 text-white hover:bg-green-600 border border-green-400/10',
                warning:
                    'bg-yellow-500 text-white hover:bg-yellow-600 border border-yellow-400/10',
                info: 'bg-blue-500 text-white hover:bg-blue-600 border border-blue-400/10',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

function Button({
    className,
    variant,
    size,
    asChild = false,
    style,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }) {
    const Comp = asChild ? Slot : 'button'
    const { themeColor } = useThemeColor()

    // Apply theme color only for default variant
    const themedStyle =
        variant === 'default'
            ? {
                  backgroundColor: themeColor,
                  ...style,
                  ...generateThemeCSS(themeColor),
              }
            : style

    const themedClassName =
        variant === 'default'
            ? cn(
                  buttonVariants({ variant, size }),
                  'hover:opacity-90',
                  className
              )
            : cn(buttonVariants({ variant, size, className }))

    return (
        <Comp
            data-slot="button"
            className={themedClassName}
            style={themedStyle}
            {...props}
        />
    )
}

// Theme Color Picker Component
function ThemeColorPicker() {
    const { themeColor, setThemeColor } = useThemeColor()

    return (
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg">
            <p className="w-full text-sm font-medium mb-2">
                Choose Theme Color:
            </p>
            {colorOptions.map((color) => (
                <button
                    key={color}
                    onClick={() => setThemeColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                        themeColor === color
                            ? 'border-gray-800 scale-110'
                            : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                />
            ))}
        </div>
    )
}

// Demo Component
function ButtonDemo() {
    return (
        <div className="p-8 space-y-6">
            <ThemeColorPicker />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Button Variants</h3>

                <div className="flex flex-wrap gap-3">
                    <Button>Default (Themed)</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="info">Info</Button>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">⚙️</Button>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">
                    For real localStorage usage:
                </h4>
                <pre className="text-xs text-gray-600 overflow-x-auto">
                    {`// In your real app, replace the useThemeColor hook with:
function useThemeColor() {
const [themeColor, setThemeColor] = React.useState(() => {
  return localStorage.getItem('themeColor') || colorOptions[0]
})

React.useEffect(() => {
  localStorage.setItem('themeColor', themeColor)
}, [themeColor])

return { themeColor, setThemeColor }
}`}
                </pre>
            </div>
        </div>
    )
}

export { Button, buttonVariants, useThemeColor, ThemeColorPicker }
export default ButtonDemo
