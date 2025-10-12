"use client";

import React, { useReducer, useCallback, useEffect } from 'react';
import {
  Settings, MessageSquare, User as UserIcon,
  ChevronDown, Network, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AgentGroupService } from "@/service/agent-groups";
import { toast } from "sonner";
import { SliderComponent } from "@/components/Slider";
import { useThemeColor } from "@/providers/color-theme-provider";
import {
  AgentGroupSummary,
  AgentGroupAgent,
} from "@/types/agent-group";
import PromptBuilder from './PromptBuilder';
import DeleteAgentGroup from './DeleteAgentGroup';

type Tab = 'prompts' | 'personality' | 'advanced';

// State interface
interface ConfigurationState {
  selectedGroupId: string;
  selectedAgent: AgentGroupAgent | null;
  activeTab: Tab;
  showAgentConnections: boolean;
  // Prompt states
  systemPrompt: string;
  userPrompt: string;
  selectedTierId: string;
  // Personality states
  personalityTraits: string[];
  creativitySlider: number;
  formalitySlider: number;
  verbositySlider: number;
  enthusiasmSlider: number;
  empathySlider: number;
  // Advanced states
  languageModelId: string;
  temperature: number;
  maxTokens: number;
}

// Action types
type ConfigurationAction =
  | { type: 'SET_SELECTED_GROUP'; payload: string }
  | { type: 'SET_SELECTED_AGENT'; payload: AgentGroupAgent | null }
  | { type: 'SET_ACTIVE_TAB'; payload: Tab }
  | { type: 'TOGGLE_AGENT_CONNECTIONS' }
  | { type: 'SET_SYSTEM_PROMPT'; payload: string }
  | { type: 'SET_USER_PROMPT'; payload: string }
  | { type: 'SET_SELECTED_TIER'; payload: { tierId: string; tierPrompt: string } }
  | { type: 'SET_PERSONALITY_TRAITS'; payload: string[] }
  | { type: 'SET_CREATIVITY_SLIDER'; payload: number }
  | { type: 'SET_FORMALITY_SLIDER'; payload: number }
  | { type: 'SET_VERBOSITY_SLIDER'; payload: number }
  | { type: 'SET_ENTHUSIASM_SLIDER'; payload: number }
  | { type: 'SET_EMPATHY_SLIDER'; payload: number }
  | { type: 'SET_LANGUAGE_MODEL'; payload: string }
  | { type: 'SET_TEMPERATURE'; payload: number }
  | { type: 'SET_MAX_TOKENS'; payload: number }
  | { type: 'LOAD_AGENT_DATA'; payload: { agent: AgentGroupAgent; groupData: any; tiers: any[] } }
  | { type: 'RESET_AGENT_SELECTION' };

