"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Users,
  Save,
  Trash,
  MessageSquare,
  Search,
  ChevronDown,
  Plus,
  Bot,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Select from "@/components/inputs/select-input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AgentGroupService } from "@/service/agent-groups";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { useThemeColor } from "@/providers/color-theme-provider";
import { SliderComponent } from "@/components/Slider";
import {
  AgentGroupSummary,
  LanguageModel,
  AgentGroupAgent,
} from "@/types/agent-group";
import { useAgentGroupContext } from "@/providers/agent-groups-provider";

// Types for personality configuration - matching API structure
interface PersonalitySliders {
  creativity: number;
  formality: number;
  verbosity: number;
  enthusiasm: number;
  empathy: number;
}

type TabType = "personality" | "prompts" | "language-models";

interface TabButtonProps {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  active: boolean;
  onClick: () => void;
}

interface AgentConfigurationProps {
  selectedGroupId?: string | null;
  onDeleteGroup?: () => void;
}

// Agent Group Selector Component - exact copy from Settings.tsx AgentSelector
const AgentGroupSelector: React.FC<{
  agentGroups: AgentGroupSummary[];
  selectedGroup: AgentGroupSummary | null;
  onSelectGroup: (group: AgentGroupSummary) => void;
  selectedColor: string;
}> = ({ agentGroups, selectedGroup, selectedColor, onSelectGroup }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroups = Array.isArray(agentGroups)
    ? agentGroups.filter(
        (group) =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center gap-2 px-4 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors w-full z-1 border h-10"
      >
        {selectedGroup ? (
          <>
            <Users className="size-5" />
            <span className="text-nowrap truncate">{selectedGroup.name}</span>
          </>
        ) : (
          <>
            <Plus className="size-5" />
            <span>Select Agent Group</span>
          </>
        )}
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg shadow-lg z-40 w-full mt-1">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search agent groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredGroups.length > 0 ? (
              <div className="p-1">
                {filteredGroups.map((group) => (
                  <button
                    key={group.group_id}
                    onClick={() => {
                      onSelectGroup(group);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full p-3 text-left hover:bg-accent transition-colors rounded-md mb-1 last:mb-0"
                    )}
                    style={
                      selectedGroup?.group_id == group.group_id
                        ? {
                            borderColor: selectedColor,
                            background: `${selectedColor}33`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Users
                        size={16}
                        className="text-muted-foreground flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate">
                          {group.name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {group.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {group.num_agents} agents • {group.architecture}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No agent groups found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Agent Selector Component - similar to AgentGroupSelector
const AgentSelector: React.FC<{
  agents: AgentGroupAgent[];
  selectedAgent: AgentGroupAgent | null;
  onSelectAgent: (agent: AgentGroupAgent, index: number) => void;
  selectedColor: string;
}> = ({ agents, selectedAgent, selectedColor, onSelectAgent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAgents = Array.isArray(agents)
    ? agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center gap-2 px-4 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors w-full z-1 border h-10"
      >
        {selectedAgent ? (
          <>
            <Bot className="size-5" />
            <span className="text-nowrap truncate">{selectedAgent.name}</span>
          </>
        ) : (
          <>
            <Plus className="size-5" />
            <span>Select Agent</span>
          </>
        )}
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg shadow-lg z-40 w-full mt-1">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredAgents.length > 0 ? (
              <div className="p-1">
                {filteredAgents.map((agent, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSelectAgent(agent, index);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full p-3 text-left hover:bg-accent transition-colors rounded-md mb-1 last:mb-0"
                    )}
                    style={
                      selectedAgent?.name === agent.name
                        ? {
                            borderColor: selectedColor,
                            background: `${selectedColor}33`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Bot className="size-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate">
                          {agent.name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {agent.role}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          Tier: {agent.tier.name} •{" "}
                          {agent.personality.traits.join(", ")}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No agents found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
  selectedGroupId: initialGroupId,
  onDeleteGroup,
}) => {
  const { themeColor, setThemeColor } = useThemeColor();
  const queryClient = useQueryClient();

  // Try to use agent group context, but fallback to direct API if not available
  let agentGroupContext: any = null;
  try {
    agentGroupContext = useAgentGroupContext();
  } catch {
    // Provider not available, use direct API approach
  }

  // State for selected agent group and agents
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialGroupId || ""
  );
  const [selectedAgent, setSelectedAgent] = useState<AgentGroupAgent | null>(
    null
  );
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number>(0);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("personality");

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Language model configuration state
  const [llmConfigurations, setLlmConfigurations] = useState({
    temperature: 0.7,
    maxTokens: 1000,
    languageModel: "",
  });

  // Personality configuration state
  // Personality configuration state - values populated from API when agent is selected
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [personalitySliders, setPersonalitySliders] =
    useState<PersonalitySliders>({
      creativity: 50,
      formality: 50,
      verbosity: 50,
      enthusiasm: 50,
      empathy: 50,
    });

  // Prompt configuration state
  const [promptConfigurations, setPromptConfigurations] = useState({
    systemPrompt: "",
    userPrompt: "",
  });

  // Queries - Always refetch when component mounts to get latest data
  const {
    data: agentGroupsResponse,
    isLoading: agentGroupsLoading,
    refetch: refetchAgentGroups,
  } = useQuery({
    queryKey: ["agent-groups"],
    queryFn: () => AgentGroupService.getAgentGroups(),
    staleTime: 0, // Always consider data stale
    refetchOnMount: "always", // Always refetch when component mounts
  });

  const { data: languageModels, isLoading: languageModelsLoading } = useQuery({
    queryKey: ["language-models"],
    queryFn: AgentGroupService.getLanguageModels,
  });

  // Query for agent group details when a group is selected
  const { data: agentGroupDetails, isLoading: agentGroupDetailsLoading } =
    useQuery({
      queryKey: ["agent-group-details", selectedGroupId],
      queryFn: () => AgentGroupService.getAgentGroup(selectedGroupId),
      enabled: !!selectedGroupId,
    });

  // Transform data for dropdowns - use provider context if available, otherwise API
  const agentGroups =
    agentGroupContext?.agentGroups || agentGroupsResponse?.data?.items || [];

  // Get agents from agent group details
  const agents = agentGroupDetails?.data?.agents || [];

  // Get selected agent group data
  const selectedGroup = agentGroups.find(
    (group: AgentGroupSummary) => group.group_id === selectedGroupId
  );

  const languageModelOptions =
    languageModels?.map((model: LanguageModel) => ({
      value: model.llm_id,
      label: `${model.provider} - ${model.model_name}`,
    })) || [];

  // Update selected group when prop changes and wait for agent groups to load
  useEffect(() => {
    if (initialGroupId && !agentGroupsLoading) {
      setSelectedGroupId(initialGroupId);
    }
  }, [initialGroupId, agentGroupsLoading]);

  // Auto-populate all configurations when an agent is selected
  useEffect(() => {
    if (selectedAgent && agentGroupDetails?.data) {
      const groupData = agentGroupDetails.data;

      // Populate prompts
      setPromptConfigurations({
        systemPrompt:
          groupData.agent_group?.prompt_configurations?.system_prompt || "",
        userPrompt: selectedAgent.prompt_configurations?.user_prompt || "",
      });

      // Update personality sliders from agent data (using API structure)
      if (selectedAgent.personality?.sliders) {
        setPersonalitySliders({
          creativity: selectedAgent.personality.sliders.creativity || 50,
          formality: selectedAgent.personality.sliders.formality || 70,
          verbosity: selectedAgent.personality.sliders.verbosity || 50,
          enthusiasm: selectedAgent.personality.sliders.enthusiasm || 50,
          empathy: selectedAgent.personality.sliders.empathy || 70,
        });
      }

      // Update personality traits
      if (selectedAgent.personality?.traits) {
        setPersonalityTraits(selectedAgent.personality.traits);
      }

      // Populate LLM configurations from the agent's llm_configuration_index
      const llmConfigIndex = selectedAgent.llm_configuration_index;
      const llmConfigs = groupData.llm_configurations;

      if (llmConfigs && llmConfigs[llmConfigIndex]) {
        const llmConfig = llmConfigs[llmConfigIndex];
        setLlmConfigurations({
          temperature: llmConfig.temperature,
          maxTokens: llmConfig.max_tokens,
          languageModel: llmConfig.language_model.llm_id,
        });
      }
    }
  }, [selectedAgent, agentGroupDetails]);

  // Reset selected agent when group changes
  useEffect(() => {
    setSelectedAgent(null);
  }, [selectedGroupId]);

  const handleDeleteGroup = async () => {
    if (!selectedGroupId) {
      toast.error("No agent group selected");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await AgentGroupService.deleteAgentGroup(
        selectedGroupId
      );

      if (response.status === 204 || response.status === 200) {
        toast.success("Agent group deleted successfully!");

        // Invalidate and refetch agent groups to update the cache
        await queryClient.invalidateQueries({ queryKey: ["agent-groups"] });

        // Reset state
        setSelectedGroupId("");
        setSelectedAgent(null);
        setSelectedAgentIndex(0);

        // Call the callback to navigate back to agent groups
        if (onDeleteGroup) {
          onDeleteGroup();
        }
      } else {
        toast.error(response.error || "Failed to delete agent group");
      }
    } catch (error) {
      console.error("Error deleting agent group:", error);
      toast.error("An error occurred while deleting the agent group");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!selectedGroupId || !agentGroupDetails?.data) {
      toast.error("Please select an agent group first");
      return;
    }

    setIsSaving(true);

    try {
      // Only update the system prompt in agent_group
      const updatePayload = {
        agent_group: {
          ...agentGroupDetails.data.agent_group,
          prompt_configurations: {
            system_prompt: promptConfigurations.systemPrompt,
          },
        },
        llm_configurations: agentGroupDetails.data.llm_configurations.map(
          (config) => ({
            language_model_id: config.language_model.llm_id,
            temperature: config.temperature,
            max_tokens: config.max_tokens,
          })
        ),
        agents: agentGroupDetails.data.agents.map((agent) => ({
          tier_id: agent.tier.tier_id,
          llm_configuration_index: agent.llm_configuration_index,
          name: agent.name,
          role: agent.role,
          personality: agent.personality,
          prompt_configurations: agent.prompt_configurations,
          capabilities: agent.capabilities,
        })),
        orchestration_configurations:
          agentGroupDetails.data.orchestration_configurations,
      };

      const response = await AgentGroupService.updateAgentGroup(
        selectedGroupId,
        updatePayload
      );

      if (response.status === 200) {
        toast.success("System prompt updated successfully!");
        // Invalidate queries to refetch fresh data without page reload
        await queryClient.invalidateQueries({
          queryKey: ["agent-group-details", selectedGroupId],
        });
      } else {
        toast.error(response.error || "Failed to update configuration");
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("An error occurred while saving configuration");
    } finally {
      setIsSaving(false);
    }
  };

  // Personality management functions
  const updateSlider = (key: keyof PersonalitySliders, value: number): void => {
    setPersonalitySliders((prev) => ({ ...prev, [key]: value }));
  };

  // Tab Button Component
  const TabButton: React.FC<TabButtonProps> = ({
    label,
    icon: Icon,
    active,
    onClick,
  }) => (
    <button
      onClick={onClick}
      className={`cursor-pointer flex items-center gap-2 px-4 py-3 rounded-t-sm transition-all ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      }`}
      style={
        active
          ? {
              backgroundColor: themeColor,
            }
          : undefined
      }
    >
      <Icon size={18} />
      <span className="font-medium max-md:sr-only">{label}</span>
    </button>
  );

  // Show minimal loading state when initial data is loading
  const isInitialLoading = agentGroupsLoading || languageModelsLoading;

  return (
    <div className="h-[90vh] bg-background text-foreground relative">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className="size-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: themeColor }}
              >
                <Brain className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Agent Configuration</h1>
                <p className="text-muted-foreground">
                  {isInitialLoading
                    ? "Loading..."
                    : "Configure your agent groups and individual agents"}
                </p>
              </div>
            </div>
            {selectedAgent && (
              <Button
                onClick={handleSaveConfiguration}
                disabled={isSaving || !selectedAgent}
                style={{ backgroundColor: themeColor }}
                size="lg"
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Configuration
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Agent Group Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Select Agent Group
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-visible">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Agent Group</Label>

                  {isInitialLoading ? (
                    <div className="flex items-center justify-center h-10 border rounded-lg">
                      <Loader2 size={16} className="animate-spin mr-2" />
                      <span className="text-muted-foreground text-sm">
                        Loading agent groups...
                      </span>
                    </div>
                  ) : agentGroups.length > 0 ? (
                    <AgentGroupSelector
                      agentGroups={agentGroups}
                      selectedGroup={selectedGroup || null}
                      onSelectGroup={(group) =>
                        setSelectedGroupId(group.group_id)
                      }
                      selectedColor={themeColor}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-10 border rounded-lg">
                      <span className="text-muted-foreground text-sm">
                        No agent groups available
                      </span>
                    </div>
                  )}
                </div>

                {selectedGroupId && agentGroupDetailsLoading ? (
                  <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading group details...
                    </span>
                  </div>
                ) : selectedGroup ? (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{selectedGroup.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedGroup.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                        Architecture:{" "}
                        <strong>{selectedGroup.architecture}</strong>
                      </span>
                      <span>
                        Agents: <strong>{selectedGroup.num_agents}</strong>
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Agent Selection - Only show when a group is selected and not in initial loading */}
          {selectedGroupId && !isInitialLoading && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot size={20} />
                  Select Agent to Configure
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-visible">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Agent</Label>
                    {agentGroupDetailsLoading ? (
                      <div className="flex items-center justify-center h-10 border rounded-lg">
                        <Loader2 size={16} className="animate-spin mr-2" />
                        <span className="text-muted-foreground text-sm">
                          Loading agents...
                        </span>
                      </div>
                    ) : agents.length > 0 ? (
                      <AgentSelector
                        agents={agents}
                        selectedAgent={selectedAgent}
                        onSelectAgent={(agent, index) => {
                          setSelectedAgent(agent);
                          setSelectedAgentIndex(index);
                        }}
                        selectedColor={themeColor}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-10 border rounded-lg">
                        <span className="text-muted-foreground text-sm">
                          No agents found in this group
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedAgent && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">{selectedAgent.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Role: <strong>{selectedAgent.role}</strong>
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          Tier: <strong>{selectedAgent.tier.name}</strong>
                        </span>
                        <span>
                          Traits:{" "}
                          <strong>
                            {selectedAgent.personality.traits.join(", ")}
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Configuration Area with Tabs */}
          {selectedAgent && (
            <Card>
              <CardContent className="p-6">
                {/* Tab Navigation */}
                <div className="flex mb-6 border-b gap-2">
                  <TabButton
                    label="Personality"
                    icon={Users}
                    active={activeTab === "personality"}
                    onClick={() => setActiveTab("personality")}
                  />
                  <TabButton
                    label="Prompts"
                    icon={MessageSquare}
                    active={activeTab === "prompts"}
                    onClick={() => setActiveTab("prompts")}
                  />
                  <TabButton
                    label="Language Models"
                    icon={Brain}
                    active={activeTab === "language-models"}
                    onClick={() => setActiveTab("language-models")}
                  />
                </div>

                {/* Tab Content */}
                {activeTab === "personality" && (
                  <div className="space-y-6">
                    {/* Personality Traits */}
                    <div className="border-b w-full pb-6">
                      <h3 className="font-medium mb-4">Personality Traits</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {personalityTraits.map((trait) => (
                          <span
                            key={trait}
                            className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                            style={{
                              background: `${themeColor}88`,
                            }}
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Personality Sliders */}
                    <div>
                      <h3 className="font-medium mb-4">Personality Sliders</h3>
                      <SliderComponent
                        selectedColor={themeColor}
                        label="💡 Creativity"
                        value={personalitySliders.creativity}
                        onChange={(value) => updateSlider("creativity", value)}
                        percentage={personalitySliders.creativity}
                      />
                      <SliderComponent
                        selectedColor={themeColor}
                        label="🎭 Formality"
                        value={personalitySliders.formality}
                        onChange={(value) => updateSlider("formality", value)}
                        percentage={personalitySliders.formality}
                      />
                      <SliderComponent
                        selectedColor={themeColor}
                        label="💬 Verbosity"
                        value={personalitySliders.verbosity}
                        onChange={(value) => updateSlider("verbosity", value)}
                        percentage={personalitySliders.verbosity}
                      />
                      <SliderComponent
                        selectedColor={themeColor}
                        label="✨ Enthusiasm"
                        value={personalitySliders.enthusiasm}
                        onChange={(value) => updateSlider("enthusiasm", value)}
                        percentage={personalitySliders.enthusiasm}
                      />
                      <SliderComponent
                        selectedColor={themeColor}
                        label="❤️ Empathy"
                        value={personalitySliders.empathy}
                        onChange={(value) => updateSlider("empathy", value)}
                        percentage={personalitySliders.empathy}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "prompts" && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="systemPrompt" className="mb-2 block">
                        System Prompt
                      </Label>
                      <Textarea
                        id="systemPrompt"
                        value={promptConfigurations.systemPrompt}
                        onChange={(e) =>
                          setPromptConfigurations((prev) => ({
                            ...prev,
                            systemPrompt: e.target.value,
                          }))
                        }
                        placeholder={
                          selectedAgent
                            ? `System prompt from ${selectedGroup?.name} (auto-populated)`
                            : "Enter system-wide prompt instructions..."
                        }
                        rows={4}
                      />
                      {selectedAgent && promptConfigurations.systemPrompt && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ✓ Auto-populated from agent group "
                          {selectedGroup?.name}"
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="userPrompt" className="mb-2 block">
                        User Prompt
                      </Label>
                      <Textarea
                        id="userPrompt"
                        value={promptConfigurations.userPrompt}
                        onChange={(e) =>
                          setPromptConfigurations((prev) => ({
                            ...prev,
                            userPrompt: e.target.value,
                          }))
                        }
                        placeholder={
                          selectedAgent
                            ? `User prompt for ${selectedAgent.name} (auto-populated from tier)`
                            : "Configure specific user prompts for selected agent..."
                        }
                        rows={6}
                      />
                      {selectedAgent && promptConfigurations.userPrompt && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ✓ Auto-populated from agent "{selectedAgent.name}"
                          tier configuration
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "language-models" && (
                  <div className="space-y-6">
                    <div>
                      <Label className="mb-2 block">Language Model</Label>
                      <Select
                        value={llmConfigurations.languageModel}
                        onValueChange={(value) =>
                          setLlmConfigurations((prev) => ({
                            ...prev,
                            languageModel: value,
                          }))
                        }
                        width="w-full"
                        defaultLabel={
                          languageModelsLoading
                            ? "Loading models..."
                            : "Select a language model"
                        }
                        selectItems={languageModelOptions}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-2 block">Temperature</Label>
                        <SliderComponent
                          selectedColor={themeColor}
                          label=""
                          value={llmConfigurations.temperature * 100}
                          onChange={(value) =>
                            setLlmConfigurations((prev) => ({
                              ...prev,
                              temperature: value / 100,
                            }))
                          }
                          percentage={llmConfigurations.temperature * 100}
                        />
                        <div className="text-sm text-muted-foreground mt-1">
                          Current: {llmConfigurations.temperature}
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Max Tokens</Label>
                        <Input
                          type="number"
                          value={llmConfigurations.maxTokens}
                          onChange={(e) =>
                            setLlmConfigurations((prev) => ({
                              ...prev,
                              maxTokens: parseInt(e.target.value) || 1000,
                            }))
                          }
                          min={100}
                          max={4000}
                          step={100}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          {selectedGroupId && (
            <Card className="bg-card border border-destructive mt-6">
              <CardHeader>
                <CardTitle className="text-destructive-foreground font-medium">
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Deleting this agent group will permanently remove all
                    agents, configurations, and chat history associated with it.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        size="lg"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash size={16} className="mr-2" />
                            Delete Agent Group
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the agent group
                          <strong className="text-foreground">
                            {" "}
                            "{selectedGroup?.name}"
                          </strong>{" "}
                          and remove all associated data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteGroup}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AgentConfiguration;
