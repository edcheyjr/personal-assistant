import { NextResponse } from 'next/server'
import { createParser, ParseError } from 'eventsource-parser'
import { fetchWithTimeout } from '@/utils/fetchWithTimeout'
import { logger } from '@/utils/logger'

export type ChatGPTAgent = 'user' | 'system'

export interface ChatGPTMessage {
    role: ChatGPTAgent
    content: string
}

export interface AccessToken {
    access_token: string
}

export async function textStream<T>(
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
                accept: '*/*',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token?.access_token}`,
            },
            body: JSON.stringify(payload),
            timeout: 1000 * 60 * 5, // 5 mins to abort
        })
    } catch (error) {
        logger(error, 'Network error in textStream')
        return 'Check your internet connection and try again.'
    }

    if (res.status === 401) {
        return "You do not have enough tokens to make this request. Please purchase more tokens, for me to be able to assist you further. This can also be because, you're account is not verified. Make sure you'r account is verified."
    }

    if (!res.ok && res.status !== 401) {
        logger(`${res.status} ${res.statusText}`, 'Error', 'error')
        const errorData = await res.json().catch(() => ({
            error: { message: 'Unknown error occurred.' },
        }))
        const errorMessage =
            errorData.error?.message ||
            'An error occurred while processing your request.'
        return `Error: ${errorMessage}`
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
