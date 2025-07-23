import { colorOptions } from '@/lib/theme'
import { Button } from './button'
import React from 'react'
import { ThemedTextarea as Textarea } from './textarea'
import { useThemeColor } from '@/providers/color-theme-provider'

// Theme Color Picker Component
function ThemeColorPicker() {
    const { themeColor, setThemeColor } = useThemeColor()

    return (
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg border-gray-300 dark:border-gray-600">
            <p className="w-full text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                Choose Theme Color:
            </p>
            {colorOptions.map((color) => (
                <button
                    key={color}
                    onClick={() => setThemeColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                        themeColor === color
                            ? 'border-gray-800 dark:border-gray-200 scale-110'
                            : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                />
            ))}
        </div>
    )
}

// Demo Component
export default function ComponentDemo() {
    const [textareaValue, setTextareaValue] = React.useState(
        'Try typing in this textarea to see the theme colors in action!'
    )

    return (
        <div className="p-8 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
            <ThemeColorPicker />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Button Variants</h3>

                <div className="flex flex-wrap gap-3">
                    <Button variant={'default'}>Default (Themed)</Button>
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

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Themed Textarea
                </h3>

                <div className="space-y-3">
                    <Textarea
                        placeholder="This textarea uses the theme color on focus..."
                        value={textareaValue}
                        onChange={(e) => setTextareaValue(e.target.value)}
                        className="resize-none"
                        rows={3}
                    />

                    <Textarea placeholder="Another textarea example" rows={2} />

                    <Textarea
                        placeholder="Disabled textarea"
                        disabled
                        rows={2}
                    />
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Toggle Dark Mode:
                </h4>
                <Button
                    variant="outline"
                    onClick={() =>
                        document.documentElement.classList.toggle('dark')
                    }
                    className="mb-3"
                >
                    Toggle Dark/Light Mode
                </Button>

                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                    For real localStorage usage:
                </h4>
                <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
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
