'use client'

import { Agent } from '@/types/assistant'
import {
    Bot,
    Edit,
    LucideIcon,
    MoreVertical,
    Settings,
    Trash2,
    Users,
    Zap,
} from 'lucide-react'
import { useState } from 'react'

// Agent Card Component
type AgentCardProps = {
    agent: Agent
    onEdit: (agent: Agent) => void
    onDelete: (id: string) => void
    isSelected: boolean
    onClick: (e?: React.MouseEvent<HTMLDivElement>) => void
}
const AgentCard: React.FC<AgentCardProps> = ({
    agent,
    onEdit,
    onDelete,
    isSelected = false,
    onClick,
}) => {
    const [showDropdown, setShowDropdown] = useState(false)

    const getAgentIcon = (agentType: string): LucideIcon => {
        switch (agentType.toLowerCase()) {
            case 'personal':
                return Users
            case 'technical':
                return Settings
            case 'creative':
                return Zap
            default:
                return Bot
        }
    }

    const getAgentColor = (agentType: string): string => {
        switch (agentType.toLowerCase()) {
            case 'personal':
                return '#8B5CF6'
            case 'technical':
                return '#3B82F6'
            case 'creative':
                return '#10B981'
            default:
                return '#6B7280'
        }
    }

    const AgentIcon = getAgentIcon(agent.agent_type)
    const agentColor = getAgentColor(agent.agent_type)

    return (
        <div
            className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700 ${
                isSelected ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                            backgroundColor: `${agentColor}20`,
                            color: agentColor,
                        }}
                    >
                        <AgentIcon size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-white truncate">
                            {agent.name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                            {agent.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
                                {agent.agent_type}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowDropdown(!showDropdown)
                        }}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                    >
                        <MoreVertical size={16} className="text-gray-400" />
                    </button>
                    {showDropdown && (
                        <div className="absolute right-0 top-8 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(agent)
                                    setShowDropdown(false)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-600 transition-colors text-sm"
                            >
                                <Edit size={14} />
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(agent.id)
                                    setShowDropdown(false)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-600 transition-colors text-sm text-red-400"
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
