import { auth } from '@/lib/auth'
import { assistantService } from '@/service/assistant'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    try {
        const apiResponse = await assistantService.generateThreadId()
        return NextResponse.json(apiResponse)
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
