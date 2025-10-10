import {
  CreateAgentGroupRequest,
  CreateAgentGroupResponse,
  AgentGroupListResponse,
  AgentGroupDetails,
  Tier,
  LanguageModel,
  ApiResponse,
} from "@/types/agent-group";

export class AgentGroupService {
  // Tiers
  static async getTiers(): Promise<Tier[]> {
    try {
      const response = await fetch("/api/tiers/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching tiers:", error);
      throw error;
    }
  }

  // Language Models
  static async getLanguageModels(): Promise<LanguageModel[]> {
    try {
      const response = await fetch("/api/language-models/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching language models:", error);
      throw error;
    }
  }

  // Agent Groups
  static async createAgentGroup(
    data: CreateAgentGroupRequest
  ): Promise<ApiResponse<CreateAgentGroupResponse>> {
    try {
      console.log("Sending agent group creation request:", JSON.stringify(data, null, 2));

      const response = await fetch("/api/agent-groups/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log("Agent group creation response:", responseData);

      // Format error message properly
      let errorMessage = "Failed to create agent group";
      if (!response.ok && responseData.detail) {
        if (Array.isArray(responseData.detail)) {
          // Validation errors - format them as string
          errorMessage = responseData.detail
            .map((err: any) => {
              const location = err.loc ? err.loc.join(' → ') : 'Unknown field';
              return `${location}: ${err.msg}`;
            })
            .join('\n');
        } else if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else {
          // Object error - stringify it
          errorMessage = JSON.stringify(responseData.detail);
        }
      }

      return {
        data: response.ok ? responseData : undefined,
        error: response.ok ? undefined : errorMessage,
        status: response.status,
      };
    } catch (error) {
      console.error("Error creating agent group:", error);
      return {
        error: "Network error occurred while creating agent group",
        status: 500,
      };
    }
  }

  static async getAgentGroups(
    skip: number = 0,
    limit: number = 20
  ): Promise<ApiResponse<AgentGroupListResponse>> {
    try {
      const searchParams = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/agent-groups?${searchParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      return {
        data: response.ok ? responseData : undefined,
        error: response.ok
          ? undefined
          : responseData.detail || "Failed to fetch agent groups",
        status: response.status,
      };
    } catch (error) {
      console.error("Error fetching agent groups:", error);
      return {
        error: "Network error occurred while fetching agent groups",
        status: 500,
      };
    }
  }

  static async getAgentGroup(
    groupId: string
  ): Promise<ApiResponse<AgentGroupDetails>> {
    try {
      const response = await fetch(`/api/agent-groups/${groupId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      return {
        data: response.ok ? responseData : undefined,
        error: response.ok
          ? undefined
          : responseData.detail || "Failed to fetch agent group",
        status: response.status,
      };
    } catch (error) {
      console.error("Error fetching agent group:", error);
      return {
        error: "Network error occurred while fetching agent group",
        status: 500,
      };
    }
  }

  static async updateAgentGroup(
    groupId: string,
    data: any
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`/api/agent-groups/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = response.ok
        ? await response.json()
        : await response.text();

      return {
        data: response.ok ? responseData : undefined,
        error: response.ok
          ? undefined
          : responseData.detail || "Failed to update agent group",
        status: response.status,
      };
    } catch (error) {
      console.error("Error updating agent group:", error);
      return {
        error: "Network error occurred while updating agent group",
        status: 500,
      };
    }
  }

  static async deleteAgentGroup(groupId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/agent-groups/${groupId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return {
        data: response.ok ? undefined : undefined,
        error: response.ok ? undefined : "Failed to delete agent group",
        status: response.status,
      };
    } catch (error) {
      console.error("Error deleting agent group:", error);
      return {
        error: "Network error occurred while deleting agent group",
        status: 500,
      };
    }
  }

  // Chat
  static async createAgentGroupChat(
    agentGroupId: string
  ): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`/api/multi-agents/${agentGroupId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      return {
        data: response.ok ? responseData : undefined,
        error: response.ok
          ? undefined
          : responseData.detail || "Failed to create agent group chat",
        status: response.status,
      };
    } catch (error) {
      console.error("Error creating agent group chat:", error);
      return {
        error: "Network error occurred while creating agent group chat",
        status: 500,
      };
    }
  }

  static streamAgentGroupChat(
    agentGroupId: string,
    userInput: string,
    threadId: string
  ): string {
    const url = new URL(
      `/api/multi-agents/${agentGroupId}/chat/stream`,
      window.location.origin
    );
    url.searchParams.append("user_input", userInput);
    url.searchParams.append("thread_id", threadId);

    return url.toString();
  }
}
