"use client";

import React, {
  useReducer,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  ChevronDown,
  Sparkles,
  Settings,
  Save,
  Eye,
  Network,
  Brain,
  Briefcase,
  BookOpen,
  Wand2,
  Plus,
  X,
  Edit,
  Wrench,
  Database,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getArchitectureConfigs, getCoordinationConfigs } from "../../_config/architectures.config";
import { QUICK_START_TEMPLATES } from "../../_config/templates.config";
import { getSystemPromptForArchitecture } from "../../_config/system-prompts.config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AgentGroupService } from "@/service/agent-groups";
import { toast } from "sonner";
import { useThemeColor } from "@/providers/color-theme-provider";
import {
  CreateAgentGroupRequest,
  LLMConfiguration,
  Tier,
  AgentConfiguration,
} from "@/types/agent-group";
import AdvancedCoordinationSettings from "./AdvancedCoordinationSettings";
import SpecialSelectionInput from "@/components/inputs/SpecialSelectionInput";

interface AgentStructure {
  name: string;
  type: string;
  role: string;
  selectedTiers: string[];
  tier_id?: string;
  sub_agents: number[]; // Array of agent indices (will be converted to nested structure for API)
  personality?: {
    traits: string[];
    sliders: {
      creativity: number;
      formality: number;
      verbosity: number;
      enthusiasm: number;
      empathy: number;
    };
  };
  tools?: {
    retrieve_from_long_term_memory: boolean;
    update_long_term_memory: boolean;
    trim_messages: boolean;
    filter_messages: boolean;
  };
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
  | { type: "SET_GROUP_NAME"; payload: string }
  | { type: "SET_ARCHITECTURE"; payload: string; architectureConfigs: any }
  | { type: "TOGGLE_TEMPLATES" }
  | { type: "SET_AUTO_CONFIG"; payload: boolean }
  | { type: "TOGGLE_ARCHITECTURE_FLOW" }
  | { type: "SET_AGENTS"; payload: AgentStructure[] }
  | {
      type: "UPDATE_AGENT";
      payload: { index: number; field: keyof AgentStructure; value: any };
    }
  | { type: "ADD_AGENT"; payload: AgentStructure }
  | { type: "DELETE_AGENT"; payload: number }
  | { type: "SET_COORDINATION_SETTINGS"; payload: any }
  | { type: "LOAD_TEMPLATE"; payload: { templateId: string; templates: any[] } }
  | {
      type: "AUTO_POPULATE_AGENTS";
      payload: { architecture: string; architectureConfigs: any };
    };

// Reducer function
const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_GROUP_NAME":
      return { ...state, groupName: action.payload };

    case "SET_ARCHITECTURE":
      const newGroupName =
        state.groupName ||
        `${action.architectureConfigs[action.payload]?.label} Team`;
      return {
        ...state,
        selectedArchitecture: action.payload,
        groupName: newGroupName,
      };

    case "TOGGLE_TEMPLATES":
      return { ...state, showTemplates: !state.showTemplates };

    case "SET_AUTO_CONFIG":
      return { ...state, autoConfig: action.payload };

    case "TOGGLE_ARCHITECTURE_FLOW":
      return { ...state, showArchitectureFlow: !state.showArchitectureFlow };

    case "SET_AGENTS":
      return { ...state, agents: action.payload };

    case "UPDATE_AGENT":
      const updatedAgents = [...state.agents];
      updatedAgents[action.payload.index] = {
        ...updatedAgents[action.payload.index],
        [action.payload.field]: action.payload.value,
      };
      return { ...state, agents: updatedAgents };

    case "ADD_AGENT":
      const updatedAgentsWithNew = [...state.agents, action.payload];
      // If the new agent is an advocate or critic, automatically assign it to the moderator
      if (
        action.payload.role === "advocate" ||
        action.payload.role === "critic"
      ) {
        const moderatorIndex = updatedAgentsWithNew.findIndex(
          (a) => a.role === "moderator"
        );
        if (moderatorIndex !== -1) {
          const newAgentIndex = updatedAgentsWithNew.length - 1;
          updatedAgentsWithNew[moderatorIndex] = {
            ...updatedAgentsWithNew[moderatorIndex],
            sub_agents: [
              ...updatedAgentsWithNew[moderatorIndex].sub_agents,
              newAgentIndex,
            ],
          };
        }
      }
      return { ...state, agents: updatedAgentsWithNew };

    case "DELETE_AGENT":
      const agentIndexToDelete = action.payload;
      const agentsAfterDelete = state.agents.filter(
        (_, idx) => idx !== agentIndexToDelete
      );

      // Update sub_agents arrays to remove references to deleted agent and adjust indices
      const adjustedAgents = agentsAfterDelete.map((agent) => ({
        ...agent,
        sub_agents: agent.sub_agents
          .filter((subIdx) => subIdx !== agentIndexToDelete) // Remove deleted agent
          .map((subIdx) => (subIdx > agentIndexToDelete ? subIdx - 1 : subIdx)), // Adjust indices
      }));

      return { ...state, agents: adjustedAgents };

    case "SET_COORDINATION_SETTINGS":
      return { ...state, coordinationSettings: action.payload };

    case "LOAD_TEMPLATE":
      const template = action.payload.templates.find(
        (t) => t.id === action.payload.templateId
      );
      if (!template) return state;

      const templateAgents: AgentStructure[] = template.agents.map(
        (agent: any) => ({
          name: agent.name,
          type: agent.type,
          role: agent.role,
          selectedTiers: agent.tiers,
          sub_agents: [],
          tools: {
            retrieve_from_long_term_memory: true,
            update_long_term_memory: true,
            trim_messages: false,
            filter_messages: false,
          },
        })
      );

