import { auth } from '@/lib/auth'
import { ApiResponse } from '@/types/assistant'
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
        // Extract query parameters

        // Get authorization token from headers
        const token = session?.user.access_token
        const search = (req.nextUrl.searchParams.get('q') as string) || ''
        const limit =
            parseInt(req.nextUrl.searchParams.get('limit') as string) || 100
        const skip =
            parseInt(req.nextUrl.searchParams.get('skip') as string) || 0
        // Validate parameters
        if (skip < 0 || limit <= 0 || limit > 1000) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid skip or limit parameters',
                },
                { status: 400 }
            )
        }

        // Build query parameters for the external API
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        })

        // Prepare headers for the external API call
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }
        const baseUrl = getAPIBaseURL()
        // Make request to external API
        const response = await fetch(
            `${baseUrl}/api/v1/multi-agents/?${params}`,
            {
                method: 'GET',
                headers: {
                    accept: CONTENT_TYPE[0],
                    'Content-Type': CONTENT_TYPE[0],
                    Authorization: `Bearer ${token}`,
                },
            }
        )

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

        const data: Agent[] = await response.json()

        const apiResponse: ApiResponse<Agent[]> = {
            data,
            status: 200,
        }

        return NextResponse.json(apiResponse)
    } catch (error) {
        console.error('Error fetching agents:', error)

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500 }
        )
    }
}
