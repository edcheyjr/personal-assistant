import { NextResponse } from 'next/server'
import { createParser, ParseError } from 'eventsource-parser'
import { fetchWithTimeout } from '@/utils/fetchWithTimeout'
import { logger } from '@/utils/logger'
import { ApiResponse } from '@/types/agent'

export type ChatGPTAgent = 'user' | 'system'

export interface ChatGPTMessage {
    role: ChatGPTAgent
    content: string
}

export interface AccessToken {
    access_token: string
}

export async function textStream<T>(res: ApiResponse<T>) {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    if (res.status === 401) {
        return 'You are unauthorized to make this request.'
    }

    const stream = new ReadableStream({
        async start(controller) {
            let isClosed = false

            const parser = createParser({
                onError(error: ParseError) {
                    console.error('Error parsing event:', error)
                    if (!isClosed) {
                        isClosed = true
                        controller.error(error)
                    }
                },
                onEvent(event) {
                    // Skip processing if controller is already closed
                    if (isClosed) {
                        return
                    }

                    const data = event.data
                    if (data === '[DONE]') {
                        isClosed = true
                        controller.close()
                        return
                    }

                    try {
                        const json = JSON.parse(data)

                        // Handle the end event
                        if (json.type === 'end') {
                            isClosed = true
                            controller.close()
                            return
                        }

                        // Only process content events if controller is still open
                        if (json.type === 'content' && !isClosed) {
                            const text = json.content || ''
                            if (text) {
                                const queue = encoder.encode(text)
                                controller.enqueue(queue)
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing JSON:', e)
                        if (!isClosed) {
                            isClosed = true
                            controller.error(e)
                        }
                    }
                },
            })

            try {
                for await (const chunk of res.data as any) {
                    parser.feed(decoder.decode(chunk))
                }
            } catch (error) {
                console.error('Error reading stream:', error)
                controller.error(error)
            }
        },
    })

    return stream
}

// FIXME: COPY LOGIC FROM textStream above
export async function FileStream<T extends FormData>(
    url: string,
    payload: T,
    token?: AccessToken
) {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    let counter = 0

    let res: Response
    try {
        res = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token?.access_token}`,
            },
            body: payload,
            timeout: 1000 * 60 * 5, // 5 mins to abort
        })
    } catch (error) {
        logger(error, 'Network error in FileStream')
        return NextResponse.json(
            { error: 'Check your internet connection and try again.' },
            { status: 500 }
        )
    }

    if (res.status === 401) {
        return NextResponse.json(
            {
                error: 'Authorization required. Please verify your account status.',
            },
            { status: 401 }
        )
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({
            error: { message: 'Unknown error occurred.' },
        }))
        const errorMessage =
            errorData.error?.message ||
            'An error occurred while processing your request.'
        return NextResponse.json(
            { error: errorMessage },
            { status: res.status }
        )
    }

    const stream = new ReadableStream({
        async start(controller) {
            const parser = createParser({
                onError(error: ParseError) {
                    console.error('Error parsing event:', error)
                    // if (error.type) {
                    //     console.error('Field name:', error.field)
                    //     console.error('Field value:', error.value)
                    //     console.error('Line:', error.line)
                    // } else if (error.type === 'invalid-retry') {
                    //     console.error('Invalid retry interval:', error.value)
                    // }
                },
                onEvent(event) {
                    const data = event.data
                    if (data === '[DONE]') {
                        controller.close()
                        return
                    }
                    try {
                        const json = JSON.parse(data)
                        const text = json.value || ''
                        if (counter < 2 && (text.match(/\n/) || []).length) {
                            return
                        }
                        const queue = encoder.encode(text)
                        controller.enqueue(queue)
                        counter++
                    } catch (e) {
                        controller.error(e)
                    }
                },
            })
            for await (const chunk of res.body as any) {
                parser.feed(decoder.decode(chunk))
            }
        },
    })

    return stream
}
