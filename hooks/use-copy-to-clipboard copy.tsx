import * as React from 'react'

export interface useCopyToClipboardProps {
    timeout?: number
}
/**
 * @todo support multipart data i.e images e.t.c as well example implementation [here](https://web.dev/articles/async-clipboard#permissions-policy-integration)
 * @description this is copy to clipboard implimentation however only allows text
 * @param timeout this is miinb
 * @returns
 */
export function useCopyToClipboard({
    timeout = 2000,
}: useCopyToClipboardProps) {
    const [isCopied, setIsCopied] = React.useState(false)
    const [error, setError] = React.useState<Error | null>(null)

    const copyToClipboard = React.useCallback(
        async (value: string) => {
            try {
                // Reset previous error
                setError(null)

                // Validate environment and input
                if (typeof window === 'undefined') {
                    throw new Error(
                        'Clipboard access requires browser environment'
                    )
                }

                if (!navigator.clipboard?.writeText) {
                    throw new Error('Clipboard API not available')
                }

                if (!value || typeof value !== 'string') {
                    throw new Error('Invalid content for clipboard copy')
                }

                // Execute copy operation
                await navigator.clipboard.writeText(value)
                setIsCopied(true)

                // Reset copied state after timeout
                setTimeout(() => setIsCopied(false), timeout)
                return true
            } catch (err) {
                // Handle errors consistently
                const error =
                    err instanceof Error ? err : new Error('Copy failed')
                setError(error)
                console.error('Copy to clipboard failed:', error)
                return false
            }
        },
        [timeout]
    )

    return {
        isCopied,
        error,
        copyToClipboard,
    }
}
