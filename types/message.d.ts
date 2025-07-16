export interface Message {
    id: number
    text: string
    sender: 'user' | 'ai'
    timestamp: string
}

export interface MessageProps {
    message: Message
}
interface AgentEvent {
    event:
        | 'on_chain_start'
        | 'on_chain_stream'
        | 'on_chain_end'
        | 'on_chat_model_stream'
        | 'on_chat_model_start'
    name: string
    run_id: string
    tags: string[]
    metadata: Record<string, unknown>
    data: {
        input?: AgentInput
        output?: AgentOutput
        chunk?: string
    }
}

interface AgentInput {
    agent_name: string | null
    user_name: string | null
    summary: string | null
    agent_properties: AgentProperties | null
    messages: APIMessage[]
}

interface AgentOutput {
    messages: APIMessage[]
    agent_name: string
    summary: string
    user_name: string
    agent_properties: AgentProperties
}

interface AgentProperties {
    name: string
    role: string
    objective: string
    tone: string
    socratic_approach: 'Yes' | 'No' | string
    conversation_style: string
    response_to_greetings: string
    focus: string
    interactivity: string
    response_format: 'Markdown' | 'PlainText' | string
}

interface APIMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
    type?: 'HumanMessage' | 'AIMessage' | 'SystemMessage' | 'unknown'
    additional_kwargs?: Record<string, unknown>
    response_metadata?: Record<string, unknown>
    id?: string
}
