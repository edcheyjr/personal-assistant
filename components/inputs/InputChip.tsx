import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

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
    return (
        <div
            className={cn(
                `flex h-8 w-fit items-center space-x-1.5 truncate text-nowrap rounded-md bg-gray-950/10 py-0.5  pl-2.5 pr-1.5 text-center text-xs font-semibold text-emerald-700 dark:bg-gray-50/10 dark:text-emerald-300 lg:text-sm`,
                className
            )}
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
