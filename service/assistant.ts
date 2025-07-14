// assistant.ts
'use server'

import {
    Agent,
    CreateAgentRequest,
    UpdateAgentRequest,
    LoginRequest,
    AuthResponse,
    StreamParams,
    ApiResponse,
} from '@/types/assistant'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000'

class AssistantService {
    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                return {
                    error:
                        errorData.detail ||
                        `HTTP ${response.status}: ${response.statusText}`,
                    status: response.status,
                }
            }

            const data = await response.json()
            return {
                data,
                status: response.status,
            }
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Network error',
                status: 500,
            }
        }
    }

    private getAuthHeaders(token?: string): Record<string, string> {
        return token ? { Authorization: `Bearer ${token}` } : {}
    }

    // Auth Methods
    async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        return this.makeRequest<AuthResponse>('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        })
    }

    async getCurrentUser(token: string): Promise<ApiResponse<string>> {
        return this.makeRequest<string>('/api/v1/auth/me', {
            method: 'GET',
            headers: this.getAuthHeaders(token),
        })
    }

    // UUID Methods
    async generateThreadId(): Promise<ApiResponse<string>> {
        return this.makeRequest<string>('/api/v1/uuids/thread_id', {
            method: 'GET',
        })
    }

    // Agent CRUD Operations
    async createAgent(
        agentData: CreateAgentRequest,
        token?: string
    ): Promise<ApiResponse<Agent>> {
        return this.makeRequest<Agent>('/api/v1/multi-agents/', {
            method: 'POST',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(agentData),
        })
    }

    // async getAgents(
    //     skip: number = 0,
    //     limit: number = 100,
    //     token?: string
    // ): Promise<ApiResponse<Agent[]>> {
    //     const params = new URLSearchParams({
    //         skip: skip.toString(),
    //         limit: limit.toString(),
    //     })

    //     return this.makeRequest<Agent[]>(`/api/v1/multi-agents/?${params}`, {
    //         method: 'GET',
    //         headers: this.getAuthHeaders(token),
    //     })
    // }

    async getAgent(
        agentId: string,
        token?: string
    ): Promise<ApiResponse<Agent>> {
        return this.makeRequest<Agent>(`/api/v1/multi-agents/${agentId}`, {
            method: 'GET',
            headers: this.getAuthHeaders(token),
        })
    }

    async updateAgent(
        agentId: string,
        updateData: UpdateAgentRequest,
        token?: string
    ): Promise<ApiResponse<Agent>> {
        return this.makeRequest<Agent>(`/api/v1/multi-agents/${agentId}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(updateData),
        })
    }

    async deleteAgent(
        agentId: string,
        token?: string
    ): Promise<ApiResponse<void>> {
        return this.makeRequest<void>(`/api/v1/multi-agents/${agentId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(token),
        })
    }

    // Streaming Methods
    async streamAgentResponse(
        params: StreamParams,
        token?: string
    ): Promise<ApiResponse<ReadableStream<Uint8Array>>> {
        try {
            const searchParams = new URLSearchParams({
                user_input: params.user_input,
                thread_id: params.thread_id,
                agent_id: params.agent_id,
            })

            const response = await fetch(
                `${API_BASE_URL}/api/v1/streaming/stream?${searchParams}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        ...this.getAuthHeaders(token),
                    },
                }
            )

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                return {
                    error:
                        errorData.detail ||
                        `HTTP ${response.status}: ${response.statusText}`,
                    status: response.status,
                }
            }

            return {
                data: response.body!,
                status: response.status,
            }
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Network error',
                status: 500,
            }
        }
    }

    // Helper method to parse SSE stream
    async parseSSEStream(
        stream: ReadableStream<Uint8Array>,
        onMessage: (data: any) => void,
        onError?: (error: string) => void,
        onComplete?: () => void
    ): Promise<void> {
        const reader = stream.getReader()
        const decoder = new TextDecoder()

        try {
            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    onComplete?.()
                    break
                }

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))
                            onMessage(data)
                        } catch (e) {
                            // Handle non-JSON data lines
                            onMessage(line.slice(6))
                        }
                    }
                }
            }
        } catch (error) {
            onError?.(
                error instanceof Error ? error.message : 'Stream parsing error'
            )
        } finally {
            reader.releaseLock()
        }
    }
}

// Export singleton instance
export const assistantService = new AssistantService()

// Server Actions
export async function loginAction(credentials: LoginRequest) {
    return assistantService.login(credentials)
}

export async function getCurrentUserAction(token: string) {
    return assistantService.getCurrentUser(token)
}

export async function generateThreadIdAction() {
    return assistantService.generateThreadId()
}

export async function createAgentAction(
    agentData: CreateAgentRequest,
    token?: string
) {
    return assistantService.createAgent(agentData, token)
}

// export async function getAgentsAction(
//     skip: number = 0,
//     limit: number = 100,
//     token?: string
// ) {
//     return assistantService.getAgents(skip, limit, token)
// }

export async function getAgentAction(agentId: string, token?: string) {
    return assistantService.getAgent(agentId, token)
}

export async function updateAgentAction(
    agentId: string,
    updateData: UpdateAgentRequest,
    token?: string
) {
    return assistantService.updateAgent(agentId, updateData, token)
}

export async function deleteAgentAction(agentId: string, token?: string) {
    return assistantService.deleteAgent(agentId, token)
}

export async function streamAgentResponseAction(
    params: StreamParams,
    token?: string
) {
    return assistantService.streamAgentResponse(params, token)
}

// Usage Examples:

/*
// Authentication
const loginResult = await loginAction({
 username: "user@example.com",
 password: "password123"
});

if (loginResult.data) {
 const { access_token } = loginResult.data;
 
 // Create an agent
 const createResult = await createAgentAction({
   name: "Assistant Bot",
   agent_type: "conversational",
   description: "A helpful assistant",
   personality_traits: { friendliness: 0.8, professionalism: 0.9 },
   agent_properties: { language: "en" },
   config: { max_tokens: 1000 },
   voice_settings: { pitch: 0.5 },
   user_id: "user@example.com"
 }, access_token);

 if (createResult.data) {
   const agent = createResult.data;
   
   // Stream a response
   const streamResult = await streamAgentResponseAction({
     user_input: "Hello, how are you?",
     thread_id: "thread-uuid",
     agent_id: agent.id
   }, access_token);

   if (streamResult.data) {
     await assistantService.parseSSEStream(
       streamResult.data,
       (data) => console.log('Received:', data),
       (error) => console.error('Stream error:', error),
       () => console.log('Stream complete')
     );
   }
 }
}
*/
