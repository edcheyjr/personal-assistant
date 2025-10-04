import { AgentGroupListResponse, ApiResponse } from "@/types/agent-group";
import { useQuery } from "@tanstack/react-query";

interface UseAgentGroupsParams {
  skip?: number;
  limit?: number;
}

export const AGENT_GROUPS_TAG = "agent-groups";

/**
 * Get all agent groups with pagination
 */
export function useAgentGroups(params: UseAgentGroupsParams = {}) {
  const { skip = 0, limit = 20 } = params;

  return useQuery<ApiResponse<AgentGroupListResponse>>({
    queryKey: [AGENT_GROUPS_TAG, skip, limit],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/agent-groups?${searchParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw {
          data: undefined,
          status: response.status,
          error: data.detail || "Failed to fetch agent groups",
        };
      }

      return {
        data,
        status: response.status,
        error: undefined,
      };
    },
  });
}
