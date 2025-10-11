export interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant" | "system";
  timestamp: string;
}

export interface ToolCall {
  tool: string;
  args: any;
  timestamp?: string;
}

export interface ToolResult {
  tool: string;
  output: any;
  timestamp?: string;
}

export interface AgentTransfer {
  from: string;
  to: string;
  timestamp?: string;
}

export interface StreamingMessage extends Message {
  isStreaming?: boolean;
  agentName?: string;
  currentAgent?: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  agentTransfers?: AgentTransfer[];
  toolEvents?: AgentEvent[];
  finalResponse?: string;
  isStep?: boolean;
  stepContent?: string;
  memoryOperations?: MemoryOperation[];
}

export interface MessageProps {
  message: StreamingMessage;
  isError: boolean;
}
interface AgentEvent {
  event:
    | "on_chain_start"
    | "on_chain_stream"
    | "on_chain_end"
    | "on_chat_model_stream"
    | "on_chat_model_start"
    | "on_tool_start"
    | "on_tool_end";
  name: string;
  run_id: string;
  tags: string[];
  metadata: Record<string, unknown>;
  data: {
    input?: AgentInput;
    output?: AgentOutput;
    chunk?: string;
  };
}

interface AgentInput {
  agent_name: string | null;
  user_name: string | null;
  summary: string | null;
  agent_properties: AgentProperties | null;
  messages: APIMessage[];
}

interface AgentOutput {
  messages: APIMessage[];
  agent_name: string;
  summary: string;
  user_name: string;
  agent_properties: AgentProperties;
}

interface AgentProperties {
  name: string;
  role: string;
  objective: string;
  tone: string;
  socratic_approach: "Yes" | "No" | string;
  conversation_style: string;
  response_to_greetings: string;
  focus: string;
  interactivity: string;
  response_format: "Markdown" | "PlainText" | string;
}

interface APIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  type?: "HumanMessage" | "AIMessage" | "SystemMessage" | "unknown";
  additional_kwargs?: Record<string, unknown>;
  response_metadata?: Record<string, unknown>;
  id?: string;
}
