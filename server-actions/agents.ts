'use server'

import { auth } from '@/lib/auth'
import { assistantService } from '@/service/assistant'
import {
    ApiResponse,
    CreateAgentRequest,
    StreamParams,
    UpdateAgentRequest,
} from '@/types/agent'

export async function createAgentAction({
    agentData,
}: {
    agentData: CreateAgentRequest
}) {
    const session = await auth()
    const token = session?.user?.access_token
    return assistantService.createAgent(agentData, token)
}

// export async function getAgentAction(agentId: string) {
//     const session = await auth()
//     const token = session?.user?.token
//     return assistantService.getAgent(agentId, token)
// }

export async function updateAgentAction({
    agentId,
    updateData,
}: {
    agentId: string
    updateData: UpdateAgentRequest
}) {
    const session = await auth()
    const token = session?.user?.access_token
    if (!token) {
        return {
            data: null,
            error: 'Unauthorized',
            status: 401,
        }
    }
    return assistantService.updateAgent(agentId, updateData, token)
}

export async function deleteAgentAction(agentId: string) {
    const session = await auth()
    const token = session?.user?.access_token
    if (!token) {
        return {
            data: null,
            error: 'Unauthorized',
            status: 401,
        }
    }
    return assistantService.deleteAgent(agentId, token)
}

export async function streamAgentResponseAction(
    params: StreamParams
): Promise<ApiResponse<string | ReadableStream<Uint8Array>>> {
    const session = await auth()
    const token = session?.user?.access_token

    // Debug the input params
    console.log('🔍 Stream params:', JSON.stringify(params, null, 2))
    console.log('🔑 Token exists:', !!token)

    if (!token) {
        console.log('❌ No token found')
        return {
            data: 'You do not have enough tokens to make this request...',
            error: 'Unauthorized',
            status: 401,
        }
    }

    try {
        const response = await assistantService.streamAgentResponse(
            params,
            token
        )

        // Debug the response structure
        console.log('📤 Response status:', response.status)
        console.log('📤 Response error:', response.error)
        console.log('📤 Response data type:', typeof response.data)

        // If it's a ReadableStream, intercept for debugging but pass through to client
        if (response.data instanceof ReadableStream) {
            console.log('🌊 Intercepting stream for debugging...')
            console.log('stream', response.data)

            const reader = response.data.getReader()
            const stream = new ReadableStream({
                start(controller) {
                    const pump = async (): Promise<void> => {
                        try {
                            const { done, value } = await reader.read()

                            if (done) {
                                console.log('✅ Stream ended')
                                controller.close()
                                return
                            }

                            // Debug each chunk (but still pass it through)
                            const chunkText = new TextDecoder().decode(value)
                            console.log('📦 Stream chunk:', chunkText)

                            // IMPORTANT: Pass the chunk to the client
                            controller.enqueue(value)

                            // Continue pumping
                            await pump()
                        } catch (error) {
                            console.error('💥 Stream pump error:', error)
                            controller.error(error)
                        }
                    }

                    return pump()
                },
            })

            // Return the intercepted stream to the client
            return {
                ...response,
                data: stream,
            }
        } else {
            console.log('📄 Response data:', response.data)
        }

        return response
    } catch (error) {
        console.error('💥 Error in streamAgentResponseAction:', error)
        throw error
    }
}

export async function getCurrentUserAction() {
    const session = await auth()
    const token = session?.user?.access_token
    return assistantService.getCurrentUser(token!)
}
