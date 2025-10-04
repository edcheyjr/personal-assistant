import { NextRequest, NextResponse } from 'next/server'
import { getAPIBaseURL } from '@/utils/baseUrl'

export async function GET(request: NextRequest) {
    try {
        // Get access token from cookies
        const tokenCookie = request.cookies.get('access_token')
        const token = tokenCookie?.value

        if (!token) {
            return NextResponse.json(
                { detail: 'Authentication required' },
                { status: 401 }
            )
        }

        const baseUrl = getAPIBaseURL()
        const response = await fetch(`${baseUrl}/language-models/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch (error) {
        console.error('Error fetching language models:', error)
        return NextResponse.json(
            { detail: 'Failed to fetch language models' },
            { status: 500 }
        )
    }
}