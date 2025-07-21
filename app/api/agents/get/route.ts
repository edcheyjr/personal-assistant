import { auth } from '@/lib/auth'
import { assistantService } from '@/service/assistant'
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
        const apiResponse = await assistantService.getAgents(skip, limit, token)
        return NextResponse.json(apiResponse)
    } catch (error) {
        console.error('Error fetching agents:', error)

        return NextResponse.json(error, { status: 500 })
    }
}
