'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Bot } from 'lucide-react'
import { AgentEvent, Message } from '@/types/message'
import { default as MessageComponent } from '@/components/chat/Message'
import MessageInput from '@/components/chat/MessageInput'
import { useParams } from 'next/navigation'
import { streamAgentResponseAction } from '@/server-actions/agents'
import { toast } from 'sonner'
import MessageLoading from '@/components/chat/MessageLoading'
import { ThinkingProcess } from '@/components/chat/ThinkingSteps'

interface QuickGroup {
    name: string
    active: boolean
}

interface StreamingMessage extends Message {
    isStreaming?: boolean
    agentName?: string
    thinkingSteps?: AgentEvent[]
    toolCalls?: Map<string, any>
    finalResponse?: string
}

const VoiceAICustomerInterface: React.FC = () => {
    const { id } = useParams() // current assistant id
    const [message, setMessage] = useState<string>('')
    const [isError, setIsError] = useState<boolean>(false)
    const [isListening, setIsListening] = useState<boolean>(false)
    const [isRecording, setIsRecording] = useState<boolean>(false)
    const [messages, setMessages] = useState<StreamingMessage[]>([])
    const [selectedGroup, setSelectedGroup] = useState<string>('Support Team')
    const [isStreaming, setIsStreaming] = useState<boolean>(false)
    const [threadId] = useState<string>(() => crypto.randomUUID())

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleStreamResponse = async (userMessage: string) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()
        setIsStreaming(true)

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
                        typeof stream == 'string' ? stream : error ? error : '',
                    sender: 'system',
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    isStreaming: false,
                }
                setMessages((prev) => [...prev, errorMessage])
                setIsError(true)
                setIsStreaming(false)
                toast.error(error)
                return
            }

            if (!stream) {
                return
            }

            const reader = stream.getReader()
            const decoder = new TextDecoder()

            let currentAgentMessage: StreamingMessage | null = null
            let agentName = ''
            let streamingContent = ''
            let streamingMessageId: number | null = null
            let thinkingSteps: AgentEvent[] = []
            let toolCalls = new Map<string, any>()
            let finalResponse = ''

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
                            thinkingSteps.push(eventData)

                            if (
                                eventData.event === 'on_chain_start' &&
                                eventData.name === 'LangGraph'
                            ) {
                                agentName =
                                    eventData.data?.input?.agent_properties
                                        ?.name || 'AI Assistant'
                            }

                            if (eventData.event === 'on_chat_model_start') {
                                streamingContent = ''
                                streamingMessageId = Date.now()

                                const streamingMessage: StreamingMessage = {
                                    id: streamingMessageId,
                                    text: '',
                                    sender: 'assistant',
                                    timestamp: new Date().toLocaleTimeString(
                                        [],
                                        {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }
                                    ),
                                    isStreaming: true,
                                    agentName: agentName || 'AI Assistant',
                                    thinkingSteps: [...thinkingSteps],
                                }

                                setMessages((prev) => {
                                    const withoutStreaming = prev.filter(
                                        (msg) => !msg.isStreaming
                                    )
                                    return [
                                        ...withoutStreaming,
                                        streamingMessage,
                                    ]
                                })
                            }

                            if (eventData.event === 'on_chat_model_stream') {
                                if (
                                    eventData.data?.chunk &&
                                    streamingMessageId
                                ) {
                                    streamingContent += eventData.data.chunk

                                    setMessages((prev) => {
                                        return prev.map((msg) => {
                                            if (msg.id === streamingMessageId) {
                                                return {
                                                    ...msg,
                                                    text: streamingContent,
                                                    thinkingSteps: [
                                                        ...thinkingSteps,
                                                    ],
                                                }
                                            }
                                            return msg
                                        })
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

                                    if (
                                        latestAiMessage &&
                                        latestAiMessage.content
                                    ) {
                                        finalResponse = latestAiMessage.content

                                        const agentMessage: StreamingMessage = {
                                            id:
                                                streamingMessageId ||
                                                Date.now(),
                                            text: finalResponse,
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
                                            thinkingSteps: [...thinkingSteps],
                                            finalResponse: finalResponse,
                                        }

                                        setMessages((prev) => {
                                            const withoutStreaming =
                                                prev.filter(
                                                    (msg) => !msg.isStreaming
                                                )
                                            return [
                                                ...withoutStreaming,
                                                agentMessage,
                                            ]
                                        })

                                        currentAgentMessage = agentMessage
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
                        setIsStreaming(false)
                        return
                    }
                }
                setIsStreaming(false)
            }

            if (buffer.trim()) {
                if (buffer.startsWith('data: ')) {
                    const jsonString = buffer.slice(6).trim()
                    if (jsonString) {
                        try {
                            const eventData: AgentEvent = JSON.parse(jsonString)
                            thinkingSteps.push(eventData)
                        } catch (parseError) {
                            console.warn(
                                'Failed to parse final buffer JSON:',
                                jsonString
                            )
                        }
                    }
                }
            }
        } catch (error) {
            setIsError(true)
            console.error('Stream error:', error)
            setIsStreaming(false)

            const errorMessage: StreamingMessage = {
                id: Date.now(),
                text: "I'm sorry, I encountered an error. Please try again.",
                sender: 'system',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                isStreaming: false,
            }
            setMessages((prev) => [...prev, errorMessage])
        }
        setIsError(false)
    }

    const handleSendMessage = async (): Promise<void> => {
        if (message.trim() && !isStreaming) {
            const newMessage: StreamingMessage = {
                id: Date.now(),
                text: message,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }

            setMessages((prev) => [...prev, newMessage])
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
                {messages.length === 0 ? (
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
                        {messages.map((msg, index) => (
                            <div key={msg.id + index} className="mb-4">
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
                                {msg.thinkingSteps &&
                                    msg.sender === 'assistant' && (
                                        <ThinkingProcess
                                            steps={msg.thinkingSteps}
                                        />
                                    )}
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
                        disabled={isStreaming}
                    />

                    {isStreaming && (
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