// Reducer function
const configurationReducer = (state: ConfigurationState, action: ConfigurationAction): ConfigurationState => {
  switch (action.type) {
    case 'SET_SELECTED_GROUP':
      return { ...state, selectedGroupId: action.payload };

    case 'SET_SELECTED_AGENT':
      return { ...state, selectedAgent: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'TOGGLE_AGENT_CONNECTIONS':
      return { ...state, showAgentConnections: !state.showAgentConnections };

    case 'SET_SYSTEM_PROMPT':
      return { ...state, systemPrompt: action.payload };

    case 'SET_USER_PROMPT':
      return { ...state, userPrompt: action.payload };

    case 'SET_SELECTED_TIER':
      return {
        ...state,
        selectedTierId: action.payload.tierId,
        userPrompt: action.payload.tierPrompt
      };

    case 'SET_PERSONALITY_TRAITS':
      return { ...state, personalityTraits: action.payload };

    case 'SET_CREATIVITY_SLIDER':
      return { ...state, creativitySlider: action.payload };

    case 'SET_FORMALITY_SLIDER':
      return { ...state, formalitySlider: action.payload };

    case 'SET_VERBOSITY_SLIDER':
      return { ...state, verbositySlider: action.payload };

    case 'SET_ENTHUSIASM_SLIDER':
      return { ...state, enthusiasmSlider: action.payload };

    case 'SET_EMPATHY_SLIDER':
      return { ...state, empathySlider: action.payload };

    case 'SET_LANGUAGE_MODEL':
      return { ...state, languageModelId: action.payload };

    case 'SET_TEMPERATURE':
      return { ...state, temperature: action.payload };

    case 'SET_MAX_TOKENS':
      return { ...state, maxTokens: action.payload };

    case 'LOAD_AGENT_DATA':
      const llmConfigIndex = action.payload.agent.llm_configuration_index;
      const llmConfigs = action.payload.groupData.llm_configurations;
      const llmConfig = llmConfigs && llmConfigs[llmConfigIndex] ? llmConfigs[llmConfigIndex] : null;

      // Get existing user prompt or fallback to tier prompt
      const existingUserPrompt = action.payload.agent.prompt_configurations?.user_prompt;
      const tierPrompt = action.payload.tiers?.find((t: any) => t.tier_id === action.payload.agent.tier?.tier_id)?.prompt || "";

      return {
        ...state,
        selectedAgent: action.payload.agent,
        systemPrompt: action.payload.groupData.agent_group?.prompt_configurations?.system_prompt || "",
        userPrompt: existingUserPrompt || tierPrompt,
        selectedTierId: action.payload.agent.tier?.tier_id || "",
        personalityTraits: action.payload.agent.personality?.traits || [],
        creativitySlider: action.payload.agent.personality?.sliders?.creativity || 50,
        formalitySlider: action.payload.agent.personality?.sliders?.formality || 70,
        verbositySlider: action.payload.agent.personality?.sliders?.verbosity || 40,
        enthusiasmSlider: action.payload.agent.personality?.sliders?.enthusiasm || 30,
        empathySlider: action.payload.agent.personality?.sliders?.empathy || 60,
        languageModelId: llmConfig?.language_model?.llm_id || "",
        temperature: llmConfig?.temperature || 0.7,
        maxTokens: llmConfig?.max_tokens || 2000,
      };

    case 'RESET_AGENT_SELECTION':
      return {
        ...state,
        selectedAgent: null,
        systemPrompt: "",
        userPrompt: "",
        selectedTierId: "",
        personalityTraits: [],
        creativitySlider: 50,
        formalitySlider: 70,
        verbositySlider: 40,
        enthusiasmSlider: 30,
        empathySlider: 60,
        languageModelId: "",
        temperature: 0.7,
        maxTokens: 2000,
      };

    default:
      return state;
  }
};

// Initial state
const initialState: ConfigurationState = {
  selectedGroupId: "",
  selectedAgent: null,
  activeTab: 'prompts',
  showAgentConnections: false,
  systemPrompt: "",
  userPrompt: "",
  selectedTierId: "",
  personalityTraits: [],
  creativitySlider: 50,
  formalitySlider: 70,
  verbositySlider: 40,
  enthusiasmSlider: 30,
  empathySlider: 60,
  languageModelId: "",
  temperature: 0.7,
  maxTokens: 2000,
};

const AgentConfiguration: React.FC<{ selectedGroupId?: string | null; onDeleteGroup?: () => void; onCreateGroup?: () => void }> = ({
  selectedGroupId: initialGroupId,
  onDeleteGroup,
  onCreateGroup
}) => {
  const { themeColor } = useThemeColor();
  const queryClient = useQueryClient();

  // Initialize state with initialGroupId if provided
  const [state, dispatch] = useReducer(configurationReducer, {
    ...initialState,
    selectedGroupId: initialGroupId || "",
  });

  // Queries
  const {
    data: agentGroupsResponse,
  } = useQuery({
    queryKey: ["agent-groups"],
    queryFn: () => AgentGroupService.getAgentGroups(),
  });

  const { data: agentGroupDetails } = useQuery({
    queryKey: ["agent-group-details", state.selectedGroupId],
    queryFn: () => AgentGroupService.getAgentGroup(state.selectedGroupId),
    enabled: !!state.selectedGroupId,
  });

  const { data: tiers } = useQuery({
    queryKey: ["tiers"],
    queryFn: AgentGroupService.getTiers,
  });

  const { data: languageModels } = useQuery({
    queryKey: ["language-models"],
    queryFn: AgentGroupService.getLanguageModels,
  });

  const agentGroups = agentGroupsResponse?.data?.items || [];
  const agents = agentGroupDetails?.data?.agents || [];
  const selectedGroup = agentGroups.find(
    (group: AgentGroupSummary) => group.group_id === state.selectedGroupId
  );

  // Load agent data when selected (keep useEffect for data loading from API)
  useEffect(() => {
    if (state.selectedAgent && agentGroupDetails?.data && tiers) {
      dispatch({
        type: 'LOAD_AGENT_DATA',
        payload: {
          agent: state.selectedAgent,
          groupData: agentGroupDetails.data,
          tiers: tiers,
        },
      });
    }
  }, [state.selectedAgent?.name, agentGroupDetails?.data, tiers]); // Use name to prevent infinite loop

  // Memoized handlers
  const handleGroupChange = useCallback((groupId: string) => {
    dispatch({ type: 'SET_SELECTED_GROUP', payload: groupId });
    dispatch({ type: 'RESET_AGENT_SELECTION' });
  }, []);

  const handleAgentChange = useCallback((agentName: string) => {
    const agent = agents.find((a: AgentGroupAgent) => a.name === agentName);
    dispatch({ type: 'SET_SELECTED_AGENT', payload: agent || null });
  }, [agents]);

  const handleTierChange = useCallback((tierId: string) => {
    const selectedTier = tiers?.find(tier => tier.tier_id === tierId);
    if (selectedTier) {
      dispatch({
        type: 'SET_SELECTED_TIER',
        payload: {
          tierId: selectedTier.tier_id,
          tierPrompt: selectedTier.prompt
        }
      });
    }
  }, [tiers]);

  const handleSavePrompts = useCallback(async () => {
    if (!state.selectedGroupId || !agentGroupDetails?.data) {
      toast.error("No agent group selected");
      return;
    }

    try {
      const updatePayload = {
        agent_group: {
          ...agentGroupDetails.data.agent_group,
          prompt_configurations: {
            system_prompt: state.systemPrompt,
          },
        },
        llm_configurations: agentGroupDetails.data.llm_configurations.map(
          (config: any) => ({
            language_model_id: config.language_model.llm_id,
            temperature: config.temperature,
            max_tokens: config.max_tokens,
          })
        ),
        agents: agentGroupDetails.data.agents.map((agent: AgentGroupAgent) => {
          // If this is the selected agent, use the state values
          if (agent.name === state.selectedAgent?.name) {
            return {
              tier_id: state.selectedTierId || agent.tier.tier_id,
              llm_configuration_index: agent.llm_configuration_index,
              name: agent.name,
              role: agent.role,
              personality: agent.personality,
              prompt_configurations: {
                user_prompt: state.userPrompt,
              },
              capabilities: agent.capabilities,
            };
          }
          // Otherwise, keep the original agent data
          return {
            tier_id: agent.tier.tier_id,
            llm_configuration_index: agent.llm_configuration_index,
            name: agent.name,
            role: agent.role,
            personality: agent.personality,
            prompt_configurations: agent.prompt_configurations,
            capabilities: agent.capabilities,
          };
        }),
        orchestration_configurations:
          agentGroupDetails.data.orchestration_configurations,
      };

      const response = await AgentGroupService.updateAgentGroup(
        state.selectedGroupId,
        updatePayload
      );

      if (response.status === 200) {
        toast.success("Prompts saved successfully!");
        await queryClient.invalidateQueries({
          queryKey: ["agent-group-details", state.selectedGroupId],
        });
      } else {
        toast.error("Failed to save prompts");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }, [state.selectedGroupId, state.systemPrompt, state.userPrompt, state.selectedTierId, state.selectedAgent?.name, agentGroupDetails, queryClient]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-[90vh]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Agent Group Selection */}
          <div>
            <Label className="mb-2 block">Agent Group</Label>
            {agentGroups.length > 0 ? (
              <Select
                value={state.selectedGroupId}
                onValueChange={handleGroupChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a group..." />
                </SelectTrigger>
                <SelectContent>
                  {agentGroups.map((group: AgentGroupSummary) => (
                    <SelectItem key={group.group_id} value={group.group_id}>
                      {group.name} ({group.architecture})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-full h-10 rounded-md border px-3 bg-muted flex items-center justify-center text-sm text-muted-foreground">
                No agent groups available
              </div>
            )}
          </div>

          {/* Selected Agent */}
          {state.selectedGroupId && agents.length > 0 && (
            <div>
              <Label className="mb-2 block">Selected Agent</Label>
              <Select
                value={state.selectedAgent?.name || ""}
                onValueChange={handleAgentChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select agent..." />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent: AgentGroupAgent) => (
                    <SelectItem key={agent.name} value={agent.name}>
                      {agent.name} ({agent.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Agent Details */}
          {state.selectedAgent && (
            <div className="border rounded-lg p-6 bg-card space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{state.selectedAgent.name}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                    Role: {state.selectedAgent.role}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                    Type: {state.selectedAgent.tier?.name || 'orchestrator'}
                  </span>
                  <span className="text-muted-foreground">
                    Architecture: {selectedGroup?.architecture} Architecture
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">Tiers: </span>
                  {state.selectedAgent.tier?.tier_id ? (
                    <span className="text-sm">Tier assigned</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">No tiers assigned</span>
                  )}
                </div>
              </div>

              {/* View Agent Connections */}
              <button
                onClick={() => dispatch({ type: 'TOGGLE_AGENT_CONNECTIONS' })}
                className="flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <Network className="w-4 h-4" />
                View Agent Connections - See how {state.selectedAgent.name} connects with other agents
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${state.showAgentConnections ? 'rotate-180' : ''}`} />
              </button>

              {/* Tabs */}
              <div className="flex gap-2 border-b">
                <button
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'prompts' })}
                  className={`px-6 py-3 font-medium transition-colors ${
                    state.activeTab === 'prompts'
                      ? 'border-b-2 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={state.activeTab === 'prompts' ? { borderColor: themeColor, color: themeColor } : undefined}
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Prompts
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'personality' })}
                  className={`px-6 py-3 font-medium transition-colors ${
                    state.activeTab === 'personality'
                      ? 'border-b-2 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={state.activeTab === 'personality' ? { borderColor: themeColor, color: themeColor } : undefined}
                >
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  Personality
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'advanced' })}
                  className={`px-6 py-3 font-medium transition-colors ${
                    state.activeTab === 'advanced'
                      ? 'border-b-2 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={state.activeTab === 'advanced' ? { borderColor: themeColor, color: themeColor } : undefined}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Advanced
                </button>
              </div>

              {/* Tab Content */}
              {state.activeTab === 'prompts' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center justify-between">
                      Agent Prompts Configuration
                      <Button onClick={handleSavePrompts} className="gap-2" style={{ backgroundColor: themeColor }}>
                        <Save className="w-4 h-4" />
                        Save Prompts
                      </Button>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>System Prompt</Label>
                          <span className="text-xs text-purple-600">Group-Level (Shared by ALL agents in {selectedGroup?.name})</span>
                        </div>
                        <Textarea
                          value={state.systemPrompt}
                          onChange={(e) => dispatch({ type: 'SET_SYSTEM_PROMPT', payload: e.target.value })}
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="text-blue-600 mt-0.5">ℹ️</div>
                          <div className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>System Prompt (Enhanced with Tiers):</strong> This prompt includes architecture coordination, tier-specific behaviors, and orchestrator instructions. It automatically adapts based on agent tiers and roles.
                          </div>
                        </div>

                        <div className="mt-4">
                          <PromptBuilder
                            onGenerate={(prompt) => dispatch({ type: 'SET_USER_PROMPT', payload: prompt })}
                            agentName={state.selectedAgent.name}
                            agentRole={state.selectedAgent.role}
                            architecture={selectedGroup?.architecture}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Tier Assignment</Label>
                          <span className="text-xs text-amber-600">Select a tier to auto-fill the user prompt</span>
                        </div>
                        <Select
                          value={state.selectedTierId}
                          onValueChange={handleTierChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a tier" />
                          </SelectTrigger>
                          <SelectContent>
                            {tiers?.map((tier) => (
                              <SelectItem key={tier.tier_id} value={tier.tier_id}>
                                {tier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>User Prompt</Label>
                          <span className="text-xs text-green-600">Agent-Specific (Only for {state.selectedAgent.name})</span>
                        </div>
                        <Textarea
                          value={state.userPrompt}
                          onChange={(e) => dispatch({ type: 'SET_USER_PROMPT', payload: e.target.value })}
                          rows={10}
                          className="font-mono text-sm"
                        />
                        <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="text-blue-600 mt-0.5">ℹ️</div>
                          <div className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>User Prompt:</strong> This prompt is unique to {state.selectedAgent.name}. Use the Prompt Builder above to generate a customized prompt, or write your own directly here.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {state.activeTab === 'personality' && (
                <div className="space-y-6">
                  <h3 className="font-semibold">Personality Configuration</h3>

                  <div>
                    <Label className="mb-3 block">Personality Traits</Label>
                    <div className="flex flex-wrap gap-2">
                      {state.personalityTraits.map((trait) => (
                        <span key={trait} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-4 block">Personality Sliders</Label>
                    <div className="space-y-6">
                      <SliderComponent
                        selectedColor={themeColor}
                        label="Creativity"
                        value={state.creativitySlider}
                        onChange={(value) => dispatch({ type: 'SET_CREATIVITY_SLIDER', payload: value })}
                        percentage={state.creativitySlider}
                      />

                      <SliderComponent
                        selectedColor={themeColor}
                        label="Formality"
                        value={state.formalitySlider}
                        onChange={(value) => dispatch({ type: 'SET_FORMALITY_SLIDER', payload: value })}
                        percentage={state.formalitySlider}
                      />

                      <SliderComponent
                        selectedColor={themeColor}
                        label="Verbosity"
                        value={state.verbositySlider}
                        onChange={(value) => dispatch({ type: 'SET_VERBOSITY_SLIDER', payload: value })}
                        percentage={state.verbositySlider}
                      />

                      <SliderComponent
                        selectedColor={themeColor}
                        label="Enthusiasm"
                        value={state.enthusiasmSlider}
                        onChange={(value) => dispatch({ type: 'SET_ENTHUSIASM_SLIDER', payload: value })}
                        percentage={state.enthusiasmSlider}
                      />

                      <SliderComponent
                        selectedColor={themeColor}
                        label="Empathy"
                        value={state.empathySlider}
                        onChange={(value) => dispatch({ type: 'SET_EMPATHY_SLIDER', payload: value })}
                        percentage={state.empathySlider}
                      />
                    </div>
                  </div>
                </div>
              )}

              {state.activeTab === 'advanced' && (
                <div className="space-y-6">
                  <h3 className="font-semibold">Advanced Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2 block">Language Model</Label>
                      <Select
                        value={state.languageModelId}
                        onValueChange={(value) => dispatch({ type: 'SET_LANGUAGE_MODEL', payload: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a language model" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageModels?.map((model) => (
                            <SelectItem key={model.llm_id} value={model.llm_id}>
                              {model.provider} - {model.model_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block">Temperature</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={state.temperature}
                        onChange={(e) => dispatch({ type: 'SET_TEMPERATURE', payload: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Max Tokens</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100000"
                      value={state.maxTokens}
                      onChange={(e) => dispatch({ type: 'SET_MAX_TOKENS', payload: parseInt(e.target.value) || 2000 })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Agent Group Selected State */}
          {!state.selectedGroupId && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <UserIcon className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Agent Group Selected</h3>
              <p className="text-muted-foreground mb-4">Select an agent group to configure</p>
              <Button onClick={onCreateGroup} style={{ backgroundColor: themeColor }}>
                Create New Agent Group
              </Button>
            </div>
          )}

          {/* Danger Zone */}
          {state.selectedGroupId && selectedGroup && (
            <DeleteAgentGroup
              groupId={state.selectedGroupId}
              groupName={selectedGroup.name}
              onDeleteSuccess={() => {
                dispatch({ type: 'SET_SELECTED_GROUP', payload: '' });
                dispatch({ type: 'RESET_AGENT_SELECTION' });
                if (onDeleteGroup) {
                  onDeleteGroup();
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentConfiguration;
