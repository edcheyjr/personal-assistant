import { assistantService } from '@/service/assistant'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const apiResponse = await assistantService.generateThreadId()
        return NextResponse.json(apiResponse)
    } catch (error) {
        console.error('Error fetching thread id:', error)

        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
            },
            { status: 500, statusText: 'Internal Server Error' }
        )
    }
}
