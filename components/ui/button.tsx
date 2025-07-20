import * as React from 'react'
import { Slot as SlotPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/cn'
import { generateThemeCSS, useThemeColor } from '@/lib/theme'

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
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
                'icon-sm': 'size-6',
                'no-padding': 'p-0',
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
    variant = 'default',
    size,
    asChild = false,
    style,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }) {
    const Comp = asChild ? SlotPrimitive.Slot : 'button'
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

export { Button, buttonVariants }
