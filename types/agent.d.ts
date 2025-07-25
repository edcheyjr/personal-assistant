//unions

export type CommunicationTone =
    | 'Professional'
    | 'Casual'
    | 'Friendly'
    | 'Formal'
    | 'Conversational'
    | 'Friendly and professional'
    | 'Professional and helpful'
    | 'Inspiring and encouraging'
    | 'Professional and precise'

export type AgentType =
    | 'personal_assistant'
    | 'support_assistant'
    | 'creative_assistant'
    | 'sales_assistant'
    | 'technical_assistant'
    | 'marketing_assistant'

//interfaces
export interface ValidationError {
    detail: Array<{
        loc: (string | number)[]
        msg: string
        type: string
    }>
}

export interface PersonalityTraits {
    formal: number
    friendly: number
    professional: number
    conversational: number
    humorous: number
    serious: number
    direct: number
    verbose: number
    [key: string]: number // Allow for additional traits
}

export interface AgentProperties {
    name: string
    tone: CommunicationTone
    objective: string
    socratic_approach: string | boolean
    conversation_style: string
    response_to_greetings: string
    focus: string
    interactivity: string
    response_format: string
    personality_traits: string[]
    [key: string]: any // Allow for additional properties
}

export interface AgentConfig {
    max_history: number
    temperature: number
    model: string
    [key: string]: any // Allow for additional config options
}

type VoiceSettings = {
    voice_id: string
    voice_settings: {
        enabled: boolean
        speaking_rate: number
        pitch: number
        volume: number
    }
}
export interface Agent {
    id: string
    name: string
    agent_type: AgentType
    description: string
    personality_traits: PersonalityTraits
    agent_properties: AgentProperties
    config: AgentConfig
    voice_settings: VoiceSettings
    user_id: string
}

export interface CreateAgentRequest {
    name: string
    agent_type: AgentType
    description: string
    personality_traits: PersonalityTraits
    agent_properties: AgentProperties
    config: AgentConfig
    voice_settings: VoiceSettings
    user_id: string
}

export interface UpdateAgentRequest {
    name?: string
    description?: string
    personality_traits?: Partial<PersonalityTraits>
    agent_properties?: Partial<AgentProperties>
    config?: Partial<AgentConfig>
    voice_settings?: Partial<VoiceSettings>
}

export interface StreamParams {
    user_input: string
    thread_id: string
    agent_id: string
}

export interface ApiResponse<T> {
    data?: T
    error?: string
    status: number
}

export interface ThreadId {
    thread_id: string
}
export interface AgentSummary {
    id: string
    name: string
    agent_type: AgentType
    description: string
    user_id: string
}

export interface ConversationMessage {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export interface Thread {
    id: string
    agent_id: string
    messages: ConversationMessage[]
    created_at: Date
    updated_at: Date
}
