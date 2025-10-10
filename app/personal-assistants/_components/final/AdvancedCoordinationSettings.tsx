"use client";

import React, { useReducer, useEffect } from 'react';
import { Settings, ChevronDown, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CoordinationSetting {
  key: string;
  label: string;
  type: 'select' | 'number' | 'checkbox' | 'multiselect';
  options?: string[];
  min?: number;
  max?: number;
  description?: string;
}

interface ArchitectureSettings {
  [key: string]: any;
}

interface AdvancedCoordinationSettingsProps {
  architecture: string;
  currentSettings: ArchitectureSettings;
  onSave: (settings: ArchitectureSettings) => void;
}

const getArchitectureSettings = (architecture: string): { settings: ArchitectureSettings; availableSettings: CoordinationSetting[] } => {
  const configs: Record<string, { settings: ArchitectureSettings; availableSettings: CoordinationSetting[] }> = {
    supervisor: {
      settings: {
        delegationStrategy: 'expertise-based',
        maxConcurrentTasks: 3,
        escalationThreshold: 30,
        synthesisMethod: 'coordinator-decision',
        requireSpecialistApproval: false,
        coordinatorOverride: true
      },
      availableSettings: [
        {
          key: 'delegationStrategy',
          label: 'Delegation Strategy',
          type: 'select',
          options: ['expertise-based', 'workload-balanced', 'round-robin', 'priority-based'],
          description: 'How tasks are assigned to specialists'
        },
        {
          key: 'maxConcurrentTasks',
          label: 'Max Concurrent Tasks',
          type: 'number',
          min: 1,
          max: 10,
          description: 'Maximum number of tasks processed simultaneously'
        },
        {
          key: 'escalationThreshold',
          label: 'Escalation Threshold (seconds)',
          type: 'number',
          min: 10,
          max: 300,
          description: 'Time before escalating to coordinator'
        },
        {
          key: 'synthesisMethod',
          label: 'Synthesis Method',
          type: 'select',
          options: ['coordinator-decision', 'weighted-consensus', 'majority-vote'],
          description: 'How multiple specialist outputs are combined'
        },
        {
          key: 'requireSpecialistApproval',
          label: 'Require Specialist Approval',
          type: 'checkbox',
          description: 'Specialists must approve final output'
        },
        {
          key: 'coordinatorOverride',
          label: 'Allow Coordinator Override',
          type: 'checkbox',
          description: 'Coordinator can override specialist decisions'
        }
      ]
    },
    hierarchical: {
      settings: {
        reportingFrequency: 'milestone',
        decisionEscalation: 'automatic',
        crossTeamCommunication: 'through-leads',
        resourceAllocation: 'senior-controlled',
        conflictResolution: 'escalate-up'
      },
      availableSettings: [
        {
          key: 'reportingFrequency',
          label: 'Reporting Frequency',
          type: 'select',
          options: ['real-time', 'milestone', 'scheduled', 'on-request'],
          description: 'How often team leads report to senior supervision'
        },
        {
          key: 'decisionEscalation',
          label: 'Decision Escalation',
          type: 'select',
          options: ['automatic', 'manual', 'threshold-based'],
          description: 'When decisions are escalated up the hierarchy'
        },
        {
          key: 'crossTeamCommunication',
          label: 'Cross-Team Communication',
          type: 'select',
          options: ['through-leads', 'direct-allowed', 'senior-mediated'],
          description: 'How teams communicate with each other'
        },
        {
          key: 'resourceAllocation',
          label: 'Resource Allocation',
          type: 'select',
          options: ['senior-controlled', 'team-lead-managed', 'distributed'],
          description: 'Who controls resource distribution'
        },
        {
          key: 'conflictResolution',
          label: 'Conflict Resolution',
          type: 'select',
          options: ['escalate-up', 'peer-mediation', 'senior-arbitration'],
          description: 'How conflicts between teams are resolved'
        }
      ]
    },
    network: {
      settings: {
        communicationPattern: 'open-mesh',
        consensusThreshold: 75,
        leadershipModel: 'rotating',
        informationSharing: 'broadcast',
        decisionMaking: 'collaborative'
      },
      availableSettings: [
        {
          key: 'communicationPattern',
          label: 'Communication Pattern',
          type: 'select',
          options: ['open-mesh', 'hub-based', 'clustered'],
          description: 'How peers communicate with each other'
        },
        {
          key: 'consensusThreshold',
          label: 'Consensus Threshold (%)',
          type: 'number',
          min: 50,
          max: 100,
          description: 'Percentage of agents needed for consensus'
        },
        {
          key: 'leadershipModel',
          label: 'Leadership Model',
          type: 'select',
          options: ['rotating', 'emergent', 'none', 'elected'],
          description: 'How leadership emerges in the network'
        },
        {
          key: 'informationSharing',
          label: 'Information Sharing',
          type: 'select',
          options: ['broadcast', 'targeted', 'opt-in'],
          description: 'How information is distributed'
        },
        {
          key: 'decisionMaking',
          label: 'Decision Making',
          type: 'select',
          options: ['collaborative', 'voting', 'consensus-required'],
          description: 'How collective decisions are made'
        }
      ]
    },
    sequential: {
      settings: {
        handoffTriggers: ['completion'],
        backflowAllowed: true,
        qualityGates: 'each-step',
        timeoutHandling: 'skip-agent',
        progressTracking: 'detailed'
      },
      availableSettings: [
        {
          key: 'handoffTriggers',
          label: 'Handoff Triggers',
          type: 'multiselect',
          options: ['completion', 'timeout', 'quality-threshold', 'manual-trigger'],
          description: 'When work is passed to the next agent'
        },
        {
          key: 'backflowAllowed',
          label: 'Allow Backflow to Previous Agents',
          type: 'checkbox',
          description: 'Can work return to earlier stages'
        },
        {
          key: 'qualityGates',
          label: 'Quality Gates',
          type: 'select',
          options: ['each-step', 'milestone-only', 'final-only', 'none'],
          description: 'When quality checks are performed'
        },
        {
          key: 'timeoutHandling',
          label: 'Timeout Handling',
          type: 'select',
          options: ['skip-agent', 'retry', 'escalate', 'abort'],
          description: 'What happens when an agent times out'
        },
        {
          key: 'progressTracking',
          label: 'Progress Tracking',
          type: 'select',
          options: ['detailed', 'milestone', 'minimal'],
          description: 'Level of progress monitoring'
        }
      ]
    },
    debate: {
      settings: {
        debateRounds: 3,
        argumentTimeLimit: 120,
        moderatorStyle: 'neutral',
        evidenceRequirement: 'citations-required',
        resolutionMethod: 'moderator-synthesis'
      },
      availableSettings: [
        {
          key: 'debateRounds',
          label: 'Maximum Debate Rounds',
          type: 'number',
          min: 1,
          max: 10,
          description: 'Maximum number of argument rounds'
        },
        {
          key: 'argumentTimeLimit',
          label: 'Argument Time Limit (seconds)',
          type: 'number',
          min: 30,
          max: 600,
          description: 'Time allowed per argument'
        },
        {
          key: 'moderatorStyle',
          label: 'Moderator Style',
          type: 'select',
          options: ['neutral', 'probing', 'challenging', 'supportive'],
          description: 'How moderator facilitates debate'
        },
        {
          key: 'evidenceRequirement',
          label: 'Evidence Requirement',
          type: 'select',
          options: ['citations-required', 'evidence-preferred', 'logic-based', 'open'],
          description: 'Level of evidence needed in arguments'
        },
        {
          key: 'resolutionMethod',
          label: 'Resolution Method',
          type: 'select',
          options: ['moderator-synthesis', 'voting', 'consensus', 'strongest-argument'],
          description: 'How final decisions are reached'
        }
      ]
    },
    adaptive: {
      settings: {
        adaptationTriggers: ['performance-metrics'],
        evaluationFrequency: 'task-completion',
        architecturePool: ['supervisor', 'sequential', 'network'],
        adaptationThreshold: 20,
        learningEnabled: true
      },
      availableSettings: [
        {
          key: 'adaptationTriggers',
          label: 'Adaptation Triggers',
          type: 'multiselect',
          options: ['performance-metrics', 'time-constraints', 'complexity-analysis', 'resource-availability'],
          description: 'What triggers architecture changes'
        },
        {
          key: 'evaluationFrequency',
          label: 'Evaluation Frequency',
          type: 'select',
          options: ['real-time', 'task-completion', 'scheduled', 'threshold-based'],
          description: 'How often system evaluates performance'
        },
        {
          key: 'architecturePool',
          label: 'Available Architectures',
          type: 'multiselect',
          options: ['supervisor', 'hierarchical', 'network', 'sequential', 'debate'],
          description: 'Architectures the system can switch to'
        },
        {
          key: 'adaptationThreshold',
          label: 'Adaptation Threshold (%)',
          type: 'number',
          min: 5,
          max: 50,
          description: 'Performance change needed to trigger adaptation'
        },
        {
          key: 'learningEnabled',
          label: 'Enable Learning from Past Adaptations',
          type: 'checkbox',
          description: 'System learns from previous adaptations'
        }
      ]
    }
  };

  return configs[architecture] || configs.supervisor;
};

// State and actions for useReducer
interface SettingsState {
  isOpen: boolean;
  settings: ArchitectureSettings;
}

type SettingsAction =
  | { type: 'TOGGLE_OPEN' }
  | { type: 'UPDATE_SETTING'; payload: { key: string; value: any } }
  | { type: 'LOAD_ARCHITECTURE_SETTINGS'; payload: ArchitectureSettings };

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'TOGGLE_OPEN':
      return { ...state, isOpen: !state.isOpen };

    case 'UPDATE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.key]: action.payload.value
        }
      };

    case 'LOAD_ARCHITECTURE_SETTINGS':
      return {
        ...state,
        settings: action.payload
      };

    default:
      return state;
  }
};