      return {
        ...state,
        selectedArchitecture: template.architecture,
        groupName: template.name,
        agents: templateAgents,
        showTemplates: false,
      };

    case "AUTO_POPULATE_AGENTS":
      if (!state.autoConfig || !action.payload.architecture) return state;

      const archConfig =
        action.payload.architectureConfigs[action.payload.architecture];
      if (!archConfig) return state;

      const newAgents: AgentStructure[] = [];

      archConfig.requiredRoles.forEach((roleReq: any) => {
        const count = roleReq.min;
        const suggestedType = roleReq.suggested[0];

        for (let i = 0; i < count; i++) {
          const roleName =
            roleReq.role === "specialist"
              ? "Specialist"
              : roleReq.role === "coordinator"
              ? "Coordinator"
              : roleReq.role === "peer"
              ? "Peer"
              : roleReq.role === "processor"
              ? "Processor"
              : roleReq.role === "moderator"
              ? "Moderator"
              : roleReq.role === "advocate"
              ? "Advocate"
              : roleReq.role === "critic"
              ? "Critic"
              : roleReq.role === "senior_supervisor"
              ? "Supervisor"
              : roleReq.role === "team_lead"
              ? "Team Lead"
              : "Agent";

          const agentName = count > 1 ? `${roleName} ${i + 1}` : roleName;

          newAgents.push({
            name: agentName,
            type: suggestedType,
            role: roleReq.role,
            selectedTiers: [],
            sub_agents: [],
            tools: {
              retrieve_from_long_term_memory: true,
              update_long_term_memory: true,
              trim_messages: false,
              filter_messages: false,
            },
          });
        }
      });

      // Auto-assign sub-agents based on architecture pattern
      const architecture = action.payload.architecture;

      if (architecture === "supervisor") {
        // Coordinator delegates to all specialists
        const coordinatorIdx = newAgents.findIndex((a) => a.role === "coordinator");
        const specialistIndices = newAgents
          .map((a, idx) => (a.role === "specialist" ? idx : -1))
          .filter((idx) => idx !== -1);

        if (coordinatorIdx !== -1) {
          newAgents[coordinatorIdx].sub_agents = specialistIndices;
        }
      } else if (architecture === "hierarchical") {
        // Senior supervisor oversees team leads
        // Team leads manage specialists (distribute evenly)
        const supervisorIdx = newAgents.findIndex((a) => a.role === "senior_supervisor");
        const teamLeadIndices = newAgents
          .map((a, idx) => (a.role === "team_lead" ? idx : -1))
          .filter((idx) => idx !== -1);
        const specialistIndices = newAgents
          .map((a, idx) => (a.role === "specialist" ? idx : -1))
          .filter((idx) => idx !== -1);

        if (supervisorIdx !== -1) {
          newAgents[supervisorIdx].sub_agents = teamLeadIndices;
        }

        // Distribute specialists evenly among team leads
        if (teamLeadIndices.length > 0 && specialistIndices.length > 0) {
          specialistIndices.forEach((specIdx, i) => {
            const teamLeadIdx = teamLeadIndices[i % teamLeadIndices.length];
            newAgents[teamLeadIdx].sub_agents.push(specIdx);
          });
        }
      } else if (architecture === "debate") {
        // Moderator oversees all advocates and critics
        const moderatorIdx = newAgents.findIndex((a) => a.role === "moderator");
        const debaterIndices = newAgents
          .map((a, idx) => (a.role === "advocate" || a.role === "critic" ? idx : -1))
          .filter((idx) => idx !== -1);

        if (moderatorIdx !== -1) {
          newAgents[moderatorIdx].sub_agents = debaterIndices;
        }
      }
      // For network, sequential, and adaptive, no auto-assignment needed (flat structures)

      // Auto-populate default coordination settings for the architecture
      const coordinationConfigs = getCoordinationConfigs();
      const defaultCoordinationSettings = coordinationConfigs[architecture]?.settings || {};

      return {
        ...state,
        agents: newAgents,
        coordinationSettings: defaultCoordinationSettings
      };

    default:
      return state;
  }
};

