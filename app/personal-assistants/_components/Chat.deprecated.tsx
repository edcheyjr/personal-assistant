'use client'

import React, { useEffect, useRef, useState, useReducer } from 'react'
import { Bot } from 'lucide-react'
import { AgentEvent, Message } from '@/types/message'
import { default as MessageComponent } from '@/components/chat/Message'
import MessageInput from '@/components/chat/MessageInput'
import { useParams } from 'next/navigation'
import { streamAgentResponseAction } from '@/server-actions/agents'
import { toast } from 'sonner'
import MessageLoading from '@/components/chat/MessageLoading'
import { ToolCalls } from '@/components/chat/ToolCalls'
import { produce } from 'immer'

interface QuickGroup {
    name: string
    active: boolean
}

interface StreamingMessage extends Message {
    isStreaming?: boolean
    agentName?: string
    toolEvents?: AgentEvent[]
    toolCalls?: Map<string, any>
    finalResponse?: string
    isStep?: boolean
    stepContent?: string
}

interface MessagesState {
    messages: StreamingMessage[]
    isStreaming: boolean
    currentStreamingId: number | null
    currentSteps: StreamingMessage[]
    agentName: string
    toolEvents: AgentEvent[]
    streamingContent: string
}

type MessagesAction =
    | { type: 'ADD_USER_MESSAGE'; message: StreamingMessage }
    | { type: 'START_STREAMING'; agentName: string }
    | { type: 'ADD_STEP'; step: StreamingMessage }
    | { type: 'START_FINAL_RESPONSE'; messageId: number; agentName: string }
    | {
          type: 'UPDATE_STREAMING_CONTENT'
          messageId: number
          content: string
          toolEvents: AgentEvent[]
      }
    | { type: 'FINISH_RESPONSE'; finalMessage: StreamingMessage }
    | { type: 'ADD_ERROR'; error: StreamingMessage }
    | { type: 'STOP_STREAMING' }
    | { type: 'ADD_TOOL_EVENT'; event: AgentEvent }
    | { type: 'RESET_STREAMING_CONTENT' }

const messagesReducer = produce(
    (draft: MessagesState, action: MessagesAction) => {
        switch (action.type) {
            case 'ADD_USER_MESSAGE':
                draft.messages.push(action.message)
                break

            case 'START_STREAMING':
                draft.isStreaming = true
                draft.currentSteps = []
                draft.agentName = action.agentName
                draft.toolEvents = []
                draft.streamingContent = ''
                break

            case 'ADD_STEP':
                draft.currentSteps.push(action.step)
                break

            case 'START_FINAL_RESPONSE':
                draft.currentStreamingId = action.messageId
                draft.streamingContent = ''
                const streamingMessage: StreamingMessage = {
                    id: action.messageId,
                    text: '',
                    sender: 'assistant',
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    isStreaming: true,
                    agentName: action.agentName,
                    toolEvents: [...draft.toolEvents],
                    isStep: false,
                }
                // Add steps first, then the streaming message
                draft.messages.push(...draft.currentSteps)
                draft.messages.push(streamingMessage)
                break

            case 'UPDATE_STREAMING_CONTENT':
                draft.streamingContent = action.content
                const messageIndex = draft.messages.findIndex(
                    (msg) => msg.id === action.messageId
                )
                if (messageIndex !== -1) {
                    draft.messages[messageIndex].text = action.content
                    draft.messages[messageIndex].toolEvents = action.toolEvents
                }
                break

            case 'FINISH_RESPONSE':
                const streamingIndex = draft.messages.findIndex(
                    (msg) => msg.id === draft.currentStreamingId
                )
                if (streamingIndex !== -1) {
                    const finalContent =
                        action.finalMessage.text || draft.streamingContent
                    draft.messages[streamingIndex] = {
                        ...action.finalMessage,
                        text: finalContent,
                        isStreaming: false,
                    }
                }
                draft.isStreaming = false
                draft.currentStreamingId = null
                draft.currentSteps = []
                draft.streamingContent = ''
                break

            case 'ADD_ERROR':
                draft.messages.push(action.error)
                draft.isStreaming = false
                draft.currentStreamingId = null
                draft.currentSteps = []
                draft.streamingContent = ''
                break

            case 'STOP_STREAMING':
                // If we have streaming content but no final response, create one
                if (draft.currentStreamingId && draft.streamingContent) {
                    const streamingIndex = draft.messages.findIndex(
                        (msg) => msg.id === draft.currentStreamingId
                    )
                    if (streamingIndex !== -1) {
                        draft.messages[streamingIndex].text =
                            draft.streamingContent
                        draft.messages[streamingIndex].isStreaming = false
                    }
                }
                draft.isStreaming = false
                draft.currentStreamingId = null
                draft.messages = draft.messages.filter(
                    (msg) => !msg.isStreaming || (msg.isStreaming && msg.text)
                )
                draft.streamingContent = ''
                break

            case 'ADD_TOOL_EVENT':
                draft.toolEvents.push(action.event)
                break

            case 'RESET_STREAMING_CONTENT':
                draft.streamingContent = ''
                break
        }
    }
)

