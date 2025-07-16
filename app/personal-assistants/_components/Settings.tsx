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
    Moon,
    Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setStorageItem } from '@/utils/localstorageAccess'
import { ColorKey } from '@/utils/constants'
import { SliderComponent } from '@/components/Slider'
import Select from '@/components/inputs/select-input'

import type {
    Agent,
    PersonalityTraits,
    AgentProperties,
    AgentConfig,
    VoiceSettings,
    AgentType,
    UpdateAgentRequest,
} from '@/types/agent'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/cn'
import { Label } from '@radix-ui/react-label'
import { FormMessages } from '@/components/MessageInfo'
import { useAgents } from '@/hooks/api/use-agents'

// Temporary mock implementation of useAgents hook
const useMockAgents = (params: { skip?: number; limit?: number } = {}) => {
    const mockAgents: Agent[] = [
        {
            id: '1',
            name: 'Personal Assistant',
            agent_type: 'personal',
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
            agent_type: 'technical',
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
            agent_type: 'creative',
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

// Updated interface for personality sliders to match our types
interface PersonalitySliders {
    formal: number
    friendly: number
    professional: number
    conversational: number
    humorous: number
    serious: number
    direct: number
    verbose: number
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
    selectedColor: string
}

interface TabButtonProps {
    id: string
    label: string
    icon: React.ComponentType<{ size?: number }>
    active: boolean
    onClick: () => void
    selectedColor: string
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

// Theme context
const ThemeContext = React.createContext<{
    theme: 'light' | 'dark'
    toggleTheme: () => void
}>({
    theme: 'dark',
    toggleTheme: () => {},
})

const communicationTones: CommunicationTone[] = [
    'Professional',
    'Casual',
    'Friendly',
    'Formal',
    'Conversational',
]

// Helper function to convert personality traits to sliders
const personalityTraitsToSliders = (
    traits: PersonalityTraits
): PersonalitySliders => {
    return {
        formal: Math.round(traits.formal * 100),
        friendly: Math.round(traits.friendly * 100),
        professional: Math.round(traits.professional * 100),
        conversational: Math.round(traits.conversational * 100),
        humorous: Math.round(traits.humorous * 100),
        serious: Math.round(traits.serious * 100),
        direct: Math.round(traits.direct * 100),
        verbose: Math.round(traits.verbose * 100),
    }
}

// Helper function to convert sliders back to personality traits
const slidersToPersonalityTraits = (
    sliders: PersonalitySliders
): PersonalityTraits => {
    return {
        formal: sliders.formal / 100,
        friendly: sliders.friendly / 100,
        professional: sliders.professional / 100,
        conversational: sliders.conversational / 100,
        humorous: sliders.humorous / 100,
        serious: sliders.serious / 100,
        direct: sliders.direct / 100,
        verbose: sliders.verbose / 100,
    }
}

// Agent Selector Component
const AgentSelector: React.FC<{
    agents: Agent[]
    selectedAgent: Agent | null
    onSelectAgent: (agent: Agent) => void
    onCreateNew: () => void
    selectedColor: string
}> = ({ agents, selectedAgent, selectedColor, onSelectAgent, onCreateNew }) => {
    console.log('agents', agents)
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredAgents = Array.isArray(agents)
        ? agents.filter(
              (agent) =>
                  agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  agent.description
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
          )
        : []

    return (
        <div className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors w-full z-1"
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
                <div className="absolute top-12 left-0 right-0 bg-popover border border-border rounded-lg shadow-lg z-20 max-h-80 overflow-hidden">
                    <div className="p-3 border-b border-border">
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                type="text"
                                placeholder="Search agents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                    className="w-full p-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <Bot
                                            size={16}
                                            className="text-primary"
                                        />
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {agent.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {agent.description}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted-foreground">
                                No agents found
                            </div>
                        )}
                        <button
                            onClick={() => {
                                onCreateNew()
                                setIsOpen(false)
                            }}
                            className="w-full p-3 text-left hover:bg-accent transition-colors border-t border-border text-primary bg-dark"
                            style={{ color: selectedColor }}
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

    const selectCommunicationTone = communicationTones.map((tone) => ({
        value: tone,
        label: tone,
    }))

    const [basicInfo, setBasicInfo] = useState({
        title: '',
        description: '',
    })
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
            formal: 80,
            friendly: 30,
            professional: 90,
            conversational: 40,
            humorous: 10,
            serious: 80,
            direct: 70,
            verbose: 40,
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

    // Set first agent as selected when data loads and populate form
    React.useEffect(() => {
        if (agents.length > 0 && !selectedAgent) {
            const firstAgent = agents[0]
            setSelectedAgent(firstAgent)
            setBasicInfo({
                title: firstAgent.name,
                description: firstAgent.description,
            })
            loadAgentData(firstAgent)
        }
    }, [agents, selectedAgent])

    const loadAgentData = (agent: Agent) => {
        // Load personality sliders
        setPersonalitySliders(
            personalityTraitsToSliders(agent.personality_traits)
        )

        // Load personality traits from agent_properties
        if (agent.agent_properties.personality_traits) {
            setPersonalityTraits(agent.agent_properties.personality_traits)
        }

        // Load communication tone from agent_properties
        if (agent.agent_properties.tone) {
            const tone = agent.agent_properties.tone
            const matchedTone = communicationTones.find((t) =>
                tone.toLowerCase().includes(t.toLowerCase())
            )
            if (matchedTone) {
                setCommunicationTone(matchedTone)
            }
        }
    }

    const handleEditAgent = (agent: Agent) => {
        setSelectedAgent(agent)
        loadAgentData(agent)
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

    const handleSaveConfiguration = () => {
        if (!selectedAgent) return

        const updatedAgent: UpdateAgentRequest = {
            ...selectedAgent,
            name: basicInfo.title,
            description: basicInfo.description,
            personality_traits: slidersToPersonalityTraits(personalitySliders),
            agent_properties: {
                ...selectedAgent.agent_properties,
                personality_traits: personalityTraits,
                tone: communicationTone,
            },
        }

        console.log('Saving agent configuration:', updatedAgent)
        // Implement save logic here
    }

    const handleThemeManagement = (color: string) => {
        setSelectedColor(color)
        setStorageItem(ColorKey, color)
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

    const TabButton: React.FC<TabButtonProps> = ({
        id,
        label,
        icon: Icon,
        active,
        onClick,
        selectedColor,
    }) => (
        <button
            onClick={onClick}
            className={`cursor-pointer flex items-center gap-2 px-4 py-3 rounded-t-sm transition-all ${
                active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            style={
                active
                    ? {
                          backgroundColor: selectedColor,
                      }
                    : undefined
            }
        >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
        </button>
    )

    if (isLoading) {
        return (
            <div className="size-full bg-background text-foreground p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bot className="w-10 h-10 text-muted-foreground animate-pulse" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">
                            Loading Agents...
                        </h2>
                        <p className="text-muted-foreground">
                            Please wait while we fetch your agents
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="size-full bg-background text-foreground p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-20">
                        <div className="size-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bot className="size-10 text-destructive" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-destructive">
                            Error Loading Agents
                        </h2>
                        <p className="text-muted-foreground">
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
            <div className="size-full bg-background text-foreground p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-20">
                        <div className="size-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bot className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">
                            {agents.length === 0
                                ? 'No Agents Found'
                                : 'No Personal Assistant Selected'}
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            {agents.length === 0
                                ? 'Create your first agent to get started'
                                : 'Select an existing agent or create a new one to get started'}
                        </p>
                        <AgentSelector
                            agents={agents}
                            selectedAgent={null}
                            selectedColor={selectedColor}
                            onSelectAgent={setSelectedAgent}
                            onCreateNew={handleCreateNew}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="size-full bg-background text-foreground p-6">
            <div className="flex flex-wrap gap-6 justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div
                        className="size-12 bg-primary rounded-lg flex items-center justify-center "
                        style={{ backgroundColor: selectedColor }}
                    >
                        <Brain className="size-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">
                            {selectedAgent.name}
                        </h2>
                        <p className="text-muted-foreground">
                            {selectedAgent.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-full max-w-56">
                        <AgentSelector
                            agents={agents}
                            selectedAgent={selectedAgent}
                            onSelectAgent={(agent) => {
                                setSelectedAgent(agent)
                                loadAgentData(agent)
                            }}
                            onCreateNew={handleCreateNew}
                            selectedColor={selectedColor}
                        />
                    </div>
                    <Button
                        variant={'default'}
                        size={'lg'}
                        className="font-bold"
                        onClick={handleSaveConfiguration}
                        style={{
                            backgroundColor: selectedColor,
                            padding: `0 20px`,
                        }}
                    >
                        <Save className="size-5 stroke-2" />
                        Save Configuration
                    </Button>
                </div>
            </div>

            <div className="size-full lg:grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex mb-6 border-b gap-2">
                            <TabButton
                                id="personality"
                                label="Personality"
                                icon={Users}
                                selectedColor={selectedColor}
                                active={activeTab === 'personality'}
                                onClick={() => setActiveTab('personality')}
                            />
                            <TabButton
                                id="knowledge"
                                label="Knowledge Base"
                                icon={BarChart3}
                                selectedColor={selectedColor}
                                active={activeTab === 'knowledge'}
                                onClick={() => setActiveTab('knowledge')}
                            />
                            <TabButton
                                id="tools"
                                label="Tools & Skills"
                                selectedColor={selectedColor}
                                icon={Zap}
                                active={activeTab === 'tools'}
                                onClick={() => setActiveTab('tools')}
                            />
                            <TabButton
                                id="advanced"
                                label="Advanced"
                                selectedColor={selectedColor}
                                icon={Settings}
                                active={activeTab === 'advanced'}
                                onClick={() => setActiveTab('advanced')}
                            />
                        </div>

                        {activeTab === 'personality' && (
                            <div className="space-y-6">
                                <div className="border-b w-full pb-6">
                                    <h3 className="font-medium mb-6">
                                        Basic Information
                                    </h3>
                                    <div className="grid min-[2048px]:grid-cols-2 gap-2">
                                        <div className="w-full mb-4  min-[2048px]:mb-0 flex-1 space-y-4">
                                            <Label className="block text-sm font-medium mb-2">
                                                Title
                                            </Label>
                                            <Textarea
                                                value={basicInfo.title}
                                                onChange={({ target }) =>
                                                    setBasicInfo((prev) => ({
                                                        ...prev,
                                                        title: target.value,
                                                    }))
                                                }
                                                placeholder="Type your message..."
                                                className={cn(
                                                    'min-h-[52px] max-h-[120px] resize-none transition-all duration-200',
                                                    'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:border-purple-500',
                                                    'text-sm sm:text-base'
                                                )}
                                                rows={1}
                                            />
                                        </div>

                                        <div className="w-full flex-1 space-y-4">
                                            <Label className="block text-sm font-medium mb-2">
                                                Description
                                            </Label>
                                            <Textarea
                                                value={basicInfo.description}
                                                onChange={({ target }) =>
                                                    setBasicInfo((prev) => ({
                                                        ...prev,
                                                        description:
                                                            target.value,
                                                    }))
                                                }
                                                placeholder="Type your message..."
                                                className={cn(
                                                    'min-h-[52px] max-h-[120px] resize-none transition-all duration-200',
                                                    'focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:border-purple-500',
                                                    'text-sm sm:text-base'
                                                )}
                                                rows={1}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="border-b w-full pb-6 pt-2">
                                    <h3 className="font-medium mb-4">
                                        Agent Identity
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="block text-sm font-medium mb-2">
                                                Icon
                                            </Label>
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
                                                                    ? 'border-primary bg-primary/20'
                                                                    : 'border-border hover:border-primary/50'
                                                            }`}
                                                            style={
                                                                selectedIcon ===
                                                                id
                                                                    ? {
                                                                          borderColor:
                                                                              selectedColor,
                                                                          background: `${selectedColor}33`,
                                                                      }
                                                                    : undefined
                                                            }
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
                                                            handleThemeManagement(
                                                                color
                                                            )
                                                        }
                                                        className={`w-8 h-8 rounded border-2 transition-all ${
                                                            selectedColor ===
                                                            color
                                                                ? 'border-foreground scale-110'
                                                                : 'border-border hover:border-foreground/50'
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

                                <div className="border-b w-full  pb-6 pt-2">
                                    <h3 className="font-medium mb-4">
                                        Personality Traits
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {personalityTraits.map((trait) => (
                                            <span
                                                key={trait}
                                                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-1"
                                                style={{
                                                    background: `${selectedColor}88`,
                                                }}
                                            >
                                                {trait}
                                                <button
                                                    onClick={() =>
                                                        removeTrait(trait)
                                                    }
                                                    className="hover:text-destructive"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Suggested traits:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedTraits.map((trait) => (
                                                <button
                                                    key={trait}
                                                    onClick={() =>
                                                        addTrait(trait)
                                                    }
                                                    style={{
                                                        background: `${selectedColor}22`,
                                                    }}
                                                    className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full text-sm transition-colors"
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
                                        selectedColor={selectedColor}
                                        label="🎭 Formal"
                                        value={personalitySliders.formal}
                                        onChange={(value) =>
                                            updateSlider('formal', value)
                                        }
                                        percentage={personalitySliders.formal}
                                    />
                                    <SliderComponent
                                        selectedColor={selectedColor}
                                        label="😊 Friendly"
                                        value={personalitySliders.friendly}
                                        onChange={(value) =>
                                            updateSlider('friendly', value)
                                        }
                                        percentage={personalitySliders.friendly}
                                    />
                                    <SliderComponent
                                        selectedColor={selectedColor}
                                        label="💼 Professional"
                                        value={personalitySliders.professional}
                                        onChange={(value) =>
                                            updateSlider('professional', value)
                                        }
                                        percentage={
                                            personalitySliders.professional
                                        }
                                    />
                                    <SliderComponent
                                        selectedColor={selectedColor}
                                        label="💬 Conversational"
                                        value={
                                            personalitySliders.conversational
                                        }
                                        onChange={(value) =>
                                            updateSlider(
                                                'conversational',
                                                value
                                            )
                                        }
                                        percentage={
                                            personalitySliders.conversational
                                        }
                                    />
                                    <SliderComponent
                                        selectedColor={selectedColor}
                                        label="😄 Humorous"
                                        value={personalitySliders.humorous}
                                        onChange={(value) =>
                                            updateSlider('humorous', value)
                                        }
                                        percentage={personalitySliders.humorous}
                                    />
                                    <SliderComponent
                                        selectedColor={selectedColor}
                                        label="🗣️ Verbosity"
                                        value={personalitySliders.verbose}
                                        onChange={(value) =>
                                            updateSlider('verbose', value)
                                        }
                                        percentage={personalitySliders.verbose}
                                    />
                                </div>

                                <div className="w-full">
                                    <Select
                                        onValueChange={(value) =>
                                            setCommunicationTone(
                                                value as CommunicationTone
                                            )
                                        }
                                        width="w-full"
                                        defaultLabel="Communication Tone"
                                        required
                                        aria-label="Select Connection Tone"
                                        selectItems={selectCommunicationTone}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab !== 'personality' && (
                            <div className="text-center py-12 text-muted-foreground">
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
                    <div className="bg-card border border-border rounded-lg p-4">
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
                                    className="w-full p-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    rows={3}
                                />
                            </div>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 "
                                variant="success"
                            >
                                Test Response
                            </Button>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-4">
                        <h3 className="font-medium mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent rounded transition-colors">
                                <Download size={16} />
                                <span>Export Configuration</span>
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent rounded transition-colors">
                                <Upload size={16} />
                                <span>Import Configuration</span>
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent rounded transition-colors">
                                <RotateCcw size={16} />
                                <span>Reset to Defaults</span>
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent rounded transition-colors">
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
