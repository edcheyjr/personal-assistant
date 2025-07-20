import 'server-only'

import {
    Agent,
    CreateAgentRequest,
    UpdateAgentRequest,
    StreamParams,
    ApiResponse,
    ThreadId,
} from '@/types/agent'
import { getAPIBaseURL } from '@/utils/baseUrl'
import { fetchWithTimeout } from '@/utils/fetchWithTimeout'

interface RequestOptions extends Omit<RequestInit, 'headers'> {
    headers?: Record<string, string>
    skipContentType?: boolean
    customContentType?: string
}

class AssistantService {
    private defaultHeaders: Record<string, string> = {}

    // Method to set default headers that will be applied to all requests
    setDefaultHeaders(headers: Record<string, string>): void {
        this.defaultHeaders = { ...headers }
    }

    // Method to add or update a single default header
    setDefaultHeader(key: string, value: string): void {
        this.defaultHeaders[key] = value
    }

    // Method to remove a default header
    removeDefaultHeader(key: string): void {
        delete this.defaultHeaders[key]
    }

    // Method to clear all default headers
    clearDefaultHeaders(): void {
        this.defaultHeaders = {}
    }

    private mergeHeaders(
        requestHeaders: Record<string, string> = {},
        skipContentType = false,
        customContentType?: string
    ): Record<string, string> {
        const headers: Record<string, string> = {
            ...this.defaultHeaders,
            ...requestHeaders,
        }

        // Handle Content-Type header
        if (!skipContentType) {
            if (customContentType) {
                headers['Content-Type'] = customContentType
            } else if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json'
            }
        } else {
            // Remove Content-Type if explicitly skipped
            delete headers['Content-Type']
        }

        return headers
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const {
            skipContentType,
            customContentType,
            headers = {},
            ...restOptions
        } = options
        const baseUrl = getAPIBaseURL()

        try {
            const response = await fetchWithTimeout(`${baseUrl}${endpoint}`, {
                headers: this.mergeHeaders(
                    headers,
                    skipContentType,
                    customContentType
                ),
                ...restOptions,
                timeout: 1000 * 60, //1 min
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

    // Helper method to ensure data is properly formatted for JSON
    private prepareRequestBody(data: any): string {
        // If it's already a string, assume it's JSON and return as-is
        if (typeof data === 'string') {
            // Validate it's valid JSON
            try {
                JSON.parse(data)
                return data
            } catch (e) {
                throw new Error('Invalid JSON string provided')
            }
        }
        // If it's an object, stringify it
        return JSON.stringify(data)
    }

    async getCurrentUser(
        token: string,
        options?: RequestOptions
    ): Promise<ApiResponse<string>> {
        return this.makeRequest<string>('/auth/me', {
            method: 'GET',
            headers: this.getAuthHeaders(token),
            ...options,
        })
    }

    // UUID Methods
    private async generateThreadId(
        options?: RequestOptions
    ): Promise<ApiResponse<ThreadId>> {
        return this.makeRequest<ThreadId>('/uuids/thread_id', {
            method: 'GET',
            ...options,
        })
    }

    // Agent CRUD Operations
    async createAgent(
        agentData: CreateAgentRequest,
        token?: string,
        options?: RequestOptions
    ): Promise<ApiResponse<Agent>> {
        console.log('agentData', agentData)
        return this.makeRequest<Agent>('/multi-agents', {
            method: 'POST',
            headers: this.getAuthHeaders(token),
            body: this.prepareRequestBody(agentData),
            ...options,
        })
    }

    async getAgents(
        skip: number = 0,
        limit: number = 100,
        token?: string,
        options?: RequestOptions
    ): Promise<ApiResponse<Agent[]>> {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        })

        return this.makeRequest<Agent[]>(`/multi-agents/?${params}`, {
            method: 'GET',
            headers: this.getAuthHeaders(token),
            skipContentType: true, // GET request doesn't need Content-Type
            ...options,
        })
    }

    async getAgent(
        agentId: string,
        token?: string,
        options?: RequestOptions
    ): Promise<ApiResponse<Agent>> {
        return this.makeRequest<Agent>(`/multi-agents/${agentId}`, {
            method: 'GET',
            headers: this.getAuthHeaders(token),
            skipContentType: true, // GET request doesn't need Content-Type
            ...options,
        })
    }

    async updateAgent(
        agentId: string,
        updateData: UpdateAgentRequest,
        token?: string,
        options?: RequestOptions
    ): Promise<ApiResponse<Agent>> {
        return this.makeRequest<Agent>(`/multi-agents/${agentId}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(token),
            body: this.prepareRequestBody(updateData),
            ...options,
        })
    }

    async deleteAgent(
        agentId: string,
        token?: string,
        options?: RequestOptions
    ): Promise<ApiResponse<unknown>> {
        const baseUrl = getAPIBaseURL()
        const response = await fetchWithTimeout(
            `${baseUrl}/multi-agents/${agentId}`,
            {
                method: 'DELETE',
                headers: this.getAuthHeaders(token),
                skipContentType: true,
                ...options,
            }
        )
        if (!response.ok) {
            return {
                data: null,
                error: 'Failed to delete agent',
                status: response.status,
            }
        }
        return {
            data: null,
            status: response.status,
        }
    }

    // Streaming Methods
    async streamAgentResponse(
        params: StreamParams,
        token?: string
    ): Promise<ApiResponse<ReadableStream<Uint8Array>>> {
        try {
            const { data, error } = await this.generateThreadId()
            console.log('data', data)
            console.log('error', error)
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

    // Utility method to make custom requests with full control
    async customRequest<T>(
        endpoint: string,
        options: RequestOptions
    ): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, options)
    }
}

// Export singleton instance
export const assistantService = new AssistantService()
