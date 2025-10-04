import { AgentGroupDetails, ApiResponse } from "@/types/agent-group";
import { useQuery } from "@tanstack/react-query";
import { AGENT_GROUPS_TAG } from "./use-agent-groups";

/**
 * Get a single agent group by ID
 */
export function useAgentGroup(groupId: string) {
  return useQuery<ApiResponse<AgentGroupDetails>>({
    queryKey: [AGENT_GROUPS_TAG, groupId],
    queryFn: async () => {
      const response = await fetch(`/api/agent-groups/${groupId}`);
      const data = await response.json();

      if (!response.ok) {
        throw {
          data: undefined,
          status: response.status,
          error: data.detail || "Failed to fetch agent group",
        };
      }

      return {
        data,
        status: response.status,
        error: undefined,
      };
    },
    enabled: !!groupId, // Only run query if groupId is provided
  });
}
