import { Button } from '@/components/ui/button'
import { ThemedTextarea as Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Send } from 'lucide-react'
import React, { useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'

type Props = {
    message: string
    isRecording: boolean
    handleSendMessage: () => void
    handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
    toggleListening: () => void
    setMessage: React.Dispatch<React.SetStateAction<string>>
}

const MessageInput = ({
    message,
    isRecording,
    handleKeyPress,
    setMessage,
    handleSendMessage,
    toggleListening,
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
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
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
                    onClick={toggleListening}
                    variant="outline"
                    size="icon"
                    className={cn(
                        'size-12 sm:size-13 transition-all duration-200',
                        isRecording &&
                            'animate-pulse bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive'
                    )}
                >
                    {isRecording ? (
                        <MicOff className="size-4 lg:size-5" />
                    ) : (
                        <Mic className="size-4 lg:size-5" />
                    )}
                </Button>

                <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    size="icon"
                    variant={'outline'}
                    className="size-12 sm:size-13 transition-all duration-200"
                >
                    <Send className="size-4 lg:size-5" />
                </Button>
            </div>

            {isRecording && (
                <Badge
                    variant="destructive"
                    className="absolute -top-24 left-4 animate-pulse"
                >
                    <div className="mr-2 size-2 rounded-full bg-current animate-ping" />
                    Recording...
                </Badge>
            )}
        </div>
    )
}

export default MessageInput
