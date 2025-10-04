import { NextRequest, NextResponse } from 'next/server'
import { getAPIBaseURL } from '@/utils/baseUrl'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ group_id: string }> }
) {
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
        const { group_id } = await params
        
        const response = await fetch(`${baseUrl}/agent-groups/${group_id}`, {
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
        console.error('Error fetching agent group:', error)
        return NextResponse.json(
            { detail: 'Failed to fetch agent group' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ group_id: string }> }
) {
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
        const { group_id } = await params
        const body = await request.json()
        
        const response = await fetch(`${baseUrl}/agent-groups/${group_id}`, {
            method: 'PUT',
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
        console.error('Error updating agent group:', error)
        return NextResponse.json(
            { detail: 'Failed to update agent group' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ group_id: string }> }
) {
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
        const { group_id } = await params

        const response = await fetch(`${baseUrl}/agent-groups/${group_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })

        // Handle 204 No Content response properly
        if (response.status === 204) {
            return new NextResponse(null, {
                status: 204,
            })
        }

        // For other success responses, try to parse JSON
        if (response.ok) {
            const data = await response.json()
            return NextResponse.json(data, {
                status: response.status,
            })
        }

        // Handle error responses
        const errorData = await response.json().catch(() => ({ detail: 'Failed to delete agent group' }))
        return NextResponse.json(errorData, {
            status: response.status,
        })
    } catch (error) {
        console.error('Error deleting agent group:', error)
        return NextResponse.json(
            { detail: 'Failed to delete agent group' },
            { status: 500 }
        )
    }
}