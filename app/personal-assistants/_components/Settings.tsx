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
    LucideIcon,
} from 'lucide-react'

// Type definitions
interface PersonalitySliders {
    formality: number
    empathy: number
    humor: number
    verbosity: number
}

interface IconOption {
    id: string
    icon: LucideIcon
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
    icon: LucideIcon
    active: boolean
    onClick: () => void
}

type TabType = 'personality' | 'knowledge' | 'tools' | 'advanced'
type CommunicationTone =
    | 'Professional'
    | 'Casual'
    | 'Friendly'
    | 'Formal'
    | 'Conversational'

const VoiceAIPlatform: React.FC = () => {
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
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                active
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
        >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
        </button>
    )

    return (
        <div className="min-h-screen size-full bg-gray-900 text-white p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">
                            Voice AI Platform
                        </h1>
                        <p className="text-gray-400">
                            Multi-Agent Voice System
                        </p>
                    </div>
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <Save size={16} />
                    Save Configuration
                </button>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Sidebar */}
                <div className="col-span-3 space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="font-medium mb-3">Customer Interface</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <MessageSquare size={16} />
                                <span>Agent Overview</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm bg-purple-600 text-white px-3 py-2 rounded">
                                <Settings size={16} />
                                <span>Agent Configuration</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="font-medium mb-3">
                            Performance Metrics
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                    Total Calls
                                </span>
                                <span className="font-medium">1247</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                    Satisfaction
                                </span>
                                <span className="font-medium">98%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                    Avg Response
                                </span>
                                <span className="font-medium">0.3s</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="font-medium mb-3">System Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                    Total Agents
                                </span>
                                <span className="font-medium">6</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                    Active Agents
                                </span>
                                <span className="font-medium">6</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                    Agent Groups
                                </span>
                                <span className="font-medium">2</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-400">
                                    Operational
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-span-6">
                    <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    Router Agent
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    Customize personality, knowledge, and
                                    capabilities
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
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

                        {/* Personality Tab Content */}
                        {activeTab === 'personality' && (
                            <div className="space-y-6">
                                {/* Agent Identity */}
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

                                {/* Personality Traits */}
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

                                {/* Personality Sliders */}
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

                                {/* Communication Tone */}
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

                        {/* Other tabs placeholder */}
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

                {/* Right Panel */}
                <div className="col-span-3 space-y-4">
                    {/* Test Agent */}
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

                    {/* Quick Actions */}
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

export default VoiceAIPlatform
