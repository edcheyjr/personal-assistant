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
