import { ApiResponse, ThreadId } from '@/types/agent'
import { useQuery } from '@tanstack/react-query'

/**
 * get ThreadId
 */
export function useThreadId() {
    return useQuery<ApiResponse<ThreadId>>({
        queryKey: ['ThreadId'],
        queryFn: async () => {
            const response = await fetch(`/api/thread-id`)
            const data = (await response.json()) as ApiResponse<ThreadId>
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
