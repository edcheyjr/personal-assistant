'use server'

import { auth } from '@/lib/auth'
import { assistantService } from '@/service/assistant'
import {
    ApiResponse,
    CreateAgentRequest,
    StreamParams,
    UpdateAgentRequest,
} from '@/types/agent'

export async function createAgentAction(agentData: CreateAgentRequest) {
    const session = await auth()
    const token = session?.user?.token
    return assistantService.createAgent(agentData, token)
}

// export async function getAgentAction(agentId: string) {
//     const session = await auth()
//     const token = session?.user?.token
//     return assistantService.getAgent(agentId, token)
// }

export async function updateAgentAction(
    agentId: string,
    updateData: UpdateAgentRequest
) {
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
    if (!token) {
        return {
            data: "You do not have enough tokens to make this request. Please purchase more tokens, for me to be able to assist you further. This can also be because, you're account is not verified. Make sure you'r account is verified.",
            error: 'Unauthorized',
            status: 401,
        }
    }
    return assistantService.streamAgentResponse(params, token)
}

export async function getCurrentUserAction() {
    const session = await auth()
    const token = session?.user?.access_token
    return assistantService.getCurrentUser(token!)
}
