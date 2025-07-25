'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Bot } from 'lucide-react'
import { default as MessageComponent } from '@/components/chat/Message'
import MessageInput from '@/components/chat/MessageInput'
import MessageLoading from '@/components/chat/MessageLoading'
import { useSelectedAgent } from '@/providers/agents-provider'
import { Button } from '@/components/ui/button'
import { ViewType } from '@/types/view'
import { useThemeColor } from '@/providers/color-theme-provider'
import { logger } from '@/utils/logger'
import { useMessages, MemoryOperation } from '@/providers/message-provider'

interface QuickGroup {
    name: string
    active: boolean
}

type Props = {
    handleNavClick: (view: ViewType) => void
}

const VoiceAICustomerInterface: React.FC<Props> = ({ handleNavClick }) => {
    const { themeColor } = useThemeColor()
    const selectedAgent = useSelectedAgent()
    const {
        state: messagesState,
        abortControllerRef,
        addUserMessage,
        startStreaming,
        updateStreamingContent,
        addMemoryOperation,
        finishResponse,
        addError,
        stopStreaming,
    } = useMessages()

    const [message, setMessage] = useState<string>('')
    const [isError, setIsError] = useState<boolean>(false)
    const [isListening, setIsListening] = useState<boolean>(false)
    const [isRecording, setIsRecording] = useState<boolean>(false)
    const [selectedGroup, setSelectedGroup] = useState<string>('Support Team')

    const messagesEndRef = useRef<HTMLDivElement>(null)

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
            if (!selectedAgent) {
                throw Error('no agent selected please select an agent')
            }

            const response = await fetch(
                `/api/agents/chat?input=${userMessage}&id=${selectedAgent.id}`,
                {
                    signal: abortControllerRef.current.signal,
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const stream = response.body

            if (!stream) {
                addError('No response received from the server')
                return
            }

            const reader = stream.getReader()
            const decoder = new TextDecoder()

            const streamingMessageId = startStreaming(selectedAgent.name)

            let accumulatedContent = ''
            let pendingMemoryCall: {
                type: string
                tool: string
                args: any
            } | null = null

            try {
                while (true) {
                    const { done, value } = await reader.read()

                    if (done) {
                        break
                    }

                    const chunk = decoder.decode(value, { stream: true })

                    // Parse each line that starts with "data: "
                    const lines = chunk
                        .split('\n')
                        .filter((line) => line.startsWith('data: '))

                    for (const line of lines) {
                        try {
                            const jsonStr = line.replace('data: ', '')
                            let data: any
                            try {
                                data = JSON.parse(jsonStr)
                            } catch (parseError) {
                                process.env.NODE_ENV == 'development'
                                    ? logger(
                                          parseError,
                                          'JSON Parse Failed, Error ',
                                          'error'
                                      )
                                    : logger(
                                          'json parsing might have failed',
                                          '',
                                          'warning'
                                      )
                                continue
                            }

                            if (data.type === 'content' && data.content) {
                                accumulatedContent += data.content
                                updateStreamingContent(
                                    streamingMessageId,
                                    data.content
                                )
                            } else if (data.type === 'memory_call') {
                                pendingMemoryCall = data
                            } else if (
                                data.type === 'memory_result' &&
                                pendingMemoryCall
                            ) {
                                const memoryOperation: MemoryOperation = {
                                    type: pendingMemoryCall.tool as
                                        | 'add_message_to_memory'
                                        | 'retrieve_memory',
                                    args: pendingMemoryCall.args,
                                    result: JSON.parse(data.output),
                                }

                                addMemoryOperation(memoryOperation)
                                pendingMemoryCall = null
                            }
                        } catch (e) {
                            console.error('Error parsing stream data:', e)
                        }
                    }
                }
            } finally {
                reader.releaseLock()
            }

            if (accumulatedContent) {
                finishResponse(
                    streamingMessageId,
                    accumulatedContent,
                    selectedAgent.name || 'AI Agent'
                )
            } else {
                stopStreaming()
            }
        } catch (error) {
            setIsError(true)

            if (error instanceof Error && error.name === 'AbortError') {
                stopStreaming()
                return
            }

            const errorText =
                error instanceof Error
                    ? error.message
                    : "I'm sorry, I encountered an error. Please try again."

            addError(errorText)
        } finally {
            setIsError(false)
            stopStreaming()
        }
    }

    const handleSendMessage = async (): Promise<void> => {
        if (message.trim() && !messagesState.isStreaming) {
            addUserMessage(message)
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
        <div className="flex flex-1 flex-col overflow-hidden max-h-[92vh] min-[2048px]:max-h-[95vh]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 h-full">
                {!selectedAgent ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <div
                            style={{ backgroundColor: themeColor }}
                            className="mb-4 flex size-16 items-center justify-center rounded-full bg-purple-600 text-white text-shadow-2xs text-shadow-purple-950"
                        >
                            <Bot className="size-8" />
                        </div>
                        <h3 className="mb-2 text-xl font-medium">
                            No Selected Agent
                        </h3>
                        <p className="mb-6 text-gray-400">
                            Go to setting select an agent or create one
                        </p>
                        <Button
                            variant="default"
                            onClick={() => {
                                handleNavClick('agent-configuration')
                            }}
                        >
                            Go To Settings
                        </Button>
                    </div>
                ) : messagesState.messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <div
                            style={{ backgroundColor: themeColor }}
                            className="mb-4 flex size-16 items-center justify-center rounded-full bg-purple-600 text-white text-shadow-2xs text-shadow-purple-950"
                        >
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
                        {messagesState.messages.map((msg) => (
                            <div key={msg.id} className="mb-4">
                                <MessageComponent
                                    message={msg}
                                    isError={isError}
                                />

                                {msg.isStreaming && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                        <MessageLoading size="size-2" />
                                        <span>comtemplating...</span>
                                    </div>
                                )}

                                {msg.agentName &&
                                    msg.sender === 'assistant' &&
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
                        {quickGroups.map((group, index) => (
                            <button
                                style={
                                    selectedGroup === group.name
                                        ? {
                                              backgroundColor: themeColor,
                                          }
                                        : undefined
                                }
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
                        disabled={messagesState.isStreaming || !selectedAgent}
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
