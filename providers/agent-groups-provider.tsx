'use client'

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from 'react'
import { useAgentGroups } from '@/hooks/api/use-agent-groups'
import { AgentGroupSummary, AgentGroupDetails } from '@/types/agent-group'

export interface AgentGroupContextType {
    // State
    agentGroups: AgentGroupSummary[]
    selectedAgentGroup: AgentGroupSummary | null
    isLoading: boolean
    error: any

    // Actions
    selectAgentGroup: (agentGroup: AgentGroupSummary) => void
    refreshAgentGroups: () => void
    clearSelection: () => void

    // Utilities
    getAgentGroupById: (id: string) => AgentGroupSummary | undefined
    isAgentGroupSelected: (id: string) => boolean
}

const AgentGroupContext = createContext<AgentGroupContextType | undefined>(undefined)

export interface AgentGroupProviderProps {
    children: React.ReactNode
    onAgentGroupChange?: (agentGroup: AgentGroupSummary | null) => void
    autoSelectFirst?: boolean
}

export function AgentGroupProvider({
    children,
    onAgentGroupChange,
    autoSelectFirst = true,
}: AgentGroupProviderProps) {
    const [selectedAgentGroup, setSelectedAgentGroup] = useState<AgentGroupSummary | null>(null)
    
    const {
        data: agentGroupsResponse,
        isLoading,
        error,
        refetch
    } = useAgentGroups()

    const agentGroups = agentGroupsResponse?.data?.items || []

    // Auto-select first agent group if enabled and no selection exists
    useEffect(() => {
        if (autoSelectFirst && agentGroups.length > 0 && !selectedAgentGroup) {
            setSelectedAgentGroup(agentGroups[0])
        }
    }, [agentGroups, selectedAgentGroup, autoSelectFirst])

    // Notify parent component of selection changes
    useEffect(() => {
        onAgentGroupChange?.(selectedAgentGroup)
    }, [selectedAgentGroup, onAgentGroupChange])

    const selectAgentGroup = useCallback((agentGroup: AgentGroupSummary) => {
        setSelectedAgentGroup(agentGroup)
    }, [])

    const refreshAgentGroups = useCallback(() => {
        refetch()
    }, [refetch])

    const clearSelection = useCallback(() => {
        setSelectedAgentGroup(null)
    }, [])

    const getAgentGroupById = useCallback(
        (id: string) => agentGroups.find((group) => group.group_id === id),
        [agentGroups]
    )

    const isAgentGroupSelected = useCallback(
        (id: string) => selectedAgentGroup?.group_id === id,
        [selectedAgentGroup]
    )

    const contextValue: AgentGroupContextType = {
        // State
        agentGroups,
        selectedAgentGroup,
        isLoading,
        error,

        // Actions
        selectAgentGroup,
        refreshAgentGroups,
        clearSelection,

        // Utilities
        getAgentGroupById,
        isAgentGroupSelected,
    }

    return (
        <AgentGroupContext.Provider value={contextValue}>
            {children}
        </AgentGroupContext.Provider>
    )
}

export function useAgentGroupContext(): AgentGroupContextType {
    const context = useContext(AgentGroupContext)
    if (context === undefined) {
        throw new Error('useAgentGroupContext must be used within an AgentGroupProvider')
    }
    return context
}

export function useSelectedAgentGroup(): AgentGroupSummary | null {
    const { selectedAgentGroup } = useAgentGroupContext()
    return selectedAgentGroup
}

export function useAgentGroupSelection() {
    const { selectedAgentGroup, selectAgentGroup, clearSelection } = useAgentGroupContext()
    return { selectedAgentGroup, selectAgentGroup, clearSelection }
}