// Initial state
const initialState: FormState = {
  groupName: "",
  selectedArchitecture: "",
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
  allAgents: AgentStructure[]; // All agents including the current one
  tiers?: Tier[];
  onUpdate: (field: keyof AgentStructure, value: any) => void;
  onUpdateAllAgents?: (updatedAgents: AgentStructure[]) => void; // For updating parent agents
  onDelete?: () => void; // For deleting the agent
  canDelete?: boolean; // Whether the agent can be deleted
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  agentIndex,
  availableAgents,
  allAgents,
  tiers,
  onUpdate,
  onUpdateAllAgents,
  onDelete,
  canDelete = false,
}) => {
  const [selectedSubAgentIndex, setSelectedSubAgentIndex] =
    useState<string>("");
  const [showSubAgentInput, setShowSubAgentInput] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Get theme color for modal
  const { themeColor, themeColorCss } = useThemeColor();

  // Modal state for personality and tools
  const [modalPersonality, setModalPersonality] = useState<{
    traits: string[];
    sliders: {
      creativity: number;
      formality: number;
      verbosity: number;
      enthusiasm: number;
      empathy: number;
    };
  }>({
    traits: agent.personality?.traits || ["professional", "helpful"],
    sliders: agent.personality?.sliders || {
      creativity: 50,
      formality: 70,
      verbosity: 50,
      enthusiasm: 50,
      empathy: 70,
    },
  });

  const [modalTools, setModalTools] = useState({
    retrieve_from_long_term_memory: agent.tools?.retrieve_from_long_term_memory ?? true,
    update_long_term_memory: agent.tools?.update_long_term_memory ?? true,
    trim_messages: agent.tools?.trim_messages ?? false,
    filter_messages: agent.tools?.filter_messages ?? false,
  });

  // Available personality traits
  const availableTraits = [
    "professional",
    "helpful",
    "friendly",
    "formal",
    "casual",
    "analytical",
    "creative",
    "empathetic",
    "assertive",
    "patient",
    "enthusiastic",
    "thorough",
  ];

  const handleAddSubAgent = () => {
    const subAgentIdx = parseInt(selectedSubAgentIndex);
    if (!isNaN(subAgentIdx) && !agent.sub_agents.includes(subAgentIdx)) {
      onUpdate("sub_agents", [...agent.sub_agents, subAgentIdx]);
      setSelectedSubAgentIndex("");
      setShowSubAgentInput(false);
    }
  };

  const handleRemoveSubAgent = (subAgentIdx: number) => {
    onUpdate(
      "sub_agents",
      agent.sub_agents.filter((idx) => idx !== subAgentIdx)
    );
  };

  // Handle slider change
  const handleSliderChange = (
    key: keyof typeof modalPersonality.sliders,
    value: number[]
  ) => {
    setModalPersonality((prev) => ({
      ...prev,
      sliders: {
        ...prev.sliders,
        [key]: value[0],
      },
    }));
  };

  // Handle tool toggle
  const handleToolToggle = (tool: keyof typeof modalTools) => {
    setModalTools((prev) => ({
      ...prev,
      [tool]: !prev[tool],
    }));
  };

  // Handle modal save
  const handleModalSave = () => {
    onUpdate("personality", modalPersonality);
    onUpdate("tools", modalTools);
    setIsEditModalOpen(false);
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    // Reset to current agent values
    setModalPersonality({
      traits: agent.personality?.traits || ["professional", "helpful"],
      sliders: agent.personality?.sliders || {
        creativity: 50,
        formality: 70,
        verbosity: 50,
        enthusiasm: 50,
        empathy: 70,
      },
    });
    setModalTools({
      retrieve_from_long_term_memory: agent.tools?.retrieve_from_long_term_memory ?? false,
      update_long_term_memory: agent.tools?.update_long_term_memory ?? false,
      trim_messages: agent.tools?.trim_messages ?? false,
      filter_messages: agent.tools?.filter_messages ?? false,
    });
    setIsEditModalOpen(false);
  };

  // For specialist agents: find which team agent they belong to
  const getParentTeamAgent = (): number | null => {
    if (agent.role !== "specialist") return null;

    const parentIndex = allAgents.findIndex(
      (a, idx) =>
        (a.role === "coordinator" || a.role === "team_lead") &&
        a.sub_agents.includes(agentIndex)
    );
    return parentIndex >= 0 ? parentIndex : null;
  };

  // For specialist agents: handle team selection
  const handleTeamSelection = (teamAgentIndex: string) => {
    if (!onUpdateAllAgents) return;

    const newTeamIndex = parseInt(teamAgentIndex);
    if (isNaN(newTeamIndex)) return;

    const updatedAgents = [...allAgents];

    // Remove this specialist from all team agents
    updatedAgents.forEach((a, idx) => {
      if (
        (a.role === "coordinator" || a.role === "team_lead") &&
        a.sub_agents.includes(agentIndex)
      ) {
        updatedAgents[idx] = {
          ...updatedAgents[idx],
          sub_agents: updatedAgents[idx].sub_agents.filter(
            (subIdx) => subIdx !== agentIndex
          ),
        };
      }
    });

    // Add this specialist to the selected team agent
    if (newTeamIndex >= 0 && newTeamIndex < updatedAgents.length) {
      updatedAgents[newTeamIndex] = {
        ...updatedAgents[newTeamIndex],
        sub_agents: [...updatedAgents[newTeamIndex].sub_agents, agentIndex],
      };
    }

    onUpdateAllAgents(updatedAgents);
  };

  const isSpecialist = agent.role === "specialist";
  const teamAgents = allAgents.filter(
    (a, idx) =>
      (a.role === "coordinator" || a.role === "team_lead") && idx !== agentIndex
  );
  const currentParentTeam = getParentTeamAgent();

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="space-y-4">
        {/* Agent Name and Tier with Edit and Delete Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Edit and Delete buttons - positioned in the grid to avoid overlap */}
          <div className="col-span-2 flex justify-end gap-2 -mt-2 -mr-2 mb-0">
            {/* Edit button */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary rounded-md transition-all duration-200 hover:scale-110 hover:shadow-lg group"
              title="Edit agent"
            >
              <Edit className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-200" />
            </button>

            {/* Delete button */}
            {canDelete && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 bg-destructive hover:bg-destructive/80 border border-destructive rounded-md transition-all duration-200 hover:scale-110 hover:shadow-lg group"
                title="Delete agent"
              >
                <X className="w-4 h-4 text-destructive-foreground group-hover:rotate-90 transition-transform duration-200" />
              </button>
            )}
          </div>
          <div>
            <Label className="text-xs mb-1 block">Agent Name</Label>
            <Input
              value={agent.name}
              onChange={(e) => onUpdate("name", e.target.value)}
              placeholder="Enter agent name"
              className="font-medium"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Type: {agent.type}
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Tier Assignment</Label>
            <Select
              value={agent.tier_id || ""}
              onValueChange={(value) => onUpdate("tier_id", value)}
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

        {/* Sub-Agents Section or Team Assignment for Specialists */}
        <div className="border-t pt-4">
          {isSpecialist ? (
            // For specialist agents, show a dropdown to select their team
            <div>
              <Label className="text-xs mb-1 block font-semibold">
                Team Assignment
              </Label>
              <Select
                value={
                  currentParentTeam !== null ? String(currentParentTeam) : ""
                }
                onValueChange={handleTeamSelection}
              >
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder="Select a team agent" />
                </SelectTrigger>
                <SelectContent>
                  {teamAgents.map((teamAgent, idx) => {
                    const teamIndex = allAgents.indexOf(teamAgent);
                    return (
                      <SelectItem key={teamIndex} value={String(teamIndex)}>
                        {teamAgent.name || `Agent ${teamIndex + 1}`} (
                        {teamAgent.role})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {currentParentTeam !== null && (
                <div className="text-xs text-muted-foreground mt-2">
                  Assigned to: {allAgents[currentParentTeam]?.name}
                </div>
              )}
            </div>
          ) : agent.role === "team_lead" ? (
            // For team lead agents, show assigned specialists with remove option
            <div>
              <Label className="text-xs mb-2 block font-semibold">
                Assigned Specialists
              </Label>
              {agent.sub_agents.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {agent.sub_agents.map((subAgentIdx, idx) => {
                    const subAgent = allAgents[subAgentIdx];
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs"
                      >
                        <span>
                          {subAgent?.name || `Agent ${subAgentIdx + 1}`}
                        </span>
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
                  No specialists assigned yet. Specialists can assign themselves
                  to this team.
                </div>
              )}
            </div>
          ) : agent.role === "senior_supervisor" ? (
            // For supervisor agents, show assigned team leads (read-only)
            <div>
              <Label className="text-xs mb-2 block font-semibold">
                Assigned Team Leads
              </Label>
              {agent.sub_agents.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {agent.sub_agents.map((subAgentIdx, idx) => {
                    const subAgent = allAgents[subAgentIdx];
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs"
                      >
                        <span>
                          {subAgent?.name || `Agent ${subAgentIdx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  No team leads assigned yet.
                </div>
              )}
            </div>
          ) : agent.role === "peer" ? (
            // For peer agents in collaborative network, show a simple info message
            <div>
              <Label className="text-xs mb-2 block font-semibold">
                Collaborative Network
              </Label>
              <div className="text-xs text-muted-foreground italic">
                This agent collaborates as a peer with all other agents in the
                network.
              </div>
            </div>
          ) : agent.role === "processor" ? (
            // For processor agents in sequential chain, show a simple info message
            <div>
              <Label className="text-xs mb-2 block font-semibold">
                Sequential Processing
              </Label>
              <div className="text-xs text-muted-foreground italic">
                This agent processes tasks in sequence with other processors in
                the chain.
              </div>
            </div>
          ) : agent.role === "moderator" ? (
            // For moderator agents, show assigned advocates and critics with remove option
            <div>
              <Label className="text-xs mb-2 block font-semibold">
                Assigned Debaters
              </Label>
              {agent.sub_agents.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {agent.sub_agents.map((subAgentIdx, idx) => {
                    const subAgent = allAgents[subAgentIdx];
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs"
                      >
                        <span>
                          {subAgent?.name || `Agent ${subAgentIdx + 1}`}
                        </span>
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
                  No debaters assigned yet. Advocates and critics will
                  automatically be assigned to this moderator.
                </div>
              )}
            </div>
          ) : agent.role === "advocate" || agent.role === "critic" ? (
            // For advocate and critic agents, show they report to moderator
            <div>
              <Label className="text-xs mb-2 block font-semibold">
                Reports To
              </Label>
              <div className="text-xs text-muted-foreground italic">
                This agent automatically reports to the Moderator in the debate.
              </div>
            </div>
          ) : agent.role === "coordinator" ? (
            // For coordinator agents in supervisor architecture, show assigned specialists (read-only like supervisor)
            <div>
              <Label className="text-xs mb-2 block font-semibold">
                Assigned Specialists
              </Label>
              {agent.sub_agents.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {agent.sub_agents.map((subAgentIdx, idx) => {
                    const subAgent = allAgents[subAgentIdx];
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs"
                      >
                        <span>
                          {subAgent?.name || `Agent ${subAgentIdx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  No specialists assigned yet.
                </div>
              )}
            </div>
          ) : agent.role === "standalone" ? (
            // For standalone agents (None architecture), no sub-agents section needed
            null
          ) : (
            // For other agents, show the sub-agents management UI
            <>
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
                              {availAgent.name || `Agent ${idx + 1}`} (
                              {availAgent.role})
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
                        setSelectedSubAgentIndex("");
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
                        <span>
                          {subAgent?.name || `Agent ${subAgentIdx + 1}`}
                        </span>
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
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className="w-[95vw] sm:max-w-5xl max-h-[85vh] flex flex-col"
          style={{
            ...themeColorCss,
            '--icon-color': themeColor,
          } as React.CSSProperties}
        >
          <DialogHeader>
            <DialogTitle>Edit Agent: {agent.name}</DialogTitle>
            <DialogDescription>
              Configure personality, tools, and capabilities for this agent.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 overflow-y-auto">
            <div className="space-y-6 py-4">
            {/* Personality Traits Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" style={{ color: 'var(--icon-color)' }} />
                <h3 className="text-lg font-semibold">Personality Traits</h3>
              </div>
              <SpecialSelectionInput
                values={modalPersonality.traits}
                options={availableTraits}
                type="text"
                name="personality-traits"
                placeholder="Select or add personality traits..."
                inputHelp="Choose personality traits that define this agent's behavior"
                onChange={(updatedTraits) => {
                  setModalPersonality((prev) => ({
                    ...prev,
                    traits: updatedTraits,
                  }));
                }}
              />
            </div>

            {/* Personality Sliders Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personality Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(
                  Object.keys(modalPersonality.sliders) as Array<
                    keyof typeof modalPersonality.sliders
                  >
                ).map((key) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="capitalize">{key}</Label>
                      <span className="text-sm text-muted-foreground">
                        {modalPersonality.sliders[key]}
                      </span>
                    </div>
                    <Slider
                      value={[modalPersonality.sliders[key]]}
                      onValueChange={(value) => handleSliderChange(key, value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5" style={{ color: 'var(--icon-color)' }} />
                <h3 className="text-lg font-semibold">Available Tools</h3>
              </div>
              <div className="space-y-3 border rounded-lg p-4 bg-card">
                {(
                  Object.keys(modalTools) as Array<keyof typeof modalTools>
                ).map((tool) => (
                  <div
                    key={tool}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10"
                      >
                        {tool.includes("memory") ? (
                          <Database className="w-4 h-4" style={{ color: 'var(--icon-color)' }} />
                        ) : (
                          <Clock className="w-4 h-4" style={{ color: 'var(--icon-color)' }} />
                        )}
                      </div>
                      <div>
                        <Label className="font-medium cursor-pointer">
                          {tool
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {tool === "retrieve_from_long_term_memory"
                            ? "Access stored memories and context"
                            : tool === "update_long_term_memory"
                            ? "Save information for future reference"
                            : tool === "trim_messages"
                            ? "Automatically manage conversation length"
                            : "Remove irrelevant messages from history"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={modalTools[tool]}
                      onCheckedChange={() => handleToolToggle(tool)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Knowledge Bases Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: 'var(--icon-color)' }} />
                <h3 className="text-lg font-semibold">Knowledge Bases</h3>
              </div>
              <div className="border rounded-lg p-6 bg-muted/50 text-center">
                <Database className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  Knowledge Base Integration
                </p>
                <p className="text-xs text-muted-foreground">
                  Coming soon! Connect custom knowledge bases to enhance agent
                  capabilities.
                </p>
              </div>
            </div>
            </div>
          </ScrollArea>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={handleModalCancel}>
              Cancel
            </Button>
            <Button onClick={handleModalSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Mermaid Diagram Component
interface MermaidDiagramProps {
  architecture: string;
  agents: AgentStructure[];
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  architecture,
  agents,
}) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [diagram, setDiagram] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMermaidDiagram = useCallback(() => {
    if (agents.length === 0) return "";

    const agentsByRole = agents.reduce((acc, agent, idx) => {
      if (!acc[agent.role]) acc[agent.role] = [];
      acc[agent.role].push({ ...agent, index: idx });
      return acc;
    }, {} as Record<string, (AgentStructure & { index: number })[]>);

    let mermaid = "graph TD\n";
    mermaid +=
      "    classDef supervisor fill:#3b82f6,stroke:#1e40af,stroke-width:3px,color:#fff\n";
    mermaid +=
      "    classDef coordinator fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff\n";
    mermaid +=
      "    classDef teamLead fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff\n";
    mermaid +=
      "    classDef specialist fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff\n";
    mermaid +=
      "    classDef peer fill:#ec4899,stroke:#db2777,stroke-width:2px,color:#fff\n";
    mermaid +=
      "    classDef processor fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#fff\n";
    mermaid +=
      "    classDef moderator fill:#ef4444,stroke:#dc2626,stroke-width:3px,color:#fff\n";
    mermaid +=
      "    classDef advocate fill:#f97316,stroke:#ea580c,stroke-width:2px,color:#fff\n";
    mermaid +=
      "    classDef critic fill:#84cc16,stroke:#65a30d,stroke-width:2px,color:#fff\n";

    // Generate nodes
    agents.forEach((agent, idx) => {
      const nodeName = `A${idx}["${agent.name}"]`;
      const className =
        agent.role === "senior_supervisor"
          ? "supervisor"
          : agent.role === "coordinator"
          ? "coordinator"
          : agent.role === "team_lead"
          ? "teamLead"
          : agent.role === "specialist"
          ? "specialist"
          : agent.role === "peer"
          ? "peer"
          : agent.role === "processor"
          ? "processor"
          : agent.role === "moderator"
          ? "moderator"
          : agent.role === "advocate"
          ? "advocate"
          : agent.role === "critic"
          ? "critic"
          : "default";
      mermaid += `    A${idx}["${agent.name}":::${className}]\n`;
    });

    // Generate connections based on architecture
    if (architecture === "supervisor" || architecture === "debate") {
      // Coordinator/Moderator -> Specialists/Debaters
      const coordinators = agents.filter(
        (a) => a.role === "coordinator" || a.role === "moderator"
      );
      coordinators.forEach((coord) => {
        const coordIdx = agents.indexOf(coord);
        coord.sub_agents.forEach((subIdx) => {
          mermaid += `    A${coordIdx} -->|delegates to| A${subIdx}\n`;
        });
      });
    } else if (architecture === "hierarchical") {
      // Supervisor -> Team Leads -> Specialists
      const supervisors = agents.filter((a) => a.role === "senior_supervisor");
      supervisors.forEach((sup) => {
        const supIdx = agents.indexOf(sup);
        sup.sub_agents.forEach((teamLeadIdx) => {
          mermaid += `    A${supIdx} -->|oversees| A${teamLeadIdx}\n`;
          const teamLead = agents[teamLeadIdx];
          if (teamLead) {
            teamLead.sub_agents.forEach((specIdx) => {
              mermaid += `    A${teamLeadIdx} -->|manages| A${specIdx}\n`;
            });
          }
        });
      });
    } else if (architecture === "network") {
      // Peer to Peer connections
      const peers = agents.filter((a) => a.role === "peer");
      for (let i = 0; i < peers.length - 1; i++) {
        const idx1 = agents.indexOf(peers[i]);
        const idx2 = agents.indexOf(peers[i + 1]);
        mermaid += `    A${idx1} <-->|collaborates| A${idx2}\n`;
      }
    } else if (architecture === "sequential") {
      // Sequential chain
      const processors = agents.filter((a) => a.role === "processor");
      for (let i = 0; i < processors.length - 1; i++) {
        const idx1 = agents.indexOf(processors[i]);
        const idx2 = agents.indexOf(processors[i + 1]);
        mermaid += `    A${idx1} -->|passes to| A${idx2}\n`;
      }
    }

    return mermaid;
  }, [architecture, agents]);

  useEffect(() => {
    const loadMermaid = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const mermaidDiagram = generateMermaidDiagram();
        setDiagram(mermaidDiagram);

        if (mermaidRef.current && mermaidDiagram) {
          const mermaid = await import("mermaid");
          mermaid.default.initialize({
            startOnLoad: true,
            theme: "dark",
            themeVariables: {
              darkMode: true,
              background: "#1f2937",
              primaryColor: "#3b82f6",
              primaryTextColor: "#fff",
              primaryBorderColor: "#1e40af",
              lineColor: "#6b7280",
              secondaryColor: "#8b5cf6",
              tertiaryColor: "#10b981",
            },
          });

          mermaidRef.current.innerHTML = mermaidDiagram;
          await mermaid.default.run({
            nodes: [mermaidRef.current],
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        setError(
          "Failed to render diagram. Mermaid library may not be installed."
        );
        setIsLoading(false);
      }
    };

    loadMermaid();
  }, [generateMermaidDiagram]);

  return (
    <Card className="mt-4 bg-card">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Network className="w-5 h-5" />
          Architecture Flow Diagram
        </h3>

        {error ? (
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-center">
            <p className="text-red-400">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Run: npm install mermaid
            </p>
          </div>
        ) : !diagram ? (
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <p className="text-muted-foreground">
              No agents configured yet. Add agents to see the architecture flow.
            </p>
          </div>
        ) : isLoading ? (
          <div className="bg-gray-900 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading diagram...</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 rounded-lg p-6 overflow-auto">
              <div
                ref={mermaidRef}
                className="mermaid min-h-[300px] flex items-center justify-center"
              />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>
                💡 This diagram shows how agents communicate in the{" "}
                {architecture} architecture.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const MultiAgentCreation: React.FC<{
  onConfigureGroup?: (groupId: string) => void;
}> = ({ onConfigureGroup }) => {
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
  const handleArchitectureSelect = useCallback(
    (archKey: string) => {
      dispatch({
        type: "SET_ARCHITECTURE",
        payload: archKey,
        architectureConfigs,
      });
      // Auto-populate agents when architecture is selected
      dispatch({
        type: "AUTO_POPULATE_AGENTS",
        payload: { architecture: archKey, architectureConfigs },
      });
    },
    [architectureConfigs]
  );

  const handleTemplateSelect = useCallback((templateId: string) => {
    dispatch({
      type: "LOAD_TEMPLATE",
      payload: { templateId, templates: QUICK_START_TEMPLATES },
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (
      !state.groupName ||
      !state.selectedArchitecture ||
      state.agents.length === 0
    ) {
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
        description: `${
          architectureConfigs[state.selectedArchitecture]?.label
        } architecture`,
        architecture: state.selectedArchitecture,
        prompt_configurations: {
          system_prompt: getSystemPromptForArchitecture(state.selectedArchitecture),
        },
        advanced_coordination_settings: state.coordinationSettings || {},
      },
      llm_configurations: [llmConfig],
      agents: state.agents.map((agent) => ({
        tier_id: agent.tier_id || defaultTier.tier_id,
        llm_configuration_index: 0,
        name: agent.name,
        role: agent.role,
        personality: agent.personality || {
          traits: ["professional", "helpful"],
          sliders: {
            creativity: 50,
            formality: 70,
            verbosity: 50,
            enthusiasm: 50,
            empathy: 70,
          },
        },
        prompt_configurations: { user_prompt: "" },
        capabilities: {
          tools: agent.tools
            ? Object.entries(agent.tools)
                .filter(([_, enabled]) => enabled)
                .map(([tool]) => tool)
            : [],
          knowledge_bases: [],
        },
      })),
      orchestration_configurations: {
        agents_configurations: (() => {
          const architecture = state.selectedArchitecture;

          // For hierarchical architectures (supervisor, hierarchical, debate):
          // Backend needs nested structure with sub_agents relationships
          if (architecture === "supervisor" || architecture === "hierarchical" || architecture === "debate") {
            const buildSubAgentConfig = (
              subAgentIndices: number[],
              visited: Set<number> = new Set()
            ): AgentConfiguration[] => {
              return subAgentIndices
                .filter((subIdx) => !visited.has(subIdx))
                .map((subIdx) => {
                  const newVisited = new Set(visited);
                  newVisited.add(subIdx);
                  return {
                    agents_index: subIdx,
                    sub_agents: buildSubAgentConfig(
                      state.agents[subIdx]?.sub_agents || [],
                      newVisited
                    ),
                  } as AgentConfiguration;
                });
            };

            // Find all agents that are sub-agents of someone else
            const allSubAgentIndices = new Set<number>();
            state.agents.forEach((agent) => {
              agent.sub_agents?.forEach((subIdx) => allSubAgentIndices.add(subIdx));
            });

            // Only include ROOT agents with their nested sub_agents
            return state.agents
              .map((agent, index) => ({ agent, index }))
              .filter(({ index }) => !allSubAgentIndices.has(index))
              .map(({ index }) => ({
                agents_index: index,
                sub_agents: buildSubAgentConfig(
                  state.agents[index]?.sub_agents || [],
                  new Set([index])
                ),
              }));
          }

          // For flat architectures (network, sequential, adaptive, none):
          // Backend needs all agents at root with empty sub_agents
          return state.agents.map((agent, index) => ({
            agents_index: index,
            sub_agents: [],
          }));
        })(),
      },
    };

    console.log("REQUEST DATA:", JSON.stringify(requestData, null, 2));
    createMutation.mutate(requestData);
  }, [
    state.groupName,
    state.selectedArchitecture,
    state.agents,
    tiers,
    languageModels,
    architectureConfigs,
    createMutation,
  ]);

  const ArchIcon = state.selectedArchitecture
    ? architectureConfigs[state.selectedArchitecture]?.icon || Settings
    : Settings;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-[90vh]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => dispatch({ type: "TOGGLE_TEMPLATES" })}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Sparkles className="w-5 h-5" />
              Quick Start Templates
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  state.showTemplates ? "rotate-180" : ""
                }`}
              />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {QUICK_START_TEMPLATES.filter(
                    (t) =>
                      t.category === "pedagogical" &&
                      t.architecture !== "adaptive"
                  ).map((template) => {
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
                            <h4 className="font-semibold text-sm mb-1">
                              {template.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-secondary rounded">
                                {template.architecture}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {template.agents.length} agents
                              </span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {QUICK_START_TEMPLATES.filter(
                    (t) =>
                      t.category === "business" && t.architecture !== "adaptive"
                  ).map((template) => {
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
                            <h4 className="font-semibold text-sm mb-1">
                              {template.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-secondary rounded">
                                {template.architecture}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {template.agents.length} agents
                              </span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {QUICK_START_TEMPLATES.filter(
                    (t) =>
                      t.category === "educational" &&
                      t.architecture !== "adaptive"
                  ).map((template) => {
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
                            <h4 className="font-semibold text-sm mb-1">
                              {template.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-secondary rounded">
                                {template.architecture}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {template.agents.length} agents
                              </span>
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
              onChange={(e) =>
                dispatch({ type: "SET_GROUP_NAME", payload: e.target.value })
              }
              placeholder="Adaptive/Hybrid Team"
              className="mt-1"
            />
          </div>

          {/* Architecture Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Select Architecture:</Label>
              <div className="text-sm text-muted-foreground">
                Est. Cost:{" "}
                {state.selectedArchitecture
                  ? architectureConfigs[state.selectedArchitecture]
                      ?.estimatedCost
                  : "-"}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(architectureConfigs)
                .filter(([key]) => key !== "adaptive")
                .map(([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = state.selectedArchitecture === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleArchitectureSelect(key)}
                      className={`p-4 border-2 rounded-lg transition-all text-center ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 mx-auto mb-2 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
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
                        {
                          architectureConfigs[state.selectedArchitecture]
                            ?.description
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={state.autoConfig}
                        onCheckedChange={(checked) =>
                          dispatch({
                            type: "SET_AUTO_CONFIG",
                            payload: !!checked,
                          })
                        }
                      />
                      <label className="text-sm cursor-pointer">
                        Auto-configure
                      </label>
                      <Wand2 className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* Integrated Advanced Coordination Settings */}
                  <AdvancedCoordinationSettings
                    architecture={state.selectedArchitecture}
                    currentSettings={state.coordinationSettings}
                    onSave={(settings) =>
                      dispatch({
                        type: "SET_COORDINATION_SETTINGS",
                        payload: settings,
                      })
                    }
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Architecture Flow */}
          {state.selectedArchitecture && (
            <>
              <button
                onClick={() => dispatch({ type: "TOGGLE_ARCHITECTURE_FLOW" })}
                className="w-full flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <Network className="w-4 h-4" />
                View Architecture Flow - Visualize how agents will communicate
                <ChevronDown
                  className={`w-4 h-4 transition-transform ml-auto ${
                    state.showArchitectureFlow ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mermaid Diagram */}
              {state.showArchitectureFlow && (
                <MermaidDiagram
                  architecture={state.selectedArchitecture}
                  agents={state.agents}
                />
              )}
            </>
          )}

          {/* Agent Structure */}
          {state.agents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Agent Structure</h3>

              {/* Group agents by role */}
              {Array.from(new Set(state.agents.map((a) => a.role))).map(
                (role) => {
                  const roleAgents = state.agents.filter(
                    (a) => a.role === role
                  );
                  const roleName =
                    role === "specialist"
                      ? "Specialist"
                      : role === "coordinator"
                      ? "Coordinator"
                      : role === "team_lead"
                      ? "Team Lead"
                      : role === "senior_supervisor"
                      ? "Supervisor"
                      : role === "peer"
                      ? "Peer"
                      : role === "processor"
                      ? "Processor"
                      : role === "moderator"
                      ? "Moderator"
                      : role === "advocate"
                      ? "Advocate"
                      : role === "critic"
                      ? "Critic"
                      : role;

                  return (
                    <div key={role} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-muted-foreground">
                          {roleName} - {roleAgents.length}/
                          {role === "peer" || role === "processor"
                            ? "5"
                            : role === "moderator"
                            ? "1"
                            : role === "advocate" || role === "critic"
                            ? "3"
                            : roleAgents.length}{" "}
                          agents
                        </div>
                        {/* Add Team Lead button */}
                        {role === "team_lead" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => {
                              const teamLeadCount = state.agents.filter(
                                (a) => a.role === "team_lead"
                              ).length;
                              dispatch({
                                type: "ADD_AGENT",
                                payload: {
                                  name: `Team Lead ${teamLeadCount + 1}`,
                                  type: "manager",
                                  role: "team_lead",
                                  selectedTiers: [],
                                  sub_agents: [],
                                },
                              });
                            }}
                          >
                            <Plus className="w-3 h-3" />
                            Add Team Lead
                          </Button>
                        )}
                        {/* Add Specialist button */}
                        {role === "specialist" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => {
                              const specialistCount = state.agents.filter(
                                (a) => a.role === "specialist"
                              ).length;
                              dispatch({
                                type: "ADD_AGENT",
                                payload: {
                                  name: `Specialist ${specialistCount + 1}`,
                                  type: "developer",
                                  role: "specialist",
                                  selectedTiers: [],
                                  sub_agents: [],
                                },
                              });
                            }}
                          >
                            <Plus className="w-3 h-3" />
                            Add Specialist
                          </Button>
                        )}
                        {/* Add Peer button for collaborative network */}
                        {role === "peer" && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              disabled={roleAgents.length >= 5}
                              onClick={() => {
                                const peerCount = state.agents.filter(
                                  (a) => a.role === "peer"
                                ).length;
                                if (peerCount < 5) {
                                  dispatch({
                                    type: "ADD_AGENT",
                                    payload: {
                                      name: `Peer ${peerCount + 1}`,
                                      type: "collaborator",
                                      role: "peer",
                                      selectedTiers: [],
                                      sub_agents: [],
                                    },
                                  });
                                }
                              }}
                            >
                              <Plus className="w-3 h-3" />
                              Add Peer Agent
                            </Button>
                            {roleAgents.length >= 5 && (
                              <span className="text-xs text-muted-foreground italic">
                                (Max 5 peers)
                              </span>
                            )}
                          </>
                        )}
                        {/* Add Processor button for sequential chain */}
                        {role === "processor" && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              disabled={roleAgents.length >= 5}
                              onClick={() => {
                                const processorCount = state.agents.filter(
                                  (a) => a.role === "processor"
                                ).length;
                                if (processorCount < 5) {
                                  dispatch({
                                    type: "ADD_AGENT",
                                    payload: {
                                      name: `Processor ${processorCount + 1}`,
                                      type: "researcher",
                                      role: "processor",
                                      selectedTiers: [],
                                      sub_agents: [],
                                    },
                                  });
                                }
                              }}
                            >
                              <Plus className="w-3 h-3" />
                              Add Processor
                            </Button>
                            {roleAgents.length >= 5 && (
                              <span className="text-xs text-muted-foreground italic">
                                (Max 5 processors)
                              </span>
                            )}
                          </>
                        )}
                        {/* Add Advocate button for debate */}
                        {role === "advocate" && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              disabled={roleAgents.length >= 3}
                              onClick={() => {
                                const advocateCount = state.agents.filter(
                                  (a) => a.role === "advocate"
                                ).length;
                                if (advocateCount < 3) {
                                  dispatch({
                                    type: "ADD_AGENT",
                                    payload: {
                                      name: `Advocate ${advocateCount + 1}`,
                                      type: "debater",
                                      role: "advocate",
                                      selectedTiers: [],
                                      sub_agents: [],
                                    },
                                  });
                                }
                              }}
                            >
                              <Plus className="w-3 h-3" />
                              Add Advocate
                            </Button>
                            {roleAgents.length >= 3 && (
                              <span className="text-xs text-muted-foreground italic">
                                (Max 3 advocates)
                              </span>
                            )}
                          </>
                        )}
                        {/* Add Critic button for debate */}
                        {role === "critic" && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              disabled={roleAgents.length >= 3}
                              onClick={() => {
                                const criticCount = state.agents.filter(
                                  (a) => a.role === "critic"
                                ).length;
                                if (criticCount < 3) {
                                  dispatch({
                                    type: "ADD_AGENT",
                                    payload: {
                                      name: `Critic ${criticCount + 1}`,
                                      type: "skeptic",
                                      role: "critic",
                                      selectedTiers: [],
                                      sub_agents: [],
                                    },
                                  });
                                }
                              }}
                            >
                              <Plus className="w-3 h-3" />
                              Add Critic
                            </Button>
                            {roleAgents.length >= 3 && (
                              <span className="text-xs text-muted-foreground italic">
                                (Max 3 critics)
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {roleAgents.map((agent) => {
                        const agentIndex = state.agents.indexOf(agent);
                        return (
                          <AgentCard
                            key={agentIndex}
                            agent={agent}
                            agentIndex={agentIndex}
                            availableAgents={state.agents.filter(
                              (_, idx) => idx !== agentIndex
                            )}
                            allAgents={state.agents}
                            tiers={tiers}
                            onUpdate={(field, value) => {
                              dispatch({
                                type: "UPDATE_AGENT",
                                payload: { index: agentIndex, field, value },
                              });
                            }}
                            onUpdateAllAgents={(updatedAgents) => {
                              dispatch({
                                type: "SET_AGENTS",
                                payload: updatedAgents,
                              });
                            }}
                            canDelete={
                              role === "team_lead" ||
                              role === "specialist" ||
                              role === "peer" ||
                              role === "processor" ||
                              role === "advocate" ||
                              role === "critic"
                            }
                            onDelete={() => {
                              dispatch({
                                type: "DELETE_AGENT",
                                payload: agentIndex,
                              });
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                }
              )}
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
                      {state.groupName} • {state.agents.length} agents • System
                      prompt will be generated
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={createMutation.isPending}
                  className="gap-2"
                >
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
