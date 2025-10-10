import { BookOpen, Target, Lightbulb, LucideIcon } from 'lucide-react';

export interface TierColorClasses {
  badge: string;
  icon: string;
}

export interface CognitiveTier {
  id: string;
  name: string;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'amber';
  description: string;
  capabilities: string[];
}

export const TIER_COLOR_CLASSES: Record<string, TierColorClasses> = {
  blue: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  purple: {
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    icon: 'text-purple-600 dark:text-purple-400'
  },
  amber: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400'
  }
};

export const COGNITIVE_TIERS: Record<string, CognitiveTier> = {
  tier_1: {
    id: 'tier_1',
    name: 'Cognitive Guidance',
    icon: BookOpen,
    color: 'blue',
    description: 'Foundational learning and problem-solving',
    capabilities: [
      'Generate adaptive practice problems',
      'Deliver immediate feedback',
      'Break down complex concepts',
      'Track understanding'
    ]
  },
  tier_2: {
    id: 'tier_2',
    name: 'Metacognitive Development',
    icon: Target,
    color: 'purple',
    description: 'Reflection and strategic thinking',
    capabilities: [
      'Guide strategy selection',
      'Promote self-monitoring',
      'Facilitate error analysis',
      'Develop reflective habits'
    ]
  },
  tier_3: {
    id: 'tier_3',
    name: 'Socratic Inquiry',
    icon: Lightbulb,
    color: 'amber',
    description: 'Deep questioning and assumption challenging',
    capabilities: [
      'Challenge assumptions',
      'Explore implications',
      'Facilitate argument construction',
      'Guide philosophical thinking'
    ]
  }
};

export const DEFAULT_TIER_MAPPING: Record<string, string[]> = {
  researcher: ['tier_1'],
  developer: ['tier_1'],
  specialist: ['tier_1'],
  analyst: ['tier_2'],
  manager: ['tier_2'],
  strategist: ['tier_2'],
  debater: ['tier_3'],
  skeptic: ['tier_3'],
  facilitator: ['tier_3'],
  generalist: ['tier_1', 'tier_2', 'tier_3'],
  orchestrator: [],
  meta_coordinator: []
};

export const COMPATIBILITY_WARNINGS: Record<string, Record<string, string>> = {
  sequential: {
    tier_3: "Warning: Socratic inquiry in sequential chains may cause processing delays. Consider using debate architecture for deep philosophical questioning."
  },
  none: {
    multiple: "Warning: Single agent architecture works best with one primary tier. Consider supervisor or adaptive architecture for multi-tier needs."
  }
};
