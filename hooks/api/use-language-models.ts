import { LanguageModel, ApiResponse } from "@/types/agent-group";
import { useQuery } from "@tanstack/react-query";

export const LANGUAGE_MODELS_TAG = "language-models";

/**
 * Get all available language models
 */
export function useLanguageModels() {
  return useQuery<ApiResponse<LanguageModel[]>>({
    queryKey: [LANGUAGE_MODELS_TAG],
    queryFn: async () => {
      const response = await fetch("/api/language-models/");
      const data = await response.json();

      if (!response.ok) {
        throw {
          data: undefined,
          status: response.status,
          error: data.detail || "Failed to fetch language models",
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
