'use client'

import React, {
    createContext,
    useContext,
    useReducer,
    useRef,
    ReactNode,
} from 'react'
import { produce } from 'immer'
import { StreamingMessage } from '@/types/message'

interface MemoryOperation {
    type: 'add_message_to_memory' | 'retrieve_memory'
    args: any
    result: any
}

interface MessagesState {
    messages: StreamingMessage[]
    isStreaming: boolean
    currentStreamingId: number | null
    agentName: string
    streamingContent: string
    currentMemoryOperations: MemoryOperation[]
}

type MessagesAction =
    | { type: 'ADD_USER_MESSAGE'; message: StreamingMessage }
    | { type: 'START_STREAMING'; agentName: string; messageId: number }
    | { type: 'UPDATE_STREAMING_CONTENT'; messageId: number; content: string }
    | { type: 'ADD_MEMORY_OPERATION'; operation: MemoryOperation }
    | { type: 'FINISH_RESPONSE'; finalMessage: StreamingMessage }
    | { type: 'ADD_ERROR'; error: StreamingMessage }
    | { type: 'STOP_STREAMING' }
    | { type: 'CLEAR_MESSAGES' }

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
                draft.currentMemoryOperations = []

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
                    memoryOperations: [],
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

            case 'ADD_MEMORY_OPERATION':
                draft.currentMemoryOperations.push(action.operation)
                const currentMessageIndex = draft.messages.findIndex(
                    (msg) => msg.id === draft.currentStreamingId
                )
                if (currentMessageIndex !== -1) {
                    draft.messages[currentMessageIndex].memoryOperations = [
                        ...draft.currentMemoryOperations,
                    ]
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
                        memoryOperations: [...draft.currentMemoryOperations],
                    }
                }
                draft.isStreaming = false
                draft.currentStreamingId = null
                draft.streamingContent = ''
                draft.currentMemoryOperations = []
                break

            case 'ADD_ERROR':
                draft.messages.push(action.error)
                draft.isStreaming = false
                draft.currentStreamingId = null
                draft.streamingContent = ''
                draft.currentMemoryOperations = []
                break

            case 'STOP_STREAMING':
                if (draft.currentStreamingId && draft.streamingContent) {
                    const streamingIndex = draft.messages.findIndex(
                        (msg) => msg.id === draft.currentStreamingId
                    )
                    if (streamingIndex !== -1) {
                        draft.messages[streamingIndex].text =
                            draft.streamingContent
                        draft.messages[streamingIndex].isStreaming = false
                        draft.messages[streamingIndex].memoryOperations = [
                            ...draft.currentMemoryOperations,
                        ]
                    }
                }
                draft.isStreaming = false
                draft.currentStreamingId = null
                draft.messages = draft.messages.filter(
                    (msg) => !msg.isStreaming || (msg.isStreaming && msg.text)
                )
                draft.streamingContent = ''
                draft.currentMemoryOperations = []
                break

            case 'CLEAR_MESSAGES':
                draft.messages = []
                draft.isStreaming = false
                draft.currentStreamingId = null
                draft.streamingContent = ''
                draft.currentMemoryOperations = []
                break
        }
    }
)

interface MessagesContextType {
    state: MessagesState
    dispatch: React.Dispatch<MessagesAction>
    abortControllerRef: React.MutableRefObject<AbortController | null>
    addUserMessage: (text: string) => void
    startStreaming: (agentName: string) => number
    updateStreamingContent: (messageId: number, content: string) => void
    addMemoryOperation: (operation: MemoryOperation) => void
    finishResponse: (
        messageId: number,
        content: string,
        agentName: string
    ) => void
    addError: (errorText: string) => void
    stopStreaming: () => void
    clearMessages: () => void
}

const MessagesContext = createContext<MessagesContextType | undefined>(
    undefined
)

const initialState: MessagesState = {
    messages: [],
    isStreaming: false,
    currentStreamingId: null,
    agentName: '',
    streamingContent: '',
    currentMemoryOperations: [],
}

interface MessagesProviderProps {
    children: ReactNode
}

export const MessagesProvider: React.FC<MessagesProviderProps> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(messagesReducer, initialState)
    const abortControllerRef = useRef<AbortController | null>(null)

    const addUserMessage = (text: string) => {
        const message: StreamingMessage = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        }
        dispatch({ type: 'ADD_USER_MESSAGE', message })
    }

    const startStreaming = (agentName: string): number => {
        const messageId = Date.now()
        dispatch({
            type: 'START_STREAMING',
            agentName,
            messageId,
        })
        return messageId
    }

    const updateStreamingContent = (messageId: number, content: string) => {
        dispatch({
            type: 'UPDATE_STREAMING_CONTENT',
            messageId,
            content,
        })
    }

    const addMemoryOperation = (operation: MemoryOperation) => {
        dispatch({
            type: 'ADD_MEMORY_OPERATION',
            operation,
        })
    }

    const finishResponse = (
        messageId: number,
        content: string,
        agentName: string
    ) => {
        const finalMessage: StreamingMessage = {
            id: messageId,
            text: content,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
            isStreaming: false,
            agentName,
            isStep: false,
        }
        dispatch({
            type: 'FINISH_RESPONSE',
            finalMessage,
        })
    }

    const addError = (errorText: string) => {
        const errorMessage: StreamingMessage = {
            id: Date.now(),
            text: errorText,
            sender: 'system',
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
            isStreaming: false,
        }
        dispatch({ type: 'ADD_ERROR', error: errorMessage })
    }

    const stopStreaming = () => {
        dispatch({ type: 'STOP_STREAMING' })
    }

    const clearMessages = () => {
        dispatch({ type: 'CLEAR_MESSAGES' })
    }

    const contextValue: MessagesContextType = {
        state,
        dispatch,
        abortControllerRef,
        addUserMessage,
        startStreaming,
        updateStreamingContent,
        addMemoryOperation,
        finishResponse,
        addError,
        stopStreaming,
        clearMessages,
    }

    return (
        <MessagesContext.Provider value={contextValue}>
            {children}
        </MessagesContext.Provider>
    )
}

export const useMessages = (): MessagesContextType => {
    const context = useContext(MessagesContext)
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessagesProvider')
    }
    return context
}

export type { MemoryOperation, MessagesState, MessagesAction }
