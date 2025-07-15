import React, { useState } from 'react'
import {
    BarChart3,
    Bot,
    Clock,
    Download,
    MessageSquare,
    Play,
    RotateCcw,
    Save,
    Settings,
    Upload,
    Users,
    Zap,
    Brain,
    Edit,
    Trash2,
    Plus,
    Search,
    MoreVertical,
    ChevronDown,
    LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Import the useAgents hook
// import { useAgents } from '@/hooks/useAgents'  // Uncomment when implementing

// Temporary mock implementation of useAgents hook
const useAgents = (params: { skip?: number; limit?: number } = {}) => {
    const mockAgents: Agent[] = [
        {
            id: '1',
            name: 'Personal Assistant',
            agent_type: 'personal',
            description: 'General purpose assistant for daily tasks',
            personality_traits: {
                formality: 80,
                empathy: 70,
                humor: 30,
                verbosity: 50,
            },
            agent_properties: {},
            config: {},
            voice_settings: {},
            user_id: 'user1',
        },
        {
            id: '2',
            name: 'Technical Support',
            agent_type: 'technical',
            description: 'Specialized in technical troubleshooting',
            personality_traits: {
                formality: 90,
                empathy: 50,
                humor: 10,
                verbosity: 40,
            },
            agent_properties: {},
            config: {},
            voice_settings: {},
            user_id: 'user1',
        },
        {
            id: '3',
            name: 'Creative Writer',
            agent_type: 'creative',
            description: 'Helps with creative writing and content',
            personality_traits: {
                formality: 30,
                empathy: 80,
                humor: 70,
                verbosity: 60,
            },
            agent_properties: {},
            config: {},
            voice_settings: {},
            user_id: 'user1',
        },
    ]

    return {
        data: mockAgents,
        isLoading: false,
        error: null,
    }
}

// Type definitions from the provided interfaces
interface PersonalityTraits {
    [key: string]: number
}

interface AgentProperties {
    [key: string]: any
}

interface AgentConfig {
    [key: string]: any
}

interface VoiceSettings {
    [key: string]: any
}

interface Agent {
    id: string
    name: string
    agent_type: string
    description: string
    personality_traits: PersonalityTraits
    agent_properties: AgentProperties
    config: AgentConfig
    voice_settings: VoiceSettings
    user_id: string
}

interface PersonalitySliders {
    formality: number
    empathy: number
    humor: number
    verbosity: number
}

interface IconOption {
    id: string
    icon: React.ComponentType<{ size?: number }>
    label: string
}

interface SliderComponentProps {
    label: string
    value: number
    onChange: (value: number) => void
    percentage: number
}

interface TabButtonProps {
    id: string
    label: string
    icon: React.ComponentType<{ size?: number }>
    active: boolean
    onClick: () => void
}

interface AgentCardProps {
    agent: Agent
    onEdit: (agent: Agent) => void
    onDelete: (agentId: string) => void
    isSelected?: boolean
    onClick?: () => void
}

type TabType = 'personality' | 'knowledge' | 'tools' | 'advanced'
type CommunicationTone =
    | 'Professional'
    | 'Casual'
    | 'Friendly'
    | 'Formal'
    | 'Conversational'

// Agent Selector Component
const AgentSelector: React.FC<{
    agents: Agent[]
    selectedAgent: Agent | null
    onSelectAgent: (agent: Agent) => void
    onCreateNew: () => void
}> = ({ agents, selectedAgent, onSelectAgent, onCreateNew }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredAgents = agents.filter(
        (agent) =>
            agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
                {selectedAgent ? (
                    <>
                        <Bot size={16} />
                        <span>{selectedAgent.name}</span>
                    </>
                ) : (
                    <>
                        <Plus size={16} />
                        <span>Select Agent</span>
                    </>
                )}
                <ChevronDown
                    size={16}
                    className={`transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-12 left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20 max-h-80 overflow-hidden">
                    <div className="p-3 border-b border-gray-600">
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search agents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredAgents.length > 0 ? (
                            filteredAgents.map((agent) => (
                                <button
                                    key={agent.id}
                                    onClick={() => {
                                        onSelectAgent(agent)
                                        setIsOpen(false)
                                    }}
                                    className="w-full p-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <Bot
                                            size={16}
                                            className="text-purple-400"
                                        />
                                        <div>
                                            <div className="font-medium">
                                                {agent.name}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {agent.description}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-400">
                                No agents found
                            </div>
                        )}
                        <button
                            onClick={() => {
                                onCreateNew()
                                setIsOpen(false)
                            }}
                            className="w-full p-3 text-left hover:bg-gray-700 transition-colors border-t border-gray-600 text-purple-400"
                        >
                            <div className="flex items-center gap-3">
                                <Plus size={16} />
                                <span>Create New Agent</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const AgentsSettings: React.FC = () => {
    // Fetch agents using the provided hook
    const { data: agents = [], isLoading, error } = useAgents()

    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('personality')
    const [selectedIcon, setSelectedIcon] = useState<string>('bot')
    const [selectedColor, setSelectedColor] = useState<string>('#8B5CF6')
    const [personalityTraits, setPersonalityTraits] = useState<string[]>([
        'analytical',
        'efficient',
        'neutral',
    ])
    const [personalitySliders, setPersonalitySliders] =
        useState<PersonalitySliders>({
            formality: 80,
            empathy: 30,
            humor: 10,
            verbosity: 40,
        })
    const [communicationTone, setCommunicationTone] =
        useState<CommunicationTone>('Professional')
    const [testInput, setTestInput] = useState<string>('')

    const colorOptions: string[] = [
        '#8B5CF6',
        '#3B82F6',
        '#10B981',
        '#EF4444',
        '#F59E0B',
        '#6366F1',
        '#6B7280',
        '#A855F7',
    ]

    const iconOptions: IconOption[] = [
        { id: 'bot', icon: Bot, label: 'Bot' },
        { id: 'message', icon: MessageSquare, label: 'Message' },
        { id: 'settings', icon: Settings, label: 'Settings' },
        { id: 'zap', icon: Zap, label: 'Zap' },
    ]

    const suggestedTraits: string[] = [
        'professional',
        'enthusiastic',
        'creative',
        'supportive',
        'detail-oriented',
        'proactive',
        'diplomatic',
    ]

    // Set first agent as selected when data loads
    React.useEffect(() => {
        if (agents.length > 0 && !selectedAgent) {
            setSelectedAgent(agents[0])
        }
    }, [agents, selectedAgent])

    const handleEditAgent = (agent: Agent) => {
        setSelectedAgent(agent)
        // Load agent settings into form
        if (agent.personality_traits) {
            setPersonalitySliders({
                formality: agent.personality_traits.formality || 50,
                empathy: agent.personality_traits.empathy || 50,
                humor: agent.personality_traits.humor || 50,
                verbosity: agent.personality_traits.verbosity || 50,
            })
        }
    }

    const handleDeleteAgent = (agentId: string) => {
        if (window.confirm('Are you sure you want to delete this agent?')) {
            // Implement delete logic
            console.log('Deleting agent:', agentId)
        }
    }

    const handleCreateNew = () => {
        // Open modal for creating new agent
        console.log('Creating new agent...')
    }

    const addTrait = (trait: string): void => {
        if (!personalityTraits.includes(trait)) {
            setPersonalityTraits([...personalityTraits, trait])
        }
    }

    const removeTrait = (trait: string): void => {
        setPersonalityTraits(personalityTraits.filter((t) => t !== trait))
    }

    const updateSlider = (
        key: keyof PersonalitySliders,
        value: number
    ): void => {
        setPersonalitySliders((prev) => ({ ...prev, [key]: value }))
    }

    const SliderComponent: React.FC<SliderComponentProps> = ({
        label,
        value,
        onChange,
        percentage,
    }) => (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">
                    {label}
                </span>
                <span className="text-sm text-gray-400">{percentage}%</span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                        background: `linear-gradient(to right, ${selectedColor} 0%, ${selectedColor} ${value}%, #374151 ${value}%, #374151 100%)`,
                    }}
                />
                <div
                    className="absolute top-0 w-4 h-2 bg-white rounded-full transform -translate-y-0"
                    style={{ left: `calc(${value}% - 8px)` }}
                />
            </div>
        </div>
    )

    const TabButton: React.FC<TabButtonProps> = ({
        id,
        label,
        icon: Icon,
        active,
        onClick,
    }) => (
        <button
            onClick={onClick}
            className={`cursor-pointer flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                active
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
        >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
        </button>
    )

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bot className="w-10 h-10 text-gray-400 animate-pulse" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">
                            Loading Agents...
                        </h2>
                        <p className="text-gray-400">
                            Please wait while we fetch your agents
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bot className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-red-400">
                            Error Loading Agents
                        </h2>
                        <p className="text-gray-400">
                            There was an error loading your agents. Please try
                            again.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (!selectedAgent || agents.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bot className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">
                            {agents.length === 0
                                ? 'No Agents Found'
                                : 'No Personal Assistant Selected'}
                        </h2>
                        <p className="text-gray-400 mb-8">
                            {agents.length === 0
                                ? 'Create your first agent to get started'
                                : 'Select an existing agent or create a new one to get started'}
                        </p>
                        <AgentSelector
                            agents={agents}
                            selectedAgent={null}
                            onSelectAgent={setSelectedAgent}
                            onCreateNew={handleCreateNew}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen size-full bg-gray-900 text-white p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">
                            {selectedAgent.name}
                        </h2>
                        <p className="text-gray-400">
                            {selectedAgent.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <AgentSelector
                        agents={agents}
                        selectedAgent={selectedAgent}
                        onSelectAgent={setSelectedAgent}
                        onCreateNew={handleCreateNew}
                    />
                    <Button variant={'default'} size={'lg'}>
                        <Save className="size-5" />
                        Save Configuration
                    </Button>
                </div>
            </div>

            <div className="size-full lg:grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex gap-2 mb-6">
                            <TabButton
                                id="personality"
                                label="Personality"
                                icon={Users}
                                active={activeTab === 'personality'}
                                onClick={() => setActiveTab('personality')}
                            />
                            <TabButton
                                id="knowledge"
                                label="Knowledge Base"
                                icon={BarChart3}
                                active={activeTab === 'knowledge'}
                                onClick={() => setActiveTab('knowledge')}
                            />
                            <TabButton
                                id="tools"
                                label="Tools & Skills"
                                icon={Zap}
                                active={activeTab === 'tools'}
                                onClick={() => setActiveTab('tools')}
                            />
                            <TabButton
                                id="advanced"
                                label="Advanced"
                                icon={Settings}
                                active={activeTab === 'advanced'}
                                onClick={() => setActiveTab('advanced')}
                            />
                        </div>

                        {activeTab === 'personality' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium mb-4">
                                        Agent Identity
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Icon
                                            </label>
                                            <div className="flex gap-2">
                                                {iconOptions.map(
                                                    ({ id, icon: Icon }) => (
                                                        <button
                                                            key={id}
                                                            onClick={() =>
                                                                setSelectedIcon(
                                                                    id
                                                                )
                                                            }
                                                            className={`p-2 rounded border-2 transition-colors ${
                                                                selectedIcon ===
                                                                id
                                                                    ? 'border-purple-500 bg-purple-600/20'
                                                                    : 'border-gray-600 hover:border-gray-500'
                                                            }`}
                                                        >
                                                            <Icon size={20} />
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Color Theme
                                            </label>
                                            <div className="flex gap-2">
                                                {colorOptions.map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() =>
                                                            setSelectedColor(
                                                                color
                                                            )
                                                        }
                                                        className={`w-8 h-8 rounded border-2 transition-all ${
                                                            selectedColor ===
                                                            color
                                                                ? 'border-white scale-110'
                                                                : 'border-gray-600 hover:border-gray-400'
                                                        }`}
                                                        style={{
                                                            backgroundColor:
                                                                color,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-4">
                                        Personality Traits
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {personalityTraits.map((trait) => (
                                            <span
                                                key={trait}
                                                className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm flex items-center gap-1"
                                            >
                                                {trait}
                                                <button
                                                    onClick={() =>
                                                        removeTrait(trait)
                                                    }
                                                    className="hover:text-red-400"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-400 mb-2">
                                            Suggested traits:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedTraits.map((trait) => (
                                                <button
                                                    key={trait}
                                                    onClick={() =>
                                                        addTrait(trait)
                                                    }
                                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full text-sm transition-colors"
                                                >
                                                    + {trait}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-4">
                                        Personality Sliders
                                    </h3>
                                    <SliderComponent
                                        label="🎭 Formality"
                                        value={personalitySliders.formality}
                                        onChange={(value) =>
                                            updateSlider('formality', value)
                                        }
                                        percentage={
                                            personalitySliders.formality
                                        }
                                    />
                                    <SliderComponent
                                        label="❤️ Empathy"
                                        value={personalitySliders.empathy}
                                        onChange={(value) =>
                                            updateSlider('empathy', value)
                                        }
                                        percentage={personalitySliders.empathy}
                                    />
                                    <SliderComponent
                                        label="😊 Humor"
                                        value={personalitySliders.humor}
                                        onChange={(value) =>
                                            updateSlider('humor', value)
                                        }
                                        percentage={personalitySliders.humor}
                                    />
                                    <SliderComponent
                                        label="🗣️ Verbosity"
                                        value={personalitySliders.verbosity}
                                        onChange={(value) =>
                                            updateSlider('verbosity', value)
                                        }
                                        percentage={
                                            personalitySliders.verbosity
                                        }
                                    />
                                </div>

                                <div>
                                    <h3 className="font-medium mb-4">
                                        Communication Tone
                                    </h3>
                                    <select
                                        value={communicationTone}
                                        onChange={(e) =>
                                            setCommunicationTone(
                                                e.target
                                                    .value as CommunicationTone
                                            )
                                        }
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="Professional">
                                            Professional
                                        </option>
                                        <option value="Casual">Casual</option>
                                        <option value="Friendly">
                                            Friendly
                                        </option>
                                        <option value="Formal">Formal</option>
                                        <option value="Conversational">
                                            Conversational
                                        </option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab !== 'personality' && (
                            <div className="text-center py-12 text-gray-400">
                                <Settings
                                    size={48}
                                    className="mx-auto mb-4 opacity-50"
                                />
                                <p>
                                    Configuration for {activeTab} coming soon...
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <Play size={16} />
                            Test Agent
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Test Input
                                </label>
                                <textarea
                                    value={testInput}
                                    onChange={(e) =>
                                        setTestInput(e.target.value)
                                    }
                                    placeholder="Enter a test message..."
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                                    rows={3}
                                />
                            </div>
                            <button className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors">
                                Test Response
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="font-medium mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700 rounded transition-colors">
                                <Download size={16} />
                                <span>Export Configuration</span>
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700 rounded transition-colors">
                                <Upload size={16} />
                                <span>Import Configuration</span>
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700 rounded transition-colors">
                                <RotateCcw size={16} />
                                <span>Reset to Defaults</span>
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700 rounded transition-colors">
                                <Clock size={16} />
                                <span>Version History</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AgentsSettings
