import { auth } from '@/lib/auth'
import { getAPIBaseURL } from '@/utils/baseUrl'
import { CONTENT_TYPE, unknownErr } from '@/utils/constants'
import { NextRequest, NextResponse } from 'next/server'

// Define the Agent type (adjust based on your actual Agent interface)
interface Agent {
    id: string
    name: string
    // Add other agent properties as needed
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        const id = (req.nextUrl.searchParams.get('id') as string) || ''
        // Get authorization token from headers
        const token = session?.user.access_token

        if (!token) {
        }
        const baseUrl = getAPIBaseURL()
        // Make request to external API
        const response = await fetch(`${baseUrl}/multi-agents/${id}`, {
            method: 'GET',
            headers: {
                accept: CONTENT_TYPE[0],
                'Content-Type': CONTENT_TYPE[0],
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const msg = await response.json().then((result) => result.detail)
            process.env.NODE_ENV == 'development'
                ? console.log('msg', msg)
                : null
            return NextResponse.json(msg || unknownErr, {
                status: response.status,
                statusText: msg,
            })
        }

        const data: Agent = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching agents:', error)

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500, statusText: 'Internal Server Error' }
        )
    }
}
