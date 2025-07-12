import * as React from "react"

export interface UseCopyToClipboardProps {
    timeout?: number
}

/**
 * @description A hook to copy text or blob data to the clipboard using the Clipboard API.
 * Supports both text/plain and other MIME types like images.
 * @param timeout Time in milliseconds before resetting the copied state. Default 2000ms.
 * @returns Contains isCopied state, error, and copyToClipboard function.
 *
 * @example
 * // Basic text copy
 * function TextCopyButton() {
 *   const { copyToClipboard } = useCopyToClipboard();
 *   return (
 *     <button onClick={() => copyToClipboard('Hello World')}>
 *       Copy Text
 *     </button>
 *   );
 * }
 *
 * @example
 * // Copy image from URL
 * function ImageCopyButton() {
 *   const { copyToClipboard } = useCopyToClipboard();
 *
 *   const handleCopy = async () => {
 *     try {
 *       const response = await fetch('/image.png');
 *       const blob = await response.blob();
 *       await copyToClipboard({ [blob.type]: blob });
 *     } catch (err) {
 *       console.error('Image copy failed:', err);
 *     }
 *   };
 *
 *   return <button onClick={handleCopy}>Copy Image</button>;
 * }
 *
 * @example
 * // Copy multiple formats (text + image)
 * function RichCopyButton() {
 *   const { copyToClipboard } = useCopyToClipboard();
 *
 *   const handleCopy = async () => {
 *     const textBlob = new Blob(['Fallback text'], { type: 'text/plain' });
 *     const imageBlob = await fetch('/image.png').then(r => r.blob());
 *
 *     try {
 *       await copyToClipboard({
 *         'text/plain': textBlob,
 *         [imageBlob.type]: imageBlob
 *       });
 *     } catch (err) {
 *       console.error('Rich copy failed:', err);
 *     }
 *   };
 *
 *   return <button onClick={handleCopy}>Copy Rich Content</button>;
 * }
 *
 * @example
 * // Safari-compatible canvas copy
 * function CanvasCopyButton() {
 *   const { copyToClipboard } = useCopyToClipboard();
 *
 *   const handleCopy = async () => {
 *     const canvas = document.createElement('canvas');
 *     const ctx = canvas.getContext('2d');
 *
 *     // Draw sample content
 *     ctx.fillStyle = 'red';
 *     ctx.fillRect(0, 0, 100, 100);
 *
 *     try {
 *       const blob = await new Promise<Blob>((resolve, reject) => {
 *         canvas.toBlob((result) => {
 *           result ? resolve(result) : reject(new Error('Canvas conversion failed'));
 *         }, 'image/png');
 *       });
 *
 *       await copyToClipboard({
 *         'image/png': Promise.resolve(blob) // Safari requires promise wrapper
 *       });
 *     } catch (err) {
 *       console.error('Canvas copy failed:', err);
 *     }
 *   };
 *
 *   return <button onClick={handleCopy}>Copy Canvas</button>;
 * }
 */
export function useCopyToClipboard({
    timeout = 2000,
}: UseCopyToClipboardProps) {
    const [isCopied, setIsCopied] = React.useState(false)
    const [error, setError] = React.useState<Error | null>(null)

    const copyToClipboard = React.useCallback(
        async (value: string | Record<string, Blob | Promise<Blob>>) => {
            try {
                setError(null)

                // Validate browser environment
                if (typeof window === "undefined") {
                    throw new Error(
                        "Clipboard access requires browser environment"
                    )
                }

                if (typeof value === "string") {
                    // Handle text copy
                    if (!navigator.clipboard?.writeText) {
                        throw new Error(
                            "Clipboard API (writeText) not available"
                        )
                    }

                    if (!value) {
                        throw new Error(
                            "Invalid text content for clipboard copy"
                        )
                    }

                    await navigator.clipboard.writeText(value)
                } else {
                    // Handle blob data copy
                    if (!navigator.clipboard?.write) {
                        throw new Error("Clipboard API (write) not available")
                    }

                    // Validate input structure
                    if (typeof value !== "object" || value === null) {
                        throw new Error("Invalid clipboard data format")
                    }

                    const mimeTypes = Object.keys(value)
                    if (mimeTypes.length === 0) {
                        throw new Error(
                            "No MIME types provided in clipboard data"
                        )
                    }

                    // Prepare clipboard items with Safari-compatible promises
                    const processedData: Record<string, Promise<Blob>> = {}

                    for (const [mimeType, data] of Object.entries(value)) {
                        // Wrap blobs in promises for Safari compatibility
                        processedData[mimeType] =
                            data instanceof Blob ? Promise.resolve(data) : data
                    }

                    const item = new ClipboardItem(processedData)
                    await navigator.clipboard.write([item])
                }

                // Update state and schedule reset
                setIsCopied(true)
                const timeoutId = setTimeout(() => setIsCopied(false), timeout)
                return () => clearTimeout(timeoutId)
            } catch (err) {
                // Handle errors
                const error =
                    err instanceof Error ? err : new Error("Copy failed")
                setError(error)
                console.error("Copy to clipboard failed:", error)
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
