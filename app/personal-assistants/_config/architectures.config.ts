import { User, Crown, Users, Network, ArrowRight, Scale, Shuffle, LucideIcon } from 'lucide-react';

export interface RequiredRole {
  role: string;
  min: number;
  max: number;
  suggested: string[];
}

export interface ArchitectureConfig {
  label: string;
  icon: LucideIcon;
  colorClasses: string;
  iconColor: string;
  description: string;
  requiredRoles: RequiredRole[];
  estimatedCost: string;
}

export interface CoordinationSetting {
  key: string;
  label: string;
  type: 'select' | 'number' | 'checkbox' | 'multiselect';
  options?: string[];
  min?: number;
  max?: number;
}

export interface CoordinationConfig {
  settings: Record<string, any>;
  availableSettings: CoordinationSetting[];
}

export const getArchitectureConfigs = (): Record<string, ArchitectureConfig> => ({
  none: {
    label: 'None (Single Agent)',
    icon: User,
    colorClasses: 'text-gray-500 bg-gray-50 border-gray-500 dark:bg-gray-900',
    iconColor: 'text-gray-600 dark:text-gray-400',
    description: 'Single agent handles all tasks independently',
    requiredRoles: [
      { role: 'standalone', min: 1, max: 1, suggested: ['generalist'] }
    ],
    estimatedCost: '$'
  },
  supervisor: {
    label: 'Supervisor',
    icon: Crown,
    colorClasses: 'text-blue-500 bg-blue-50 border-blue-500 dark:bg-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400',
    description: 'Central coordinator intelligently delegates tasks to specialist agents',
    requiredRoles: [
      { role: 'coordinator', min: 1, max: 1, suggested: ['orchestrator'] },
      { role: 'specialist', min: 2, max: 5, suggested: ['researcher', 'analyst', 'writer', 'critic'] }
    ],
    estimatedCost: '$$'
  },
  hierarchical: {
    label: 'Hierarchical Teams',
    icon: Users,
    colorClasses: 'text-purple-500 bg-purple-50 border-purple-500 dark:bg-purple-900',
    iconColor: 'text-purple-600 dark:text-purple-400',
    description: 'Multi-level structure with team leads managing specialists',
    requiredRoles: [
      { role: 'senior_supervisor', min: 1, max: 1, suggested: ['strategist'] },
      { role: 'team_lead', min: 2, max: 3, suggested: ['manager'] },
      { role: 'specialist', min: 4, max: 8, suggested: ['developer', 'analyst', 'researcher'] }
    ],
    estimatedCost: '$$$'
  },
  network: {
    label: 'Collaborative Network',
    icon: Network,
    colorClasses: 'text-green-500 bg-green-50 border-green-500 dark:bg-green-900',
    iconColor: 'text-green-600 dark:text-green-400',
    description: 'Peer agents communicate directly and self-organize',
    requiredRoles: [
      { role: 'peer', min: 3, max: 6, suggested: ['collaborator', 'researcher', 'analyst', 'creative'] }
    ],
    estimatedCost: '$$'
  },
  sequential: {
    label: 'Sequential Chain',
    icon: ArrowRight,
    colorClasses: 'text-orange-500 bg-orange-50 border-orange-500 dark:bg-orange-900',
    iconColor: 'text-orange-600 dark:text-orange-400',
    description: 'Each agent processes and enriches information in sequence',
    requiredRoles: [
      { role: 'processor', min: 2, max: 5, suggested: ['researcher', 'analyst', 'synthesizer', 'reviewer'] }
    ],
    estimatedCost: '$$'
  },
  debate: {
    label: 'Debate/Adversarial',
    icon: Scale,
    colorClasses: 'text-red-500 bg-red-50 border-red-500 dark:bg-red-900',
    iconColor: 'text-red-600 dark:text-red-400',
    description: 'Agents argue different positions to test ideas',
    requiredRoles: [
      { role: 'moderator', min: 1, max: 1, suggested: ['facilitator'] },
      { role: 'advocate', min: 2, max: 3, suggested: ['debater'] },
      { role: 'critic', min: 1, max: 1, suggested: ['skeptic'] }
    ],
    estimatedCost: '$$'
  },
  adaptive: {
    label: 'Adaptive/Hybrid',
    icon: Shuffle,
    colorClasses: 'text-indigo-500 bg-indigo-50 border-indigo-500 dark:bg-indigo-900',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    description: 'Dynamically adjusts architecture based on task',
    requiredRoles: [
      { role: 'orchestrator', min: 1, max: 1, suggested: ['meta_coordinator'] },
      { role: 'flexible', min: 3, max: 5, suggested: ['generalist', 'specialist'] }
    ],
    estimatedCost: '$$$'
  }
});

