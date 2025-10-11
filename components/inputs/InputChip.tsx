import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useThemeColor } from '@/providers/color-theme-provider'

interface Props<T> {
    value: T
    className?: string
    handleRemoveItem: (e?: React.MouseEvent) => void
}

function InputChip<T extends React.ReactNode>({
    value,
    className,
    handleRemoveItem,
}: Props<T>) {
    const { themeColor } = useThemeColor()

    return (
        <div
            className={cn(
                `flex h-8 w-fit items-center space-x-1.5 truncate text-nowrap rounded-md py-0.5  pl-2.5 pr-1.5 text-center text-xs font-medium lg:text-sm`,
                className
            )}
            style={{
                backgroundColor: `${themeColor}20`,
                color: themeColor,
            }}
        >
            <p>{value}</p>
            <button
                className="rounded p-1 transition duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleRemoveItem}
            >
                <X className="size-4" />
            </button>
        </div>
    )
}

export default InputChip
