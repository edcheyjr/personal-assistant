'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Bot } from 'lucide-react'
import { AgentEvent, Message } from '@/types/message'
import { default as MessageComponent } from '@/components/chat/Message'
import MessageInput from '@/components/chat/MessageInput'
import { useParams } from 'next/navigation'
import { streamAgentResponseAction } from '@/server-actions/agents'

interface QuickGroup {
    name: string
    active: boolean
}

interface StreamingMessage extends Message {
    isStreaming?: boolean
    agentName?: string
}

const VoiceAICustomerInterface: React.FC = () => {
    const { id } = useParams() // current assistant id
    const [message, setMessage] = useState<string>('')
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
        // Cancel any existing stream
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()
        setIsStreaming(true)

        try {
            const { data: stream } = await streamAgentResponseAction({
                user_input: userMessage,
                // thread_id: threadId,
                agent_id: '7701aaeb-b495-44cd-81f4-0307bbbeefcc',
            })
            if (!stream) {
                return
            }
            const reader = stream.getReader()
            const decoder = new TextDecoder()

            let currentAgentMessage: StreamingMessage | null = null
            let agentName = ''
            let streamingContent = ''
            let streamingMessageId: number | null = null

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('event: agent_event')) {
                        continue
                    }

                    if (line.startsWith('data: ')) {
                        try {
                            const eventData: AgentEvent = JSON.parse(
                                line.slice(6)
                            )

                            // Handle different event types
                            if (
                                eventData.event === 'on_chain_start' &&
                                eventData.name === 'LangGraph'
                            ) {
                                // Extract agent name from the initial data
                                agentName =
                                    eventData.data?.input?.agent_properties
                                        ?.name || 'AI Assistant'
                            }

                            if (eventData.event === 'on_chat_model_start') {
                                // Start of AI response generation
                                streamingContent = ''
                                streamingMessageId = Date.now()

                                const streamingMessage: StreamingMessage = {
                                    id: streamingMessageId,
                                    text: '',
                                    sender: 'ai',
                                    timestamp: new Date().toLocaleTimeString(
                                        [],
                                        {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }
                                    ),
                                    isStreaming: true,
                                    agentName: agentName || 'AI Assistant',
                                }

                                setMessages((prev) => {
                                    // Remove any existing streaming message and add the new one
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
                                // Handle streaming content chunks
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
                                // Process the final response
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
                                        // Create or update the agent message
                                        const agentMessage: StreamingMessage = {
                                            id:
                                                streamingMessageId ||
                                                Date.now(),
                                            text: latestAiMessage.content,
                                            sender: 'ai',
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
                                        }

                                        setMessages((prev) => {
                                            // Remove any existing streaming message and add the final one
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
                        } catch (error) {
                            console.error('Error parsing stream data:', error)
                        }
                    }

                    if (line.startsWith('event: completed')) {
                        // Stream completed
                        setIsStreaming(false)
                        return
                    }
                }
            }
        } catch (error) {
            console.error('Stream error:', error)
            setIsStreaming(false)

            // Add error message
            const errorMessage: StreamingMessage = {
                id: Date.now(),
                text: "I'm sorry, I encountered an error. Please try again.",
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                isStreaming: false,
            }
            setMessages((prev) => [...prev, errorMessage])
        }
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

            // Add streaming indicator
            const streamingMessage: StreamingMessage = {
                id: Date.now() + 1,
                text: 'Thinking...',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                isStreaming: true,
            }
            setMessages((prev) => [...prev, streamingMessage])

            // Handle the stream response
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    return (
        <div className="flex flex-1 flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-purple-600">
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
                        {messages.map((msg) => (
                            <div key={msg.id} className="mb-4">
                                <MessageComponent message={msg} />
                                {msg.isStreaming && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                                            <div
                                                className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"
                                                style={{
                                                    animationDelay: '0.2s',
                                                }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"
                                                style={{
                                                    animationDelay: '0.4s',
                                                }}
                                            ></div>
                                        </div>
                                        <span>Assistant is typing...</span>
                                    </div>
                                )}
                                {msg.agentName &&
                                    msg.sender === 'ai' &&
                                    !msg.isStreaming && (
                                        <div className="mt-1 text-xs text-gray-500">
                                            — {msg.agentName}
                                        </div>
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
                        {quickGroups.map((group) => (
                            <button
                                key={group.name}
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
                            <div className="flex gap-1">
                                <div className="w-1 h-1 bg-purple-600 rounded-full animate-pulse"></div>
                                <div
                                    className="w-1 h-1 bg-purple-600 rounded-full animate-pulse"
                                    style={{ animationDelay: '0.2s' }}
                                ></div>
                                <div
                                    className="w-1 h-1 bg-purple-600 rounded-full animate-pulse"
                                    style={{ animationDelay: '0.4s' }}
                                ></div>
                            </div>
                            <span>Processing your message...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VoiceAICustomerInterface
