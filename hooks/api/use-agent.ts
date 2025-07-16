import { Agent, ApiResponse } from '@/types/agent'
import { AGENTS_TAG } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

/**
 * get a agent information
 */
export function useAgent(id: string) {
    return useQuery<ApiResponse<Agent>>({
        queryKey: [AGENTS_TAG, id],
        queryFn: async () => {
            const response = await fetch(`/api/agents/get-one?id=${id}`)
            const data = (await response.json()) as ApiResponse<Agent>
            return data
        },
    })
}
