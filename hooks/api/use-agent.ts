import { Agent } from '@/types/agent'
import { AGENTS_TAG } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

/**
 * get all agents with pagination
 */
export function useAgent(id: string) {
    return useQuery<Agent>({
        queryKey: [AGENTS_TAG, id],
        queryFn: async () => {
            const response = await fetch(`/api/agents/get-one?id=${id}`)
            const data = (await response.json()) as Agent
            return data
        },
    })
}
