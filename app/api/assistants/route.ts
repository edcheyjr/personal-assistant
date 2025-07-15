import { auth } from '@/lib/auth'
import { CONTENT_TYPE, unknownErr } from '@/utils/constants'
import { NextRequest, NextResponse } from 'next/server'

// Define the Agent type (adjust based on your actual Agent interface)
interface Agent {
    id: string
    name: string
    // Add other agent properties as needed
}

interface ApiResponse<T> {
    data: T
    success: boolean
    message?: string
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        // Extract query parameters
        const { searchParams } = new URL(request.url)
        const skip = parseInt(searchParams.get('skip') || '0', 10)
        const limit = parseInt(searchParams.get('limit') || '100', 10)

        // Get authorization token from headers
        const token = session?.user.access_token

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

        // Make request to external API
        const response = await fetch(
            `${process.env.API_BASE_URL}/api/v1/multi-agents/?${params}`,
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
            success: true,
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
