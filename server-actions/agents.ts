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
    const token = session?.user?.token
    return assistantService.updateAgent(agentId, updateData, token)
}

export async function deleteAgentAction(agentId: string) {
    const session = await auth()
    const token = session?.user?.token
    return assistantService.deleteAgent(agentId, token)
}

export async function streamAgentResponseAction(
    params: StreamParams
): Promise<ApiResponse<ReadableStream<Uint8Array>>> {
    const session = await auth()
    const token = session?.user?.token
    console.log('token', token)
    return assistantService.streamAgentResponse(params, token)
}

export async function getCurrentUserAction() {
    const session = await auth()
    const token = session?.user?.token
    return assistantService.getCurrentUser(token!)
}
