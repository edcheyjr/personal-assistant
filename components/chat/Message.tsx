import { MessageProps } from '@/types/message'
import React from 'react'
import { cn } from '@/utils/cn'
import { useThemeColor, generateThemeCSS } from '@/lib/theme'

const Message: React.FC<MessageProps> = ({ message }) => {
    const { themeColor } = useThemeColor()

    // Generate theme styles for user messages
    const userMessageStyle = {
        backgroundColor: themeColor,
        ...generateThemeCSS(themeColor),
    }

    // Convert hex to RGB for opacity variations
    const getThemeRGB = (color: string) => {
        const hex = color.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16)
        const g = parseInt(hex.substr(2, 2), 16)
        const b = parseInt(hex.substr(4, 2), 16)
        return { r, g, b }
    }

    const themeRGB = getThemeRGB(themeColor)

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
                    // User messages - themed
                    message.sender === 'user' && [
                        'text-white',
                        'hover:shadow-md',
                        'border border-black/10',
                    ],
                    // Bot messages - adaptive to theme
                    message.sender !== 'user' && [
                        'bg-muted text-muted-foreground',
                        'border border-border',
                        'hover:bg-muted/80',
                    ]
                )}
                style={message.sender === 'user' ? userMessageStyle : undefined}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                </p>

                {message.timestamp && (
                    <p
                        className={cn(
                            'mt-2 text-xs font-medium',
                            message.sender === 'user'
                                ? 'text-white'
                                : 'text-muted-foreground/70'
                        )}
                        // style={
                        //     message.sender === 'user'
                        //         ? {
                        //               color: `rgba(${themeRGB.r}, ${themeRGB.g}, ${themeRGB.b}, 0.7)`,
                        //               filter: 'brightness(1.8)',
                        //           }
                        //         : undefined
                        // }
                    >
                        {message.timestamp}
                    </p>
                )}
            </div>
        </div>
    )
}

export default Message
