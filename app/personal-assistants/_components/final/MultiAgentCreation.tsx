"use client";

import React, { useReducer, useCallback, useState } from 'react';
import {
  ChevronDown, Sparkles, Settings,
  Save, Eye, Network, Brain, Briefcase, BookOpen, Wand2, Plus, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getArchitectureConfigs } from '../../_config/architectures.config';
import { QUICK_START_TEMPLATES } from '../../_config/templates.config';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AgentGroupService } from "@/service/agent-groups";
import { toast } from "sonner";
import {
  CreateAgentGroupRequest,
  LLMConfiguration,
  Tier,
  AgentConfiguration,
} from "@/types/agent-group";
import AdvancedCoordinationSettings from './AdvancedCoordinationSettings';

interface AgentStructure {
  name: string;
  type: string;
  role: string;
  selectedTiers: string[];
  tier_id?: string;
  sub_agents: number[]; // Array of agent indices (will be converted to nested structure for API)
}

// State interface
interface FormState {
  groupName: string;
  selectedArchitecture: string;
  showTemplates: boolean;
  autoConfig: boolean;
  showArchitectureFlow: boolean;
  agents: AgentStructure[];
  coordinationSettings: any;
}

// Action types
type FormAction =
  | { type: 'SET_GROUP_NAME'; payload: string }
  | { type: 'SET_ARCHITECTURE'; payload: string; architectureConfigs: any }
  | { type: 'TOGGLE_TEMPLATES' }
  | { type: 'SET_AUTO_CONFIG'; payload: boolean }
  | { type: 'TOGGLE_ARCHITECTURE_FLOW' }
  | { type: 'SET_AGENTS'; payload: AgentStructure[] }
  | { type: 'UPDATE_AGENT'; payload: { index: number; field: keyof AgentStructure; value: any } }
  | { type: 'SET_COORDINATION_SETTINGS'; payload: any }
  | { type: 'LOAD_TEMPLATE'; payload: { templateId: string; templates: any[] } }
  | { type: 'AUTO_POPULATE_AGENTS'; payload: { architecture: string; architectureConfigs: any } };

// Reducer function
const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_GROUP_NAME':
      return { ...state, groupName: action.payload };

    case 'SET_ARCHITECTURE':
      const newGroupName = state.groupName || `${action.architectureConfigs[action.payload]?.label} Team`;
      return {
        ...state,
        selectedArchitecture: action.payload,
        groupName: newGroupName,
      };

    case 'TOGGLE_TEMPLATES':
      return { ...state, showTemplates: !state.showTemplates };

    case 'SET_AUTO_CONFIG':
      return { ...state, autoConfig: action.payload };

    case 'TOGGLE_ARCHITECTURE_FLOW':
      return { ...state, showArchitectureFlow: !state.showArchitectureFlow };

    case 'SET_AGENTS':
      return { ...state, agents: action.payload };

    case 'UPDATE_AGENT':
      const updatedAgents = [...state.agents];
      updatedAgents[action.payload.index] = {
        ...updatedAgents[action.payload.index],
        [action.payload.field]: action.payload.value,
      };
      return { ...state, agents: updatedAgents };

    case 'SET_COORDINATION_SETTINGS':
      return { ...state, coordinationSettings: action.payload };

    case 'LOAD_TEMPLATE':
      const template = action.payload.templates.find(t => t.id === action.payload.templateId);
      if (!template) return state;

      const templateAgents: AgentStructure[] = template.agents.map((agent: any) => ({
        name: agent.name,
        type: agent.type,
        role: agent.role,
        selectedTiers: agent.tiers,
        sub_agents: [],
      }));

      return {
        ...state,
        selectedArchitecture: template.architecture,
        groupName: template.name,
        agents: templateAgents,
        showTemplates: false,
      };

    case 'AUTO_POPULATE_AGENTS':
      if (!state.autoConfig || !action.payload.architecture) return state;

      const archConfig = action.payload.architectureConfigs[action.payload.architecture];
      if (!archConfig) return state;

      const newAgents: AgentStructure[] = [];

      archConfig.requiredRoles.forEach((roleReq: any) => {
        const count = roleReq.min;
        const suggestedType = roleReq.suggested[0];

        for (let i = 0; i < count; i++) {
          const roleName = roleReq.role === 'orchestrator' ? 'Orchestrator' :
                          roleReq.role === 'flexible' ? 'Flexible' :
                          roleReq.role === 'specialist' ? 'Specialist' :
                          roleReq.role === 'coordinator' ? 'Coordinator' :
                          roleReq.role === 'peer' ? 'Peer' :
                          roleReq.role === 'processor' ? 'Processor' :
                          roleReq.role === 'moderator' ? 'Moderator' :
                          roleReq.role === 'advocate' ? 'Advocate' :
                          roleReq.role === 'critic' ? 'Critic' :
                          roleReq.role === 'senior_supervisor' ? 'Senior Supervisor' :
                          roleReq.role === 'team_lead' ? 'Team Lead' : 'Agent';

          const agentName = count > 1 ? `${roleName} ${i + 1}` : roleName;

          newAgents.push({
            name: agentName,
            type: suggestedType,
            role: roleReq.role,
            selectedTiers: [],
            sub_agents: []
          });
        }
      });

      return { ...state, agents: newAgents };

    default:
      return state;
  }
};

