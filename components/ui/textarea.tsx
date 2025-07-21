import * as React from 'react'

import { cn } from '@/utils/cn'
import { generateThemeCSS } from '@/lib/theme'
import { useThemeColor } from '@/providers/color-theme-provider'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className
            )}
            {...props}
        />
    )
}

// Themed Textarea Component
function ThemedTextarea({
    className,
    style,
    ...props
}: React.ComponentProps<'textarea'>) {
    const { themeColor } = useThemeColor()

    const themedStyle = {
        ...style,
        ...generateThemeCSS(themeColor),
    }

    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                // Focus styles using theme color
                'focus-visible:ring-[3px] focus-visible:ring-opacity-20',
                // Invalid states
                'aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-400/40 aria-invalid:border-red-500',
                className
            )}
            style={
                {
                    ...themedStyle,
                    '--tw-ring-color': `rgb(var(--theme-primary-alpha) / 0.2)`,
                    '--tw-border-opacity': '1',
                } as React.CSSProperties
            }
            onFocus={(e) => {
                e.currentTarget.style.borderColor = themeColor
                props.onFocus?.(e)
            }}
            onBlur={(e) => {
                e.currentTarget.style.borderColor = ''
                props.onBlur?.(e)
            }}
            {...props}
        />
    )
}

export { Textarea, ThemedTextarea }
