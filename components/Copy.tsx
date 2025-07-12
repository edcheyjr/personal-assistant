'use client'

import IconCheck from '@/svg/icons/ic_check'
import IconCopy from '@/svg/icons/ic_copy'
import { cn } from '@/utils/cn'
import { ExternalToast, toast } from 'sonner'

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Button } from '@/components/ui/button'

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

interface MessageActionsProps extends React.ComponentProps<'div'> {
    message: string
    toastMessage?: string
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'no-padding'
}
/**
 * Based on Copy message on chat does the same thing for any word
 * @param {string} message message to copy
 * @returns
 */
export function CopyMessage({
    message,
    toastMessage,
    className,
    size = 'icon-sm',
    ...props
}: MessageActionsProps) {
    const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

    const toastProperties: ExternalToast = {
        duration: 3000,
        closeButton: false,
    }

    const onCopy = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isCopied) return
        copyToClipboard(message)
        if (isCopied) {
            toast('already copied to clipboard', toastProperties)
        } else {
            toast(
                toastMessage ? toastMessage : 'copied to clipboard',
                toastProperties
            )
        }
    }

    return (
        <>
            <div
                className={cn(
                    'flex items-center justify-end transition-opacity  group-focus-within:opacity-100 group-hover:opacity-100 md:opacity-0',
                    className
                )}
                {...props}
            >
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size={size}
                            onClick={onCopy}
                            className="hover:bg-black/5 dark:hover:bg-white/5"
                        >
                            {isCopied ? (
                                <IconCheck
                                    className={size == 'icon' ? 'size-6' : ''}
                                />
                            ) : (
                                <IconCopy
                                    className={size == 'icon' ? 'size-6' : ''}
                                />
                            )}
                            <span className="sr-only">Copy message</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Copy</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </>
    )
}
