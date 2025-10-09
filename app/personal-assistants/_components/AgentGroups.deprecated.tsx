"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Settings,
  Trash2,
  Save,
  LoaderIcon,
  Bot,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Select from "@/components/inputs/select-input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AgentGroupService } from "@/service/agent-groups";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { useThemeColor } from "@/providers/color-theme-provider";
import Loader from "@/components/Loader";
import SpecialSelectionInput from "@/components/inputs/SpecialSelectionInput";
import { SliderComponent } from "@/components/Slider";
import { personalityTraits as suggestedTraits } from "@/lib/data/personality";
import {
  Tier,
  LanguageModel,
  CreateAgentGroupRequest,
  AgentGroupSummary,
  AgentPersonality,
  LLMConfiguration,
} from "@/types/agent-group";

interface AgentFormData {
  tier_id: string;
  name: string;
  role: string;
  personality: AgentPersonality;
  prompt_configurations: {
    user_prompt: string;
  };
  capabilities: {
    tools: string[];
    knowledge_bases: string[];
  };
}

const architectureOptions = [
  { value: "hierarchical", label: "Hierarchical" },
  { value: "sequential", label: "Sequential" },
  { value: "parallel", label: "Parallel" },
  { value: "mesh", label: "Mesh" },
];

const toolOptions = [
  { value: "web_search", label: "Web Search" },
  { value: "ticket_lookup", label: "Ticket Lookup" },
  { value: "code_execution", label: "Code Execution" },
  { value: "file_analysis", label: "File Analysis" },
  { value: "email_integration", label: "Email Integration" },
  { value: "calendar_integration", label: "Calendar Integration" },
];

const knowledgeBaseOptions = [
  { value: "support_kb", label: "Support Knowledge Base" },
  { value: "product_specs", label: "Product Specifications" },
  { value: "troubleshooting_guides", label: "Troubleshooting Guides" },
  { value: "company_policies", label: "Company Policies" },
  { value: "technical_docs", label: "Technical Documentation" },
];

interface AgentGroupsProps {
  onConfigureGroup?: (groupId: string) => void;
}

