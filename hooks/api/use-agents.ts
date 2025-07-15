import { Agent } from '@/types/assistant'
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

    return useQuery<Agent[]>({
        queryKey: [AGENTS_TAG, skip, limit],
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                skip: skip.toString(),
                limit: limit.toString(),
            })

            const response = await fetch(`/api/agents/get?${searchParams}`)
            const data = (await response.json()) as Agent[]

            if (data) {
                return data
            }
            return []
        },
    })
}