const AdvancedCoordinationSettings: React.FC<AdvancedCoordinationSettingsProps> = ({
  architecture,
  currentSettings,
  onSave
}) => {
  const config = getArchitectureSettings(architecture);

  const [state, dispatch] = useReducer(settingsReducer, {
    isOpen: false,
    settings: { ...config.settings, ...currentSettings }
  });

  // Update settings when architecture or currentSettings change
  useEffect(() => {
    const newConfig = getArchitectureSettings(architecture);
    dispatch({
      type: 'LOAD_ARCHITECTURE_SETTINGS',
      payload: { ...newConfig.settings, ...currentSettings }
    });
  }, [architecture, currentSettings]);

  const handleSettingChange = (key: string, value: any) => {
    dispatch({ type: 'UPDATE_SETTING', payload: { key, value } });
    // Auto-save on change
    const updatedSettings = { ...state.settings, [key]: value };
    onSave(updatedSettings);
  };

  const renderSettingInput = (setting: CoordinationSetting) => {
    const value = state.settings[setting.key];

    switch (setting.type) {
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleSettingChange(setting.key, newValue)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${setting.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleSettingChange(setting.key, parseInt(e.target.value))}
            min={setting.min}
            max={setting.max}
            className="w-full"
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={value}
              onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
            />
            <span className="text-sm">Enabled</span>
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {setting.options?.map(option => (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  checked={Array.isArray(value) && value.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentArray = Array.isArray(value) ? value : [];
                    if (checked) {
                      handleSettingChange(setting.key, [...currentArray, option]);
                    } else {
                      handleSettingChange(setting.key, currentArray.filter((v: string) => v !== option));
                    }
                  }}
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (!state.isOpen) {
    return (
      <div className="pt-4 border-t">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_OPEN' })}
          className="flex items-center gap-2 text-primary hover:underline text-sm"
        >
          <Settings className="w-4 h-4" />
          Advanced Coordination Settings - Configure how agents coordinate
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          {Object.entries(state.settings).slice(0, 2).map(([key, value]) => {
            const setting = config.availableSettings.find(s => s.key === key);
            return (
              <div key={key}>
                <span className="text-muted-foreground">{setting?.label || key}: </span>
                <strong>{Array.isArray(value) ? value.join(', ') : String(value)}</strong>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 border-t space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Advanced Coordination Settings
        </h4>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_OPEN' })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="w-4 h-4 rotate-180" />
        </button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-100">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <strong>Architecture: {architecture}</strong> - These settings control how agents coordinate in this architecture.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {config.availableSettings.map(setting => (
          <div key={setting.key} className="space-y-2">
            <div>
              <Label className="text-sm font-medium">{setting.label}</Label>
              {setting.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
              )}
            </div>
            {renderSettingInput(setting)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvancedCoordinationSettings;