// Initial state
const initialState: FormState = {
  groupName: '',
  selectedArchitecture: '',
  showTemplates: false,
  autoConfig: true,
  showArchitectureFlow: false,
  agents: [],
  coordinationSettings: {},
};

// Agent Card Component
interface AgentCardProps {
  agent: AgentStructure;
  agentIndex: number;
  availableAgents: AgentStructure[];
  tiers?: Tier[];
  onUpdate: (field: keyof AgentStructure, value: any) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, agentIndex, availableAgents, tiers, onUpdate }) => {
  const [selectedSubAgentIndex, setSelectedSubAgentIndex] = useState<string>('');
  const [showSubAgentInput, setShowSubAgentInput] = useState(false);

  const handleAddSubAgent = () => {
    const subAgentIdx = parseInt(selectedSubAgentIndex);
    if (!isNaN(subAgentIdx) && !agent.sub_agents.includes(subAgentIdx)) {
      onUpdate('sub_agents', [...agent.sub_agents, subAgentIdx]);
      setSelectedSubAgentIndex('');
      setShowSubAgentInput(false);
    }
  };

  const handleRemoveSubAgent = (subAgentIdx: number) => {
    onUpdate('sub_agents', agent.sub_agents.filter(idx => idx !== subAgentIdx));
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="space-y-4">
        {/* Agent Name and Tier */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Type: {agent.type}</div>
            <Input
              value={agent.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              placeholder="Agent name"
              className="font-medium"
            />
          </div>

          <div>
            <Label className="text-xs mb-1 block">Tier Assignment</Label>
            <Select
              value={agent.tier_id || ""}
              onValueChange={(value) => onUpdate('tier_id', value)}
            >
              <SelectTrigger className="w-full h-9 text-sm">
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
        </div>

        {/* Sub-Agents Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-semibold">Sub-Agents</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setShowSubAgentInput(!showSubAgentInput)}
            >
              <Plus className="w-3 h-3" />
              Add Sub-Agent
            </Button>
          </div>

          {/* Add Sub-Agent Input */}
          {showSubAgentInput && (
            <div className="mb-3">
              <div className="flex gap-2">
                <Select
                  value={selectedSubAgentIndex}
                  onValueChange={setSelectedSubAgentIndex}
                >
                  <SelectTrigger className="h-8 text-sm flex-1">
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.map((availAgent, idx) => {
                      const isAlreadyAdded = agent.sub_agents.includes(idx);
                      return (
                        <SelectItem
                          key={idx}
                          value={String(idx)}
                          disabled={isAlreadyAdded}
                        >
                          {availAgent.name || `Agent ${idx + 1}`} ({availAgent.role})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3"
                  onClick={handleAddSubAgent}
                  disabled={!selectedSubAgentIndex}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => {
                    setShowSubAgentInput(false);
                    setSelectedSubAgentIndex('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Display Sub-Agents */}
          {agent.sub_agents.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {agent.sub_agents.map((subAgentIdx, idx) => {
                const subAgent = availableAgents[subAgentIdx];
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs"
                  >
                    <span>{subAgent?.name || `Agent ${subAgentIdx + 1}`}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubAgent(subAgentIdx)}
                      className="hover:bg-destructive/10 rounded p-0.5"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">
              No sub-agents assigned
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MultiAgentCreation: React.FC<{ onConfigureGroup?: (groupId: string) => void }> = ({ onConfigureGroup }) => {
  const queryClient = useQueryClient();
  const architectureConfigs = getArchitectureConfigs();

  // Use reducer instead of multiple useState
  const [state, dispatch] = useReducer(formReducer, initialState);

  // Queries
  const { data: tiers } = useQuery({
    queryKey: ["tiers"],
    queryFn: AgentGroupService.getTiers,
  });

  const { data: languageModels } = useQuery({
    queryKey: ["language-models"],
    queryFn: AgentGroupService.getLanguageModels,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: AgentGroupService.createAgentGroup,
    onSuccess: async (response) => {
      if (response.status === 200) {
        toast.success("Agent group created successfully!");
        await queryClient.invalidateQueries({ queryKey: ["agent-groups"] });
        if (onConfigureGroup && response.data?.group_id) {
          onConfigureGroup(response.data.group_id);
        }
      } else {
        toast.error(response.error || "Failed to create agent group");
      }
    },
  });

  // Memoized handlers using useCallback
  const handleArchitectureSelect = useCallback((archKey: string) => {
    dispatch({ type: 'SET_ARCHITECTURE', payload: archKey, architectureConfigs });
    // Auto-populate agents when architecture is selected
    dispatch({ type: 'AUTO_POPULATE_AGENTS', payload: { architecture: archKey, architectureConfigs } });
  }, [architectureConfigs]);

  const handleTemplateSelect = useCallback((templateId: string) => {
    dispatch({ type: 'LOAD_TEMPLATE', payload: { templateId, templates: QUICK_START_TEMPLATES } });
  }, []);

  const handleSave = useCallback(async () => {
    if (!state.groupName || !state.selectedArchitecture || state.agents.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!tiers || !languageModels) {
      toast.error("Required data not loaded");
      return;
    }

    const defaultTier = tiers[0];
    const llmConfig: LLMConfiguration = {
      language_model_id: languageModels[0].llm_id,
      temperature: 0.7,
      max_tokens: 2000,
    };

    const requestData: CreateAgentGroupRequest = {
      agent_group: {
        name: state.groupName,
        description: `${architectureConfigs[state.selectedArchitecture]?.label} architecture`,
        architecture: state.selectedArchitecture,
        prompt_configurations: {
          system_prompt: "",
        },
        advanced_coordination_settings: state.coordinationSettings || {},
      },
      llm_configurations: [llmConfig],
      agents: state.agents.map((agent) => ({
        tier_id: agent.tier_id || defaultTier.tier_id,
        llm_configuration_index: 0,
        name: agent.name,
        role: agent.role,
        personality: {
          traits: ["professional", "helpful"],
          sliders: { creativity: 50, formality: 70, verbosity: 50, enthusiasm: 50, empathy: 70 },
        },
        prompt_configurations: { user_prompt: "" },
        capabilities: { tools: [], knowledge_bases: [] },
      })),
      orchestration_configurations: {
        agents_configurations: state.agents.map((agent, index) => {
          // Build nested sub-agent configurations recursively with cycle detection
          // The key changes from agents_index -> agents_index_1 -> agents_index_2, etc.
          const buildSubAgentConfig = (subAgentIndices: number[], visited: Set<number> = new Set(), level: number = 0): AgentConfiguration[] => {
            return subAgentIndices
              .filter(subIdx => !visited.has(subIdx)) // Prevent cycles
              .map(subIdx => {
                const newVisited = new Set(visited);
                newVisited.add(subIdx);
                const indexKey = level === 0 ? 'agents_index' : `agents_index_${level}`;
                return {
                  [indexKey]: subIdx,
                  sub_agents: buildSubAgentConfig(state.agents[subIdx]?.sub_agents || [], newVisited, level + 1)
                } as AgentConfiguration;
              });
          };

          return {
            agents_index: index,
            sub_agents: buildSubAgentConfig(agent.sub_agents || [], new Set([index]), 1)
          };
        }),
      },
    };

    console.log('REQUEST DATA:', JSON.stringify(requestData, null, 2));
    createMutation.mutate(requestData);
  }, [state.groupName, state.selectedArchitecture, state.agents, tiers, languageModels, architectureConfigs, createMutation]);

  const ArchIcon = state.selectedArchitecture ? architectureConfigs[state.selectedArchitecture]?.icon || Settings : Settings;

  return (
    <div className="flex h-[90vh]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_TEMPLATES' })}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Sparkles className="w-5 h-5" />
              Quick Start Templates
              <ChevronDown className={`w-4 h-4 transition-transform ${state.showTemplates ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Templates Grid - Categorized */}
          {state.showTemplates && (
            <div className="space-y-6 pb-6">
              {/* Pedagogical Templates */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Pedagogical Templates
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {QUICK_START_TEMPLATES.filter(t => t.category === 'pedagogical').map((template) => {
                    const TemplateIcon = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all text-left bg-card"
                      >
                        <div className="flex items-start gap-3">
                          <TemplateIcon className="w-5 h-5 text-primary mt-1" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-secondary rounded">{template.architecture}</span>
                              <span className="text-xs text-muted-foreground">{template.agents.length} agents</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Business Templates */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Business Templates
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {QUICK_START_TEMPLATES.filter(t => t.category === 'business').map((template) => {
                    const TemplateIcon = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all text-left bg-card"
                      >
                        <div className="flex items-start gap-3">
                          <TemplateIcon className="w-5 h-5 text-primary mt-1" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-secondary rounded">{template.architecture}</span>
                              <span className="text-xs text-muted-foreground">{template.agents.length} agents</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Educational Templates */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Educational Templates
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {QUICK_START_TEMPLATES.filter(t => t.category === 'educational').map((template) => {
                    const TemplateIcon = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all text-left bg-card"
                      >
                        <div className="flex items-start gap-3">
                          <TemplateIcon className="w-5 h-5 text-primary mt-1" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-secondary rounded">{template.architecture}</span>
                              <span className="text-xs text-muted-foreground">{template.agents.length} agents</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Group Name */}
          <div>
            <Label htmlFor="groupName">Agent Group Name *</Label>
            <Input
              id="groupName"
              value={state.groupName}
              onChange={(e) => dispatch({ type: 'SET_GROUP_NAME', payload: e.target.value })}
              placeholder="Adaptive/Hybrid Team"
              className="mt-1"
            />
          </div>

          {/* Architecture Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Select Architecture:</Label>
              <div className="text-sm text-muted-foreground">Est. Cost: {state.selectedArchitecture ? architectureConfigs[state.selectedArchitecture]?.estimatedCost : '-'}</div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {Object.entries(architectureConfigs).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = state.selectedArchitecture === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleArchitectureSelect(key)}
                    className={`p-4 border-2 rounded-lg transition-all text-center ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-sm font-medium">{config.label}</div>
                  </button>
                );
              })}
            </div>

            {state.selectedArchitecture && (
              <Card className="mt-4 bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <ArchIcon className="w-6 h-6 text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2 mb-1">
                        {architectureConfigs[state.selectedArchitecture]?.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {architectureConfigs[state.selectedArchitecture]?.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={state.autoConfig}
                        onCheckedChange={(checked) => dispatch({ type: 'SET_AUTO_CONFIG', payload: !!checked })}
                      />
                      <label className="text-sm cursor-pointer">Auto-configure</label>
                      <Wand2 className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* Integrated Advanced Coordination Settings */}
                  <AdvancedCoordinationSettings
                    architecture={state.selectedArchitecture}
                    currentSettings={state.coordinationSettings}
                    onSave={(settings) => dispatch({ type: 'SET_COORDINATION_SETTINGS', payload: settings })}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Architecture Flow */}
          {state.selectedArchitecture && (
            <button
              onClick={() => dispatch({ type: 'TOGGLE_ARCHITECTURE_FLOW' })}
              className="w-full flex items-center gap-2 text-primary hover:underline text-sm"
            >
              <Network className="w-4 h-4" />
              View Architecture Flow - Visualize how agents will communicate
              <ChevronDown className={`w-4 h-4 transition-transform ml-auto ${state.showArchitectureFlow ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Agent Structure */}
          {state.agents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Agent Structure</h3>

              {/* Group agents by role */}
              {Array.from(new Set(state.agents.map(a => a.role))).map((role) => {
                const roleAgents = state.agents.filter(a => a.role === role);
                const roleName = role === 'orchestrator' ? 'Orchestrator' :
                                role === 'flexible' ? 'Flexible' :
                                role === 'specialist' ? 'Specialist' :
                                role === 'coordinator' ? 'Coordinator' : role;

                return (
                  <div key={role} className="space-y-3">
                    <div className="font-medium text-sm text-muted-foreground">
                      {roleName} - {roleAgents.length}/{roleAgents.length} agents
                    </div>

                    {roleAgents.map((agent) => {
                      const agentIndex = state.agents.indexOf(agent);
                      return (
                        <AgentCard
                          key={agentIndex}
                          agent={agent}
                          agentIndex={agentIndex}
                          availableAgents={state.agents.filter((_, idx) => idx !== agentIndex)}
                          tiers={tiers}
                          onUpdate={(field, value) => {
                            dispatch({
                              type: 'UPDATE_AGENT',
                              payload: { index: agentIndex, field, value }
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Save Button */}
          {state.agents.length > 0 && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-semibold">Ready to Save</div>
                    <div className="text-sm text-muted-foreground">
                      {state.groupName} • {state.agents.length} agents • System prompt will be generated
                    </div>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={createMutation.isPending} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiAgentCreation;