const VoiceAICustomerInterface: React.FC = () => {
    const { id } = useParams()
    const [message, setMessage] = useState<string>('')
    const [isError, setIsError] = useState<boolean>(false)
    const [isListening, setIsListening] = useState<boolean>(false)
    const [isRecording, setIsRecording] = useState<boolean>(false)
    const [selectedGroup, setSelectedGroup] = useState<string>('Support Team')
    const [threadId] = useState<string>(() => crypto.randomUUID())

    const [messagesState, dispatch] = useReducer(messagesReducer, {
        messages: [],
        isStreaming: false,
        currentStreamingId: null,
        currentSteps: [],
        agentName: '',
        toolEvents: [],
        streamingContent: '',
    })

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messagesState.messages])

    const handleStreamResponse = async (userMessage: string) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()

        try {
            const {
                data: stream,
                error,
                status,
            } = await streamAgentResponseAction({
                user_input: userMessage,
                agent_id: '7701aaeb-b495-44cd-81f4-0307bbbeefcc',
            })

            if (typeof stream == 'string' || error || status !== 200) {
                const errorMessage: StreamingMessage = {
                    id: Date.now(),
                    text:
                        typeof stream == 'string'
                            ? stream
                            : error
                            ? error
                            : 'Unknown error occurred',
                    sender: 'system',
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    isStreaming: false,
                }
                dispatch({ type: 'ADD_ERROR', error: errorMessage })
                setIsError(true)
                toast.error(error || 'An error occurred')
                return
            }

            if (!stream) {
                const noStreamError: StreamingMessage = {
                    id: Date.now(),
                    text: 'No response received from the server',
                    sender: 'system',
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    isStreaming: false,
                }
                dispatch({ type: 'ADD_ERROR', error: noStreamError })
                return
            }

            const reader = stream.getReader()
            const decoder = new TextDecoder()

            let agentName = ''
            let streamingContent = ''
            let streamingMessageId: number | null = null
            let hasStartedFinalResponse = false
            let hasReceivedContent = false

            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                buffer += chunk

                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (line.startsWith('event: agent_event')) {
                        continue
                    }

                    if (line.startsWith('data: ')) {
                        const jsonString = line.slice(6).trim()

                        if (!jsonString) {
                            continue
                        }

                        try {
                            const eventData: AgentEvent = JSON.parse(jsonString)
                            dispatch({
                                type: 'ADD_TOOL_EVENT',
                                event: eventData,
                            })

                            if (
                                eventData.event === 'on_chain_start' &&
                                eventData.name === 'LangGraph'
                            ) {
                                agentName =
                                    eventData.data?.input?.agent_properties
                                        ?.name || 'AI Assistant'
                                dispatch({ type: 'START_STREAMING', agentName })
                            }

                            // Handle tool calls as steps
                            if (eventData.event === 'on_tool_start') {
                                const stepMessage: StreamingMessage = {
                                    id: Date.now() + Math.random(),
                                    text: `Using tool: ${eventData.name}`,
                                    sender: 'assistant',
                                    timestamp: new Date().toLocaleTimeString(
                                        [],
                                        {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }
                                    ),
                                    isStreaming: false,
                                    agentName: agentName || 'AI Assistant',
                                    isStep: true,
                                    stepContent: `Thinking... ${eventData.name}`,
                                }
                                dispatch({
                                    type: 'ADD_STEP',
                                    step: stepMessage,
                                })
                            }

                            if (eventData.event === 'on_chat_model_start') {
                                streamingContent = ''
                                streamingMessageId = Date.now()
                                hasStartedFinalResponse = true
                                dispatch({
                                    type: 'START_FINAL_RESPONSE',
                                    messageId: streamingMessageId,
                                    agentName: agentName || 'AI Assistant',
                                })
                            }

                            if (eventData.event === 'on_chat_model_stream') {
                                if (
                                    eventData.data?.chunk &&
                                    streamingMessageId &&
                                    hasStartedFinalResponse
                                ) {
                                    streamingContent += eventData.data.chunk
                                    hasReceivedContent = true
                                    dispatch({
                                        type: 'UPDATE_STREAMING_CONTENT',
                                        messageId: streamingMessageId,
                                        content: streamingContent,
                                        toolEvents: messagesState.toolEvents,
                                    })
                                }
                            }

                            if (
                                eventData.event === 'on_chain_end' &&
                                eventData.name === 'LangGraph'
                            ) {
                                const output = eventData.data?.output
                                if (output?.messages) {
                                    const aiMessages = output.messages.filter(
                                        (msg) =>
                                            msg.type === 'AIMessage' ||
                                            msg.role === 'assistant'
                                    )
                                    const latestAiMessage =
                                        aiMessages[aiMessages.length - 1]

                                    const finalContent =
                                        latestAiMessage?.content ||
                                        streamingContent

                                    if (finalContent) {
                                        const finalMessage: StreamingMessage = {
                                            id:
                                                streamingMessageId ||
                                                Date.now(),
                                            text: finalContent,
                                            sender: 'assistant',
                                            timestamp:
                                                new Date().toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                ),
                                            isStreaming: false,
                                            agentName:
                                                output.agent_name ||
                                                agentName ||
                                                'AI Assistant',
                                            toolEvents: [
                                                ...messagesState.toolEvents,
                                            ],
                                            finalResponse: finalContent,
                                            isStep: false,
                                        }

                                        dispatch({
                                            type: 'FINISH_RESPONSE',
                                            finalMessage,
                                        })
                                    } else {
                                        const errorMessage: StreamingMessage = {
                                            id: Date.now(),
                                            text: 'No response content received',
                                            sender: 'system',
                                            timestamp:
                                                new Date().toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                ),
                                            isStreaming: false,
                                        }
                                        dispatch({
                                            type: 'ADD_ERROR',
                                            error: errorMessage,
                                        })
                                    }
                                }
                            }
                        } catch (parseError) {
                            console.warn(
                                'Failed to parse JSON line:',
                                jsonString
                            )
                            console.warn('Parse error:', parseError)
                            continue
                        }
                    }

                    if (line.startsWith('event: completed')) {
                        dispatch({ type: 'STOP_STREAMING' })
                        return
                    }
                }
            }

            // Handle any remaining buffer
            if (buffer.trim()) {
                if (buffer.startsWith('data: ')) {
                    const jsonString = buffer.slice(6).trim()
                    if (jsonString) {
                        try {
                            const eventData: AgentEvent = JSON.parse(jsonString)
                            dispatch({
                                type: 'ADD_TOOL_EVENT',
                                event: eventData,
                            })
                        } catch (parseError) {
                            console.warn(
                                'Failed to parse final buffer JSON:',
                                jsonString
                            )
                        }
                    }
                }
            }

            // Final check - if we have streaming content but no final response
            if (
                hasReceivedContent &&
                streamingContent &&
                !hasStartedFinalResponse
            ) {
                const finalMessage: StreamingMessage = {
                    id: streamingMessageId || Date.now(),
                    text: streamingContent,
                    sender: 'assistant',
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    isStreaming: false,
                    agentName: agentName || 'AI Assistant',
                    toolEvents: [...messagesState.toolEvents],
                    finalResponse: streamingContent,
                    isStep: false,
                }
                dispatch({ type: 'FINISH_RESPONSE', finalMessage })
            } else {
                dispatch({ type: 'STOP_STREAMING' })
            }
        } catch (error) {
            setIsError(true)
            console.error('Stream error:', error)

            const errorMessage: StreamingMessage = {
                id: Date.now(),
                text:
                    error instanceof Error
                        ? error.message
                        : "I'm sorry, I encountered an error. Please try again.",
                sender: 'system',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                isStreaming: false,
            }
            dispatch({ type: 'ADD_ERROR', error: errorMessage })
        } finally {
            setIsError(false)
            dispatch({ type: 'STOP_STREAMING' })
        }
    }

    const handleSendMessage = async (): Promise<void> => {
        if (message.trim() && !messagesState.isStreaming) {
            const newMessage: StreamingMessage = {
                id: Date.now(),
                text: message,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }

            dispatch({ type: 'ADD_USER_MESSAGE', message: newMessage })
            const userMessage = message
            setMessage('')

            await handleStreamResponse(userMessage)
        }
    }

    const handleKeyPress = (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const toggleListening = (): void => {
        setIsListening(!isListening)
        setIsRecording(!isRecording)
    }

    const quickGroups: QuickGroup[] = [
        { name: 'Support Team', active: true },
        { name: 'Creative Collective', active: false },
    ]

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    return (
        <div className="flex flex-1 flex-col overflow-hidden max-h-[92vh] min[2048px]:max-h-[95vh]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 h-full">
                {messagesState.messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-purple-600 text-white text-shadow-2xs text-shadow-purple-950">
                            <Bot className="size-8" />
                        </div>
                        <h3 className="mb-2 text-xl font-medium">
                            Start a conversation
                        </h3>
                        <p className="mb-6 text-gray-400">
                            Type a message or click the microphone
                        </p>
                    </div>
                ) : (
                    <div className="mx-auto max-w-4xl">
                        {/* Simple message display - no grouping */}
                        {messagesState.messages.map((msg) => (
                            <div key={msg.id} className="mb-4">
                                <MessageComponent
                                    message={msg}
                                    isError={isError}
                                />
                                {msg.isStreaming && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                        <MessageLoading size="size-2" />
                                        <span>Assistant is typing...</span>
                                    </div>
                                )}
                                {msg.agentName &&
                                    msg.sender === 'assistant' &&
                                    !msg.isStreaming && (
                                        <div className="mt-1 text-xs text-gray-500">
                                            — {msg.agentName}
                                        </div>
                                    )}

                                {/* TODO: this will be done later this will be shown only to admins */}

                                {/* {process.env.NODE_ENV === 'development' &&
                                    msg.toolEvents &&
                                    msg.sender === 'assistant' && (
                                        <ToolCalls steps={msg.toolEvents} />
                                    )} */}
                            </div>
                        ))}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t p-5 bg-card">
                <div className="mx-auto max-w-4xl">
                    {/* Quick Groups */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        <span className="whitespace-nowrap py-2 text-sm text-gray-400">
                            Quick Groups:
                        </span>
                        {quickGroups.map((group, index) => (
                            <button
                                key={group.name + index}
                                onClick={() => setSelectedGroup(group.name)}
                                className={`whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors ${
                                    selectedGroup === group.name
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {group.name}
                            </button>
                        ))}
                    </div>

                    {/* Message Input */}
                    <MessageInput
                        message={message}
                        isRecording={isRecording}
                        setMessage={setMessage}
                        handleKeyPress={handleKeyPress}
                        handleSendMessage={handleSendMessage}
                        toggleListening={toggleListening}
                        disabled={messagesState.isStreaming}
                    />

                    {messagesState.isStreaming && (
                        <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                            <MessageLoading />
                            <span>Processing your message...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VoiceAICustomerInterface
