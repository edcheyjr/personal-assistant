import { NextRequest, NextResponse } from 'next/server'
import { getAPIBaseURL } from '@/utils/baseUrl'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ agent_group_id: string }> }
) {
    try {
        const baseUrl = getAPIBaseURL()
        const { agent_group_id } = await params
        
        const response = await fetch(`${baseUrl}/multi-agents/${agent_group_id}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
        console.error('Error creating agent group chat:', error)
        return NextResponse.json(
            { detail: 'Failed to create agent group chat' },
            { status: 500 }
        )
    }
}