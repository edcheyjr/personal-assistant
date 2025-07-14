// types.ts
export interface ValidationError {
    detail: Array<{
        loc: (string | number)[]
        msg: string
        type: string
    }>
}

export interface PersonalityTraits {
    [key: string]: number
}

export interface AgentProperties {
    [key: string]: any
}

export interface AgentConfig {
    [key: string]: any
}

export interface VoiceSettings {
    [key: string]: any
}

export interface Agent {
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

export interface CreateAgentRequest {
    name: string
    agent_type: string
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
    personality_traits?: PersonalityTraits
    agent_properties?: AgentProperties
    config?: AgentConfig
    voice_settings?: VoiceSettings
}

export interface LoginRequest {
    username: string
    password: string
}

export interface AuthResponse {
    access_token: string
    token_type: string
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
