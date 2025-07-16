import { cn } from '@/utils/cn'
import React from 'react'

type Props = {
    size?: 'size-2' | 'size-1'
    themeColor?: string
}

const MessageLoading = ({ size = 'size-1', themeColor }: Props) => {
    //TODO: themeColor
    return (
        <div className="flex gap-1">
            <div
                className={cn(size, 'bg-purple-600 rounded-full animate-pulse')}
            ></div>
            <div
                className={cn(
                    size,
                    ' bg-purple-600 rounded-full animate-pulse'
                )}
                style={{
                    animationDelay: '0.2s',
                }}
            ></div>
            <div
                className={cn(
                    size,
                    ' bg-purple-600 rounded-full animate-pulse'
                )}
                style={{
                    animationDelay: '0.4s',
                }}
            ></div>
        </div>
    )
}

export default MessageLoading
