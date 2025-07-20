import { useAgents } from '@/hooks/api/use-agents'
import {
    Agent,
    AgentConfig,
    AgentProperties,
    PersonalityTraits,
    VoiceSettings,
} from '@/types/agent'
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from 'react'

export interface AgentContextType {
    // State
    agents: Agent[]
    selectedAgent: Agent | null
    isLoading: boolean
    error: any

    // Actions
    selectAgent: (agent: Agent) => void
    updateSelectedAgent: (updates: Partial<Agent>) => void
    updateAgentProperty: <K extends keyof Agent>(
        key: K,
        value: Agent[K]
    ) => void
    updateAgentProperties: (updates: Partial<AgentProperties>) => void
    updatePersonalityTraits: (updates: Partial<PersonalityTraits>) => void
    updateConfig: (updates: Partial<AgentConfig>) => void
    updateVoiceSettings: (updates: Partial<VoiceSettings>) => void
    refreshAgents: () => void
    clearSelection: () => void

    // Utilities
    getAgentById: (id: string) => Agent | undefined
    isAgentSelected: (id: string) => boolean
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export interface AgentProviderProps {
    children: React.ReactNode
    onAgentChange?: (agent: Agent | null) => void
    onAgentUpdate?: (agent: Agent) => void
    autoSelectFirst?: boolean
}

//FIXME: Temporary mock implementation of useAgents hook
const useMockAgents = (params: { skip?: number; limit?: number } = {}) => {
    const mockAgents: Agent[] = [
        {
            id: '1',
            name: 'Personal Assistant',
            agent_type: 'support_assistant',
            description: 'General purpose assistant for daily tasks',
            personality_traits: {
                formal: 0.8,
                friendly: 0.7,
                professional: 0.9,
                conversational: 0.6,
                humorous: 0.3,
                serious: 0.7,
                direct: 0.5,
                verbose: 0.5,
            },
            agent_properties: {
                name: 'Personal Assistant',
                tone: 'Professional and helpful',
                objective: 'Assist with daily tasks and productivity',
                socratic_approach: 'No',
                conversation_style: 'Direct and efficient',
                response_to_greetings: 'Professional and warm',
                focus: 'Task completion',
                interactivity: 'Provide clear instructions',
                response_format: 'Structured',
                personality_traits: ['efficient', 'reliable', 'organized'],
            },
            config: {
                max_history: 20,
                temperature: 0.3,
                model: 'gpt-4o',
            },
            voice_settings: {
                enabled: true,
                voice_id: 'en_us_002',
                speaking_rate: 1.0,
                pitch: 0,
                volume: 1,
            },
            user_id: 'user1',
        },
        {
            id: '2',
            name: 'Technical Support',
            agent_type: 'technical_assistant',
            description: 'Specialized in technical troubleshooting',
            personality_traits: {
                formal: 0.9,
                friendly: 0.5,
                professional: 0.95,
                conversational: 0.4,
                humorous: 0.1,
                serious: 0.9,
                direct: 0.8,
                verbose: 0.4,
            },
            agent_properties: {
                name: 'Technical Support',
                tone: 'Professional and precise',
                objective: 'Solve technical problems efficiently',
                socratic_approach: 'Yes',
                conversation_style: 'Methodical and thorough',
                response_to_greetings: 'Professional',
                focus: 'Problem resolution',
                interactivity: 'Ask diagnostic questions',
                response_format: 'Step-by-step',
                personality_traits: ['analytical', 'methodical', 'patient'],
            },
            config: {
                max_history: 30,
                temperature: 0.2,
                model: 'gpt-4o',
            },
            voice_settings: {
                enabled: false,
                voice_id: 'en_us_003',
                speaking_rate: 0.9,
                pitch: 0,
                volume: 1,
            },
            user_id: 'user1',
        },
        {
            id: '3',
            name: 'Creative Writer',
            agent_type: 'creative_assistant',
            description: 'Helps with creative writing and content',
            personality_traits: {
                formal: 0.3,
                friendly: 0.8,
                professional: 0.6,
                conversational: 0.9,
                humorous: 0.7,
                serious: 0.4,
                direct: 0.5,
                verbose: 0.6,
            },
            agent_properties: {
                name: 'Creative Writer',
                tone: 'Inspiring and encouraging',
                objective: 'Foster creativity and help with writing',
                socratic_approach: 'Yes',
                conversation_style: 'Engaging and supportive',
                response_to_greetings: 'Warm and enthusiastic',
                focus: 'Creative expression',
                interactivity: 'Encourage exploration',
                response_format: 'Conversational',
                personality_traits: [
                    'imaginative',
                    'encouraging',
                    'expressive',
                ],
            },
            config: {
                max_history: 25,
                temperature: 0.7,
                model: 'gpt-4o',
            },
            voice_settings: {
                enabled: true,
                voice_id: 'en_us_004',
                speaking_rate: 1.1,
                pitch: 0.1,
                volume: 1,
            },
            user_id: 'user1',
        },
    ]

    return {
        data: mockAgents,
        isLoading: false,
        error: null,
    }
}

export const AgentProvider: React.FC<AgentProviderProps> = ({
    children,
    onAgentChange,
    onAgentUpdate,
    autoSelectFirst = true,
}) => {
    const { data: data, isLoading, error } = useAgents()
    const agents = data?.data || []
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

    // Auto-select first agent when agents load
    useEffect(() => {
        if (autoSelectFirst && agents && agents.length > 0 && !selectedAgent) {
            const firstAgent = agents.reverse()[0]
            setSelectedAgent(firstAgent)
            onAgentChange?.(firstAgent)
        }
    }, [agents, selectedAgent, autoSelectFirst, onAgentChange])

    // Actions
    const selectAgent = useCallback(
        (agent: Agent) => {
            setSelectedAgent(agent)
            onAgentChange?.(agent)
        },
        [onAgentChange]
    )

    const updateSelectedAgent = useCallback(
        (updates: Partial<Agent>) => {
            if (!selectedAgent) return

            const updatedAgent = { ...selectedAgent, ...updates }
            setSelectedAgent(updatedAgent)
            onAgentUpdate?.(updatedAgent)
        },
        [selectedAgent, onAgentUpdate]
    )

    const updateAgentProperty = useCallback(
        <K extends keyof Agent>(key: K, value: Agent[K]) => {
            if (!selectedAgent) return

            const updatedAgent = { ...selectedAgent, [key]: value }
            setSelectedAgent(updatedAgent)
            onAgentUpdate?.(updatedAgent)
        },
        [selectedAgent, onAgentUpdate]
    )

    const updateAgentProperties = useCallback(
        (updates: Partial<AgentProperties>) => {
            if (!selectedAgent) return

            const updatedAgent = {
                ...selectedAgent,
                agent_properties: {
                    ...selectedAgent.agent_properties,
                    ...updates,
                },
            }
            setSelectedAgent(updatedAgent)
            onAgentUpdate?.(updatedAgent)
        },
        [selectedAgent, onAgentUpdate]
    )

    const updatePersonalityTraits = useCallback(
        (updates: Partial<PersonalityTraits>) => {
            if (!selectedAgent) return

            const updatedAgent = {
                ...selectedAgent,
                personality_traits: {
                    ...selectedAgent.personality_traits,
                    ...updates,
                },
            } as Agent
            setSelectedAgent(updatedAgent)
            onAgentUpdate?.(updatedAgent)
        },
        [selectedAgent, onAgentUpdate]
    )

    const updateConfig = useCallback(
        (updates: Partial<AgentConfig>) => {
            if (!selectedAgent) return

            const updatedAgent = {
                ...selectedAgent,
                config: { ...selectedAgent.config, ...updates },
            }
            setSelectedAgent(updatedAgent)
            onAgentUpdate?.(updatedAgent)
        },
        [selectedAgent, onAgentUpdate]
    )

    const updateVoiceSettings = useCallback(
        (updates: Partial<VoiceSettings>) => {
            if (!selectedAgent) return

            const updatedAgent = {
                ...selectedAgent,
                voice_settings: { ...selectedAgent.voice_settings, ...updates },
            }
            setSelectedAgent(updatedAgent)
            onAgentUpdate?.(updatedAgent)
        },
        [selectedAgent, onAgentUpdate]
    )

    const refreshAgents = useCallback(() => {
        // This would typically trigger a refetch of the useAgents hook
        // The implementation depends on your data fetching library
        // For react-query: queryClient.invalidateQueries(['agents'])
        // For SWR: mutate('/api/agents')
        console.log('Refresh agents triggered')
    }, [])

    const clearSelection = useCallback(() => {
        setSelectedAgent(null)
        onAgentChange?.(null)
    }, [onAgentChange])

    // Utilities
    const getAgentById = useCallback(
        (id: string): Agent | undefined => {
            return agents.find((agent) => agent.id === id)
        },
        [agents]
    )

    const isAgentSelected = useCallback(
        (id: string): boolean => {
            return selectedAgent?.id === id
        },
        [selectedAgent]
    )

    const contextValue: AgentContextType = {
        // State
        agents,
        selectedAgent,
        isLoading,
        error,

        // Actions
        selectAgent,
        updateSelectedAgent,
        updateAgentProperty,
        updateAgentProperties,
        updatePersonalityTraits,
        updateConfig,
        updateVoiceSettings,
        refreshAgents,
        clearSelection,

        // Utilities
        getAgentById,
        isAgentSelected,
    }

    return (
        <AgentContext.Provider value={contextValue}>
            {children}
        </AgentContext.Provider>
    )
}

// Hook to use the agent context
export const useAgentContext = (): AgentContextType => {
    const context = useContext(AgentContext)
    if (context === undefined) {
        throw new Error('useAgentContext must be used within an AgentProvider')
    }
    return context
}

// Convenience hooks for specific operations
export const useSelectedAgent = () => {
    const { selectedAgent } = useAgentContext()
    return selectedAgent
}

export const useAgentSelection = () => {
    const { selectAgent, selectedAgent, clearSelection } = useAgentContext()
    return { selectAgent, selectedAgent, clearSelection }
}

export const useAgentUpdates = () => {
    const {
        updateSelectedAgent,
        updateAgentProperty,
        updateAgentProperties,
        updatePersonalityTraits,
        updateConfig,
        updateVoiceSettings,
    } = useAgentContext()

    return {
        updateSelectedAgent,
        updateAgentProperty,
        updateAgentProperties,
        updatePersonalityTraits,
        updateConfig,
        updateVoiceSettings,
    }
}
