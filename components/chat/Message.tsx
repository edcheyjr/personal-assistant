import { MessageProps } from '@/types/message'
import React from 'react'
import { cn } from '@/utils/cn'
import { generateThemeCSS, getThemeRGB } from '@/lib/theme'
import MarkdownWrapper from '../MarkdownWrapper'
import { useThemeColor } from '@/providers/color-theme-provider'
import MemoryOperationsDisplay from './MemoryDisplay'

const Message: React.FC<MessageProps> = ({ message, isError }) => {
    const { themeColor } = useThemeColor()

    const themeRGB = getThemeRGB(themeColor)

    const userMessageStyle = {
        backgroundColor: themeColor,
        ...generateThemeCSS(themeColor),
        color: `${themeRGB.r} ${themeRGB.g} ${themeRGB.b}`,
    }
    return (
        <div
            className={cn(
                'flex mb-4 px-4 sm:px-6',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
        >
            <div
                className={cn(
                    'max-w-xs rounded-lg px-4 py-3 sm:max-w-sm lg:max-w-md xl:max-w-lg',
                    'shadow-sm transition-all duration-200',

                    // User message
                    message.sender === 'user' && [
                        'text-white',
                        'hover:shadow-md',
                        'border border-black/10',
                    ],

                    // Assistant message
                    message.sender === 'assistant' && [
                        'bg-muted text-muted-foreground',
                        'border border-border',
                        'hover:bg-muted/80',
                    ],

                    // System message (info or error)
                    message.sender === 'system' && [
                        isError
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
                        'border',
                        isError
                            ? 'border-red-200 dark:border-red-700'
                            : 'border-blue-200 dark:border-blue-700',
                    ]
                )}
                style={message.sender === 'user' ? userMessageStyle : undefined}
            >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    <MarkdownWrapper>{message.text}</MarkdownWrapper>
                </div>

                {message.timestamp && (
                    <p
                        className={cn(
                            'mt-2 text-xs font-medium',
                            message.sender === 'user'
                                ? 'text-white'
                                : 'text-muted-foreground/70'
                        )}
                    >
                        {message.timestamp}
                    </p>
                )}
                {/* Memory Operations Display */}
                {message.memoryOperations &&
                    message.memoryOperations.length > 0 && (
                        <MemoryOperationsDisplay
                            operations={message.memoryOperations}
                        />
                    )}
            </div>
        </div>
    )
}

export default Message
