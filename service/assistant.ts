import 'server-only'

import {
    Agent,
    CreateAgentRequest,
    UpdateAgentRequest,
    StreamParams,
    ApiResponse,
    ThreadId,
} from '@/types/agent'
import { auth } from '@/lib/auth' // adjust the path to your actual auth helper
import { getAPIBaseURL } from '@/utils/baseUrl'

class AssistantService {
    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const baseUrl = getAPIBaseURL()
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
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

    async getCurrentUser(token: string): Promise<ApiResponse<string>> {
        return this.makeRequest<string>('/auth/me', {
            method: 'GET',
            headers: this.getAuthHeaders(token),
        })
    }

    // UUID Methods
    private async generateThreadId(): Promise<ApiResponse<ThreadId>> {
        return this.makeRequest<ThreadId>('/uuids/thread_id', {
            method: 'GET',
        })
    }

    // Agent CRUD Operations
    async createAgent(
        agentData: CreateAgentRequest,
        token?: string
    ): Promise<ApiResponse<Agent>> {
        return this.makeRequest<Agent>('/multi-agents/', {
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

    //     return this.makeRequest<Agent[]>(`/multi-agents/?${params}`, {
    //         method: 'GET',
    //         headers: this.getAuthHeaders(token),
    //     })
    // }

    async getAgent(
        agentId: string,
        token?: string
    ): Promise<ApiResponse<Agent>> {
        return this.makeRequest<Agent>(`/multi-agents/${agentId}`, {
            method: 'GET',
            headers: this.getAuthHeaders(token),
        })
    }

    async updateAgent(
        agentId: string,
        updateData: UpdateAgentRequest,
        token?: string
    ): Promise<ApiResponse<Agent>> {
        return this.makeRequest<Agent>(`/multi-agents/${agentId}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(updateData),
        })
    }

    async deleteAgent(
        agentId: string,
        token?: string
    ): Promise<ApiResponse<void>> {
        return this.makeRequest<void>(`/multi-agents/${agentId}`, {
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
            const { data } = await this.generateThreadId()
            const searchParams = new URLSearchParams({
                user_input: params.user_input,
                thread_id:
                    params.thread_id ?? data?.thread_id ?? crypto.randomUUID(),
                agent_id: params.agent_id,
            })
            const baseUrl = getAPIBaseURL()
            const response = await fetch(
                `${baseUrl}/streaming/stream?${searchParams}`,
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
