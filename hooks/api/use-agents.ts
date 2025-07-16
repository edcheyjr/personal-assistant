import { Agent, ApiResponse } from '@/types/agent'
import { AGENTS_TAG } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

interface UseAgentsParams {
    skip?: number
    limit?: number
}

/**
 * get all agents with pagination
 */
export function useAgents(params: UseAgentsParams = {}) {
    const { skip = 0, limit = 100 } = params

    return useQuery<ApiResponse<Agent[]>>({
        queryKey: [AGENTS_TAG, skip, limit],
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                skip: skip.toString(),
                limit: limit.toString(),
            })

            const response = await fetch(`/api/agents/get?${searchParams}`)
            const data = (await response.json()) as ApiResponse<Agent[]>
            if (typeof data != 'object') {
                throw {
                    data: [],
                    status: 400,
                    message: 'Not Found',
                }
            }
            return data
        },
    })
}
