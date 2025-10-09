export interface Tier {
    tier_id: string
    name: string
    prompt: string
    description: string
    created_at: string
    updated_at: string
}

export interface LanguageModel {
    llm_id: string
    provider: string
    model_name: string
}

export interface PersonalitySliders {
    creativity: number
    formality: number
    verbosity: number
    enthusiasm: number
    empathy: number
}

export interface AgentPersonality {
    traits: string[]
    sliders: PersonalitySliders
}

export interface PromptConfigurations {
    user_prompt: string
    system_prompt?: string
}

export interface AgentCapabilities {
    tools: string[]
    knowledge_bases: string[]
}

export interface LLMConfiguration {
    language_model_id: string
    temperature: number
    max_tokens: number
}

export interface CreateAgentGroupAgent {
    tier_id: string
    llm_configuration_index: number
    name: string
    role: string
    personality: AgentPersonality
    prompt_configurations: PromptConfigurations
    capabilities: AgentCapabilities
}

export interface AgentConfiguration {
    agents_index: number
    sub_agents: number[] // Just an array of agent indices (numbers)
}

export interface OrchestrationConfigurations {
    agents_configurations: AgentConfiguration[]
}

export interface AdvancedCoordinationSettings {
    [key: string]: any
}

export interface AgentGroupData {
    name: string
    description: string
    architecture: string
    prompt_configurations: {
        system_prompt: string
    }
    advanced_coordination_settings: AdvancedCoordinationSettings
}

export interface CreateAgentGroupRequest {
    agent_group: AgentGroupData
    llm_configurations: LLMConfiguration[]
    agents: CreateAgentGroupAgent[]
    orchestration_configurations: OrchestrationConfigurations
}

export interface CreateAgentGroupResponse {
    group_id: string
    orchestration_config_id: string
    llm_config_ids: string[]
    agent_ids: string[]
}

export interface AgentGroupSummary {
    group_id: string
    name: string
    description: string
    architecture: string
    advanced_coordination_settings: AdvancedCoordinationSettings
    system_prompt: string
    num_agents: number
}

export interface AgentGroupListResponse {
    items: AgentGroupSummary[]
    total: number
    skip: number
    limit: number
}

export interface AgentGroupAgent {
    tier: Tier
    llm_configuration_index: number
    name: string
    role: string
    personality: AgentPersonality
    prompt_configurations: PromptConfigurations
    capabilities: AgentCapabilities
}

export interface LLMConfigurationResponse {
    language_model: LanguageModel
    temperature: number
    max_tokens: number
}

export interface AgentGroupDetails {
    agent_group: AgentGroupData
    llm_configurations: LLMConfigurationResponse[]
    agents: AgentGroupAgent[]
    orchestration_configurations: OrchestrationConfigurations
}

export interface ApiResponse<T> {
    data?: T
    error?: string
    status: number
}

export interface ValidationError {
    detail: Array<{
        loc: (string | number)[]
        msg: string
        type: string
    }>
}