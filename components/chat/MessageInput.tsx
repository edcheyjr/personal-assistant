import { Button } from '@/components/ui/button'
import { ThemedTextarea as Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import React, { useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'

type Props = {
    message: string
    disabled: boolean
    handleSendMessage: () => void
    handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
    setMessage: React.Dispatch<React.SetStateAction<string>>
}

const MessageInput = ({
    disabled,
    message,
    handleKeyPress,
    setMessage,
    handleSendMessage,
}: Props) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleTextareaInput = (
        e: React.FormEvent<HTMLTextAreaElement>
    ): void => {
        const target = e.target as HTMLTextAreaElement
        target.style.height = 'auto'
        target.style.height = Math.min(target.scrollHeight, 120) + 'px'
    }

    // Auto-resize textarea when message changes
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 120) + 'px'
        }
    }, [message])

    return (
        <div className="relative">
            <div className="flex items-end gap-2 sm:gap-3">
                <div className="relative flex-1">
                    <Textarea
                        disabled={disabled}
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        className={cn(
                            'min-h-[52px] max-h-[120px] resize-none transition-all duration-200',
                            'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:border-purple-500',
                            'text-sm sm:text-base'
                        )}
                        rows={1}
                        onInput={handleTextareaInput}
                    />
                </div>

                <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || disabled}
                    size="icon"
                    variant={'outline'}
                    className="size-12 sm:size-13 transition-all duration-200"
                >
                    <Send className="size-4 lg:size-5" />
                </Button>
            </div>
        </div>
    )
}

export default MessageInput
