import { NextRequest, NextResponse } from 'next/server'
import { getAPIBaseURL } from '@/utils/baseUrl'
import { cookies } from 'next/headers'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ agent_group_id: string }> }
) {
    try {
        const baseUrl = getAPIBaseURL()
        const { agent_group_id } = await params
        const url = new URL(request.url)
        const user_input = url.searchParams.get('user_input')
        const thread_id = url.searchParams.get('thread_id')

        if (!user_input || !thread_id) {
            return NextResponse.json(
                { detail: 'Missing required parameters: user_input and thread_id' },
                { status: 422 }
            )
        }

        // Get access token from cookies
        const cookieStore = await cookies()
        const accessToken = cookieStore.get('access_token')?.value

        if (!accessToken) {
            return NextResponse.json(
                { detail: 'Unauthorized' },
                { status: 401 }
            )
        }

        const streamUrl = `${baseUrl}/multi-agents/${agent_group_id}/chat/stream?user_input=${encodeURIComponent(user_input)}&thread_id=${encodeURIComponent(thread_id)}`

        const response = await fetch(streamUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'text/event-stream',
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Return the stream directly
        return new NextResponse(response.body, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    } catch (error) {
        console.error('Error streaming agent group chat:', error)
        return NextResponse.json(
            { detail: 'Failed to stream agent group chat' },
            { status: 500 }
        )
    }
}