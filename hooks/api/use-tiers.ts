import { Tier, ApiResponse } from "@/types/agent-group";
import { useQuery } from "@tanstack/react-query";

export const TIERS_TAG = "tiers";

/**
 * Get all available tiers
 */
export function useTiers() {
  return useQuery<ApiResponse<Tier[]>>({
    queryKey: [TIERS_TAG],
    queryFn: async () => {
      const response = await fetch("/api/tiers/");
      const data = await response.json();

      if (!response.ok) {
        throw {
          data: undefined,
          status: response.status,
          error: data.detail || "Failed to fetch tiers",
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
