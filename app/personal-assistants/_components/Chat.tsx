'use client'

import React, { useEffect, useRef, useState, useReducer } from 'react'
import { Bot } from 'lucide-react'
import { AgentEvent, Message } from '@/types/message'
import { default as MessageComponent } from '@/components/chat/Message'
import MessageInput from '@/components/chat/MessageInput'

import { toast } from 'sonner'
import MessageLoading from '@/components/chat/MessageLoading'
import { ToolCalls } from '@/components/chat/ToolCalls'
import { produce } from 'immer'
import { useSelectedAgent } from '@/providers/agents-provider'
import { Button } from '@/components/ui/button'
import { ViewType } from '@/types/view'
import { useThemeColor } from '@/providers/color-theme-provider'

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
    agentName: string
    streamingContent: string
}

type MessagesAction =
    | { type: 'ADD_USER_MESSAGE'; message: StreamingMessage }
    | { type: 'START_STREAMING'; agentName: string; messageId: number }
    | { type: 'UPDATE_STREAMING_CONTENT'; messageId: number; content: string }
    | { type: 'FINISH_RESPONSE'; finalMessage: StreamingMessage }
    | { type: 'ADD_ERROR'; error: StreamingMessage }
    | { type: 'STOP_STREAMING' }

const messagesReducer = produce(
    (draft: MessagesState, action: MessagesAction) => {
        switch (action.type) {
            case 'ADD_USER_MESSAGE':
                draft.messages.push(action.message)
                break

            case 'START_STREAMING':
                draft.isStreaming = true
                draft.agentName = action.agentName
                draft.streamingContent = ''
                draft.currentStreamingId = action.messageId

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
                    isStep: false,
                }
                draft.messages.push(streamingMessage)
                break

            case 'UPDATE_STREAMING_CONTENT':
                draft.streamingContent += action.content
                const messageIndex = draft.messages.findIndex(
                    (msg) => msg.id === action.messageId
                )
                if (messageIndex !== -1) {
                    draft.messages[messageIndex].text = draft.streamingContent
                }
                break

            case 'FINISH_RESPONSE':
                const streamingIndex = draft.messages.findIndex(
                    (msg) => msg.id === draft.currentStreamingId
                )
                if (streamingIndex !== -1) {
                    draft.messages[streamingIndex] = {
                        ...action.finalMessage,
                        isStreaming: false,
                    }
                }
                draft.isStreaming = false
                draft.currentStreamingId = null
                draft.streamingContent = ''
                break

            case 'ADD_ERROR':
                draft.messages.push(action.error)
                draft.isStreaming = false
                draft.currentStreamingId = null
                draft.streamingContent = ''
                break

            case 'STOP_STREAMING':
                // If we have streaming content, finalize it
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
        }
    }
)
type Props = {
    handleNavClick: (view: ViewType) => void
}
const VoiceAICustomerInterface: React.FC<Props> = ({ handleNavClick }) => {
    const { themeColor } = useThemeColor()
    // const { id } = useParams()
    const selectedAgent = useSelectedAgent()
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
        agentName: '',
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
            if (!selectedAgent) {
                throw Error('no agent selected please select an agent')
            }

            const response = await fetch(
                `/api/agents/chat?input=${userMessage}&id=${selectedAgent.id}`
            )

            // Check if response is not ok (HTTP error status)
            if (!response.ok) {
                const errorText = await response.text()
                const errorMessage: StreamingMessage = {
                    id: Date.now(),
                    text:
                        errorText ||
                        `HTTP Error: ${response.status} ${response.statusText}`,
                    sender: 'system',
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    isStreaming: false,
                }
                setIsError(true)
                dispatch({ type: 'ADD_ERROR', error: errorMessage })
                toast.error('An error occurred')
                return
            }

            const stream = response.body

            console.log('🔍 Client received stream:', stream)

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
            console.log('📖 Client reader:', reader)
            const decoder = new TextDecoder()

            const streamingMessageId = Date.now()
            dispatch({
                type: 'START_STREAMING',
                agentName: selectedAgent.name,
                messageId: streamingMessageId,
            })

            let buffer = ''
            let hasReceivedContent = false
            let accumulatedContent = ''

            // Helper function to safely parse JSON with better error handling
            const safeJsonParse = (jsonString: string) => {
                try {
                    return { success: true, data: JSON.parse(jsonString) }
                } catch (error) {
                    return { success: false, error }
                }
            }

            // Process a complete SSE line
            const processSseLine = (line: string) => {
                console.log('📝 Processing line:', line)

                if (!line.trim().startsWith('data: ')) {
                    if (line.trim()) {
                        console.warn(
                            '⚠️ Received non-SSE formatted line:',
                            line.trim()
                        )

                        const errorMessage: StreamingMessage = {
                            id: Date.now(),
                            text: line.trim(),
                            sender: 'system',
                            timestamp: new Date().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            }),
                            isStreaming: false,
                        }
                        setIsError(true)
                        dispatch({ type: 'ADD_ERROR', error: errorMessage })
                        toast.error('An error occurred')
                        return false // Indicate error
                    }
                    return true // Continue processing
                }

                const jsonString = line.slice(6).trim()
                console.log('🔧 Extracted JSON:', jsonString)

                if (!jsonString) {
                    return true // Skip empty data lines
                }

                const parseResult = safeJsonParse(jsonString)
                if (!parseResult.success) {
                    console.warn('❌ Failed to parse JSON line:', jsonString)
                    console.warn('Parse error:', parseResult.error)
                    return true // Continue processing other lines
                }

                const eventData = parseResult.data
                console.log('📊 Parsed event data:', eventData)

                if (eventData.type === 'content' && eventData.content) {
                    hasReceivedContent = true
                    accumulatedContent += eventData.content
                    console.log(
                        '➕ Accumulated content so far:',
                        accumulatedContent
                    )

                    dispatch({
                        type: 'UPDATE_STREAMING_CONTENT',
                        messageId: streamingMessageId,
                        content: eventData.content,
                    })
                } else if (eventData.type === 'end') {
                    console.log(
                        '🏁 Stream end detected, final content:',
                        accumulatedContent
                    )

                    const finalMessage: StreamingMessage = {
                        id: streamingMessageId,
                        text: accumulatedContent,
                        sender: 'assistant',
                        timestamp: new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        isStreaming: false,
                        agentName: selectedAgent.name || 'AI Agent',
                        isStep: false,
                    }

                    dispatch({
                        type: 'FINISH_RESPONSE',
                        finalMessage,
                    })
                    return 'end' // Signal end of stream
                }

                return true // Continue processing
            }

            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    console.log('✅ Client stream finished')
                    break
                }

                const chunk = decoder.decode(value, { stream: true })
                console.log('📦 Client received chunk:', chunk)

                // Add chunk to buffer
                buffer += chunk

                // Process complete lines from buffer
                while (true) {
                    // Look for complete lines (ending with \n)
                    const newlineIndex = buffer.indexOf('\n')

                    if (newlineIndex === -1) {
                        // No complete line found, wait for more data
                        break
                    }

                    // Extract the complete line (excluding the newline)
                    const line = buffer.substring(0, newlineIndex)
                    // Remove the processed line from buffer
                    buffer = buffer.substring(newlineIndex + 1)

                    // Process the complete line
                    const result = processSseLine(line)

                    if (result === 'end') {
                        // Stream ended, clean up and return
                        return
                    } else if (result === false) {
                        // Error occurred, stop processing
                        return
                    }
                }
            }

            // Handle any remaining buffer content after stream ends
            if (buffer.trim()) {
                console.log('🔄 Processing final buffer:', buffer.trim())

                // Process any remaining complete lines in buffer
                const remainingLines = buffer
                    .split('\n')
                    .filter((line) => line.trim())

                for (const line of remainingLines) {
                    const result = processSseLine(line)
                    if (result === 'end' || result === false) {
                        return
                    }
                }
            }

            // Finish the response if we received content but no explicit end event
            if (hasReceivedContent) {
                console.log(
                    '✅ Finishing response with accumulated content:',
                    accumulatedContent
                )

                const finalMessage: StreamingMessage = {
                    id: streamingMessageId,
                    text: accumulatedContent,
                    sender: 'assistant',
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    isStreaming: false,
                    agentName: selectedAgent.name,
                    isStep: false,
                }
                dispatch({ type: 'FINISH_RESPONSE', finalMessage })
            } else {
                console.log('⚠️ No content received, stopping stream')
                dispatch({ type: 'STOP_STREAMING' })
            }
        } catch (error) {
            setIsError(true)
            console.error('💥 Stream error:', error)

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
                {
                    // add if no selected agent
                    !selectedAgent ? (
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
                                </div>
                            ))}

                            <div ref={messagesEndRef} />
                        </div>
                    )
                }
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
