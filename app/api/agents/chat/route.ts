import { auth } from '@/lib/auth'
import { textStream } from '@/lib/stream-data/TextStream'
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

        const token = session?.user.access_token
        const user_input = req.nextUrl.searchParams.get('input') as string
        const agent_id = req.nextUrl.searchParams.get('id') as string
        // Validate parameters
        if (!user_input || !agent_id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid skip or limit parameters',
                },
                { status: 400 }
            )
        }
        const apiResponse = await assistantService.streamAgentResponse(
            {
                agent_id,
                user_input,
            },
            token
        )
        const stream = await textStream(apiResponse)
        return new Response(stream)
    } catch (error) {
        console.error('Error fetching agents:', error)

        return NextResponse.json(error, { status: 500 })
    }
}
