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
        const url = new URL(request.url)
        const skip = url.searchParams.get('skip') || '0'
        const limit = url.searchParams.get('limit') || '20'
        
        const response = await fetch(`${baseUrl}/agent-groups/?skip=${skip}&limit=${limit}`, {
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
        console.error('Error fetching agent groups:', error)
        return NextResponse.json(
            { detail: 'Failed to fetch agent groups' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
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
        const body = await request.json()
        
        const response = await fetch(`${baseUrl}/agent-groups/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()
        
        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch (error) {
        console.error('Error creating agent group:', error)
        return NextResponse.json(
            { detail: 'Failed to create agent group' },
            { status: 500 }
        )
    }
}