export const getCoordinationConfigs = (): Record<string, CoordinationConfig> => ({
  none: {
    settings: {
      autonomyLevel: 'full',
      selfMonitoring: true,
      maxProcessingTime: 30
    },
    availableSettings: [
      { key: 'autonomyLevel', label: 'Autonomy Level', type: 'select', options: ['full', 'guided', 'supervised'] },
      { key: 'selfMonitoring', label: 'Self-Monitoring', type: 'checkbox' },
      { key: 'maxProcessingTime', label: 'Max Processing Time (minutes)', type: 'number', min: 1, max: 60 }
    ]
  },
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
      { key: 'delegationStrategy', label: 'Delegation Strategy', type: 'select',
        options: ['expertise-based', 'workload-balanced', 'round-robin', 'priority-based'] },
      { key: 'maxConcurrentTasks', label: 'Max Concurrent Tasks', type: 'number', min: 1, max: 10 },
      { key: 'escalationThreshold', label: 'Escalation Threshold (seconds)', type: 'number', min: 10, max: 300 },
      { key: 'synthesisMethod', label: 'Synthesis Method', type: 'select',
        options: ['coordinator-decision', 'weighted-consensus', 'majority-vote'] },
      { key: 'requireSpecialistApproval', label: 'Require Specialist Approval', type: 'checkbox' },
      { key: 'coordinatorOverride', label: 'Allow Coordinator Override', type: 'checkbox' }
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
      { key: 'reportingFrequency', label: 'Reporting Frequency', type: 'select',
        options: ['real-time', 'milestone', 'scheduled', 'on-request'] },
      { key: 'decisionEscalation', label: 'Decision Escalation', type: 'select',
        options: ['automatic', 'manual', 'threshold-based'] },
      { key: 'crossTeamCommunication', label: 'Cross-Team Communication', type: 'select',
        options: ['through-leads', 'direct-allowed', 'senior-mediated'] },
      { key: 'resourceAllocation', label: 'Resource Allocation', type: 'select',
        options: ['senior-controlled', 'team-lead-managed', 'distributed'] },
      { key: 'conflictResolution', label: 'Conflict Resolution', type: 'select',
        options: ['escalate-up', 'peer-mediation', 'senior-arbitration'] }
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
      { key: 'communicationPattern', label: 'Communication Pattern', type: 'select',
        options: ['open-mesh', 'hub-based', 'clustered'] },
      { key: 'consensusThreshold', label: 'Consensus Threshold (%)', type: 'number', min: 50, max: 100 },
      { key: 'leadershipModel', label: 'Leadership Model', type: 'select',
        options: ['rotating', 'emergent', 'none', 'elected'] },
      { key: 'informationSharing', label: 'Information Sharing', type: 'select',
        options: ['broadcast', 'targeted', 'opt-in'] },
      { key: 'decisionMaking', label: 'Decision Making', type: 'select',
        options: ['collaborative', 'voting', 'consensus-required'] }
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
      { key: 'handoffTriggers', label: 'Handoff Triggers', type: 'multiselect',
        options: ['completion', 'timeout', 'quality-threshold', 'manual-trigger'] },
      { key: 'backflowAllowed', label: 'Allow Backflow to Previous Agents', type: 'checkbox' },
      { key: 'qualityGates', label: 'Quality Gates', type: 'select',
        options: ['each-step', 'milestone-only', 'final-only', 'none'] },
      { key: 'timeoutHandling', label: 'Timeout Handling', type: 'select',
        options: ['skip-agent', 'retry', 'escalate', 'abort'] },
      { key: 'progressTracking', label: 'Progress Tracking', type: 'select',
        options: ['detailed', 'milestone', 'minimal'] }
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
      { key: 'debateRounds', label: 'Maximum Debate Rounds', type: 'number', min: 1, max: 10 },
      { key: 'argumentTimeLimit', label: 'Argument Time Limit (seconds)', type: 'number', min: 30, max: 600 },
      { key: 'moderatorStyle', label: 'Moderator Style', type: 'select',
        options: ['neutral', 'probing', 'challenging', 'supportive'] },
      { key: 'evidenceRequirement', label: 'Evidence Requirement', type: 'select',
        options: ['citations-required', 'evidence-preferred', 'logic-based', 'open'] },
      { key: 'resolutionMethod', label: 'Resolution Method', type: 'select',
        options: ['moderator-synthesis', 'voting', 'consensus', 'strongest-argument'] }
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
      { key: 'adaptationTriggers', label: 'Adaptation Triggers', type: 'multiselect',
        options: ['performance-metrics', 'time-constraints', 'complexity-analysis', 'resource-availability'] },
      { key: 'evaluationFrequency', label: 'Evaluation Frequency', type: 'select',
        options: ['real-time', 'task-completion', 'scheduled', 'threshold-based'] },
      { key: 'architecturePool', label: 'Available Architectures', type: 'multiselect',
        options: ['supervisor', 'hierarchical', 'network', 'sequential', 'debate'] },
      { key: 'adaptationThreshold', label: 'Adaptation Threshold (%)', type: 'number', min: 5, max: 50 },
      { key: 'learningEnabled', label: 'Enable Learning from Past Adaptations', type: 'checkbox' }
    ]
  }
});