const AgentGroups: React.FC<AgentGroupsProps> = ({ onConfigureGroup }) => {
  const { themeColor } = useThemeColor();
  const queryClient = useQueryClient();

  // Form states
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [architecture, setArchitecture] = useState("hierarchical");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [agents, setAgents] = useState<AgentFormData[]>([]);
  const [llmConfigurations, setLlmConfigurations] = useState<
    LLMConfiguration[]
  >([]);

  // Advanced configuration states
  const [maxRetries, setMaxRetries] = useState(3);
  const [shortTermMemoryWindow, setShortTermMemoryWindow] = useState(10);
  const [memoryConsolidationEnabled, setMemoryConsolidationEnabled] =
    useState(true);

  // Queries
  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ["tiers"],
    queryFn: AgentGroupService.getTiers,
  });

  const { data: languageModels, isLoading: languageModelsLoading } = useQuery({
    queryKey: ["language-models"],
    queryFn: AgentGroupService.getLanguageModels,
  });

  const {
    data: agentGroupsResponse,
    isLoading: agentGroupsLoading,
    refetch: refetchAgentGroups,
  } = useQuery({
    queryKey: ["agent-groups"],
    queryFn: () => AgentGroupService.getAgentGroups(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: AgentGroupService.createAgentGroup,
    onSuccess: async (response) => {
      if (response.status === 200) {
        toast.success("Agent group created successfully!");
        resetForm();
        // Navigate to agent configuration immediately
        // The agent groups will refetch when the configuration page loads
        if (onConfigureGroup && response.data?.group_id) {
          onConfigureGroup(response.data.group_id);
        }
      } else {
        toast.error(response.error || "Failed to create agent group");
      }
    },
    onError: (error) => {
      console.error("Error creating agent group:", error);
      toast.error("Network error occurred");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: AgentGroupService.deleteAgentGroup,
    onSuccess: async (response) => {
      if (response.status === 204) {
        toast.success("Agent group deleted successfully!");
        // Invalidate the cache and refetch
        await queryClient.invalidateQueries({ queryKey: ["agent-groups"] });
        await refetchAgentGroups();
      } else {
        toast.error("Failed to delete agent group");
      }
    },
    onError: (error) => {
      console.error("Error deleting agent group:", error);
      toast.error("Network error occurred");
    },
  });

  // Auto-create default LLM configuration when language models are loaded
  useEffect(() => {
    if (
      languageModels &&
      languageModels.length > 0 &&
      llmConfigurations.length === 0
    ) {
      const defaultConfig: LLMConfiguration = {
        language_model_id: languageModels[0].llm_id,
        temperature: 0.7,
        max_tokens: 1000,
      };
      setLlmConfigurations([defaultConfig]);
    }
  }, [languageModels, llmConfigurations.length]);

  const resetForm = () => {
    setGroupName("");
    setGroupDescription("");
    setArchitecture("hierarchical");
    setSystemPrompt("");
    setAgents([]);
    setMaxRetries(3);
    setShortTermMemoryWindow(10);
    setMemoryConsolidationEnabled(true);
    // Reset to default LLM configuration if available
    if (languageModels && languageModels.length > 0) {
      const defaultConfig: LLMConfiguration = {
        language_model_id: languageModels[0].llm_id,
        temperature: 0.7,
        max_tokens: 1000,
      };
      setLlmConfigurations([defaultConfig]);
    } else {
      setLlmConfigurations([]);
    }
  };

  const addAgent = () => {
    const defaultTier = tiers?.[0];
    const newAgent: AgentFormData = {
      tier_id: defaultTier?.tier_id || "",
      name: "",
      role: "",
      personality: {
        traits: ["professional", "helpful"],
        sliders: {
          creativity: 50,
          formality: 70,
          verbosity: 50,
          enthusiasm: 50,
          empathy: 70,
        },
      },
      prompt_configurations: {
        user_prompt: defaultTier?.prompt || "",
      },
      capabilities: {
        tools: [],
        knowledge_bases: [],
      },
    };
    setAgents([...agents, newAgent]);
  };

  const updateAgent = (index: number, field: string, value: any) => {
    const updatedAgents = [...agents];

    // Handle nested field updates (e.g., 'personality.sliders.creativity')
    if (field.includes(".")) {
      const parts = field.split(".");

      if (parts[0] === "prompt_configurations") {
        updatedAgents[index] = {
          ...updatedAgents[index],
          prompt_configurations: {
            ...updatedAgents[index].prompt_configurations,
            [parts[1]]: value,
          },
        };
      } else if (parts[0] === "capabilities") {
        updatedAgents[index] = {
          ...updatedAgents[index],
          capabilities: {
            ...updatedAgents[index].capabilities,
            [parts[1]]: value,
          },
        };
      } else if (parts[0] === "personality") {
        if (parts[1] === "traits") {
          updatedAgents[index] = {
            ...updatedAgents[index],
            personality: {
              ...updatedAgents[index].personality,
              traits: value,
            },
          };
        } else if (parts[1] === "sliders" && parts[2]) {
          // Handle personality.sliders.creativity, etc.
          updatedAgents[index] = {
            ...updatedAgents[index],
            personality: {
              ...updatedAgents[index].personality,
              sliders: {
                ...updatedAgents[index].personality.sliders,
                [parts[2]]: value,
              },
            },
          };
        }
      }
    } else {
      updatedAgents[index] = {
        ...updatedAgents[index],
        [field]: value,
      };
    }

    // If tier_id is being updated, auto-populate the user prompt
    if (field === "tier_id" && tiers) {
      const selectedTier = tiers.find((tier) => tier.tier_id === value);
      if (selectedTier) {
        updatedAgents[index] = {
          ...updatedAgents[index],
          prompt_configurations: {
            ...updatedAgents[index].prompt_configurations,
            user_prompt: selectedTier.prompt,
          },
        };
      }
    }

    setAgents(updatedAgents);
  };

  const removeAgent = (index: number) => {
    setAgents(agents.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!groupName || !groupDescription || agents.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!languageModels || languageModels.length === 0) {
      toast.error(
        "Language models not loaded. Please wait a moment and try again."
      );
      return;
    }

    // Ensure we have a default LLM configuration
    const finalLlmConfigurations =
      llmConfigurations.length > 0
        ? llmConfigurations
        : [
            {
              language_model_id: languageModels[0].llm_id,
              temperature: 0.7,
              max_tokens: 1000,
            },
          ];

    const requestData: CreateAgentGroupRequest = {
      agent_group: {
        name: groupName,
        description: groupDescription,
        architecture,
        prompt_configurations: {
          system_prompt: systemPrompt,
        },
        advanced_coordination_settings: {
          coordination_parameters: {
            max_retries: maxRetries,
          },
          memory_context_sharing: {
            short_term_memory_window: shortTermMemoryWindow,
            memory_consolidation: {
              enabled: memoryConsolidationEnabled,
              llm_configuration_index: 0,
            },
          },
          performance_optimization: {},
        },
      },
      llm_configurations: finalLlmConfigurations,
      agents: agents.map((agent, index) => ({
        tier_id: agent.tier_id,
        llm_configuration_index: 0,
        name: agent.name,
        role: agent.role,
        personality: agent.personality,
        prompt_configurations: agent.prompt_configurations,
        capabilities: agent.capabilities,
      })),
      orchestration_configurations: {
        agents_configurations: agents.map((_, index) => ({
          agents_index: index,
          sub_agents: [],
        })),
      },
    };

    createMutation.mutate(requestData);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this agent group?")) {
      deleteMutation.mutate(groupId);
    }
  };

  if (tiersLoading || languageModelsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="4rem" />
      </div>
    );
  }

  // Always show the creation form permanently in the sidebar
  return (
    <div className="max-h-[90vh] bg-background text-foreground p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="size-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: themeColor }}
            >
              <Users className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create Agent Group</h1>
              <p className="text-muted-foreground">
                Create and configure multi-agent systems
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={resetForm}
            className="flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Clear Form
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="groupName" className="mb-2 block">
                    Group Name *
                  </Label>
                  <Input
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Customer Support Squad"
                  />
                </div>
                <div>
                  <Label htmlFor="architecture" className="mb-2 block">
                    Architecture *
                  </Label>
                  <Select
                    value={architecture}
                    onValueChange={setArchitecture}
                    width="w-full"
                    defaultLabel="Select Architecture"
                    selectItems={architectureOptions}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="groupDescription" className="mb-2 block">
                  Description *
                </Label>
                <Textarea
                  id="groupDescription"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Describe the purpose of this agent group..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="systemPrompt" className="mb-2 block">
                  System Prompt
                </Label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="System-wide instructions for agent coordination..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                Advanced Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxRetries" className="mb-2 block">
                    Max Retries
                  </Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min={1}
                    max={10}
                    value={maxRetries}
                    onChange={(e) =>
                      setMaxRetries(parseInt(e.target.value) || 3)
                    }
                    placeholder="3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum number of retry attempts for agent coordination
                  </p>
                </div>

                <div>
                  <Label htmlFor="memoryWindow" className="mb-2 block">
                    Short-term Memory Window
                  </Label>
                  <Input
                    id="memoryWindow"
                    type="number"
                    min={1}
                    max={100}
                    value={shortTermMemoryWindow}
                    onChange={(e) =>
                      setShortTermMemoryWindow(parseInt(e.target.value) || 10)
                    }
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of recent messages to keep in short-term memory
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label className="mb-1 block">Memory Consolidation</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable automatic consolidation of conversation memory
                  </p>
                </div>
                <Button
                  variant={memoryConsolidationEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setMemoryConsolidationEnabled(!memoryConsolidationEnabled)
                  }
                  style={
                    memoryConsolidationEnabled
                      ? { backgroundColor: themeColor }
                      : undefined
                  }
                >
                  {memoryConsolidationEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  Agents ({agents.length})
                </div>
                <Button onClick={addAgent} variant="outline" size="sm">
                  <Plus size={16} />
                  Add Agent
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No agents added yet</p>
                  <Button onClick={addAgent} className="mt-4">
                    <Plus size={16} />
                    Add First Agent
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {agents.map((agent, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Agent {index + 1}</h4>
                        <Button
                          onClick={() => removeAgent(index)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="mb-2 block">Agent Name *</Label>
                          <Input
                            value={agent.name}
                            onChange={(e) =>
                              updateAgent(index, "name", e.target.value)
                            }
                            placeholder="Triage Agent"
                          />
                        </div>
                        <div>
                          <Label className="mb-2 block">Role *</Label>
                          <Input
                            value={agent.role}
                            onChange={(e) =>
                              updateAgent(index, "role", e.target.value)
                            }
                            placeholder="triage"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <Label className="mb-2 block">Tier *</Label>
                        <Select
                          value={agent.tier_id}
                          onValueChange={(value) =>
                            updateAgent(index, "tier_id", value)
                          }
                          width="w-full"
                          defaultLabel="Select Tier"
                          selectItems={
                            tiers?.map((tier) => ({
                              value: tier.tier_id,
                              label: tier.name,
                            })) || []
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Selecting a tier will auto-populate the user prompt
                          below
                        </p>
                      </div>

                      <div className="mb-4">
                        <Label className="mb-2 block">User Prompt</Label>
                        <Textarea
                          value={agent.prompt_configurations.user_prompt}
                          onChange={(e) =>
                            updateAgent(
                              index,
                              "prompt_configurations.user_prompt",
                              e.target.value
                            )
                          }
                          placeholder="This will be auto-populated when you select a tier above..."
                          rows={4}
                        />
                        {agent.prompt_configurations.user_prompt && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Prompt auto-populated from selected tier, do not
                            edit.
                          </p>
                        )}
                      </div>

                      {/* Personality Configuration */}
                      <div className="mb-4 border-t pt-4">
                        <h4 className="font-medium mb-3">
                          Personality Configuration
                        </h4>

                        {/* Personality Traits */}
                        <div className="mb-4">
                          <Label className="mb-2 block">
                            Personality Traits
                          </Label>
                          <SpecialSelectionInput
                            values={agent.personality.traits}
                            options={suggestedTraits}
                            type="text"
                            name={`agent-${index}-traits`}
                            placeholder="Type or select traits..."
                            onChange={(updatedTraits) =>
                              updateAgent(
                                index,
                                "personality.traits",
                                updatedTraits
                              )
                            }
                            inputHelp="Add personality traits that define this agent's character"
                          />
                        </div>

                        {/* Personality Sliders */}
                        <div className="space-y-2">
                          <Label className="mb-2 block">
                            Personality Sliders
                          </Label>

                          <SliderComponent
                            selectedColor={themeColor}
                            label="💡 Creativity"
                            value={agent.personality.sliders.creativity}
                            onChange={(value) =>
                              updateAgent(
                                index,
                                "personality.sliders.creativity",
                                value
                              )
                            }
                            percentage={agent.personality.sliders.creativity}
                          />

                          <SliderComponent
                            selectedColor={themeColor}
                            label="🎭 Formality"
                            value={agent.personality.sliders.formality}
                            onChange={(value) =>
                              updateAgent(
                                index,
                                "personality.sliders.formality",
                                value
                              )
                            }
                            percentage={agent.personality.sliders.formality}
                          />

                          <SliderComponent
                            selectedColor={themeColor}
                            label="💬 Verbosity"
                            value={agent.personality.sliders.verbosity}
                            onChange={(value) =>
                              updateAgent(
                                index,
                                "personality.sliders.verbosity",
                                value
                              )
                            }
                            percentage={agent.personality.sliders.verbosity}
                          />

                          <SliderComponent
                            selectedColor={themeColor}
                            label="✨ Enthusiasm"
                            value={agent.personality.sliders.enthusiasm}
                            onChange={(value) =>
                              updateAgent(
                                index,
                                "personality.sliders.enthusiasm",
                                value
                              )
                            }
                            percentage={agent.personality.sliders.enthusiasm}
                          />

                          <SliderComponent
                            selectedColor={themeColor}
                            label="❤️ Empathy"
                            value={agent.personality.sliders.empathy}
                            onChange={(value) =>
                              updateAgent(
                                index,
                                "personality.sliders.empathy",
                                value
                              )
                            }
                            percentage={agent.personality.sliders.empathy}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2 block">Tools</Label>
                          <div className="space-y-2">
                            {toolOptions.map((tool) => (
                              <label
                                key={tool.value}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={agent.capabilities.tools.includes(
                                    tool.value
                                  )}
                                  onChange={(e) => {
                                    const tools = e.target.checked
                                      ? [
                                          ...agent.capabilities.tools,
                                          tool.value,
                                        ]
                                      : agent.capabilities.tools.filter(
                                          (t) => t !== tool.value
                                        );
                                    updateAgent(
                                      index,
                                      "capabilities.tools",
                                      tools
                                    );
                                  }}
                                />
                                <span className="text-sm">{tool.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="mb-2 block">Knowledge Bases</Label>
                          <div className="space-y-2">
                            {knowledgeBaseOptions.map((kb) => (
                              <label
                                key={kb.value}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={agent.capabilities.knowledge_bases.includes(
                                    kb.value
                                  )}
                                  onChange={(e) => {
                                    const kbs = e.target.checked
                                      ? [
                                          ...agent.capabilities.knowledge_bases,
                                          kb.value,
                                        ]
                                      : agent.capabilities.knowledge_bases.filter(
                                          (kb_val) => kb_val !== kb.value
                                        );
                                    updateAgent(
                                      index,
                                      "capabilities.knowledge_bases",
                                      kbs
                                    );
                                  }}
                                />
                                <span className="text-sm">{kb.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              style={{ backgroundColor: themeColor }}
              size="lg"
            >
              {createMutation.isPending ? (
                <>
                  <LoaderIcon size={16} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Create Agent Group
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentGroups;
