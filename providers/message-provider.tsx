'use client'

import React, {
    createContext,
    useContext,
    useReducer,
    useRef,
    ReactNode,
    useEffect,
} from 'react'
import { produce } from 'immer'
import { StreamingMessage } from '@/types/message'
import { useThreadId } from '@/hooks/api/use-thread-id'

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
    currentThreadId: string | null
    isLoadingNewThread: boolean
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
    | { type: 'SET_THREAD_ID'; threadId: string }
    | { type: 'SET_LOADING_NEW_THREAD'; isLoading: boolean }
    | { type: 'START_NEW_CONVERSATION'; threadId: string }

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

            case 'SET_THREAD_ID':
                draft.currentThreadId = action.threadId
                break

            case 'SET_LOADING_NEW_THREAD':
                draft.isLoadingNewThread = action.isLoading
                break

            case 'START_NEW_CONVERSATION':
                // Clear all messages and reset state
                draft.messages = []
                draft.isStreaming = false
                draft.currentStreamingId = null
                draft.streamingContent = ''
                draft.currentMemoryOperations = []
                // Set new thread ID
                draft.currentThreadId = action.threadId
                draft.isLoadingNewThread = false
                break
        }
    }
)

interface MessagesContextType {
    state: MessagesState
    dispatch: React.Dispatch<MessagesAction>
    abortControllerRef: React.RefObject<AbortController | null>
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
    startNewConversation: () => Promise<void>
    refreshCurrentThread: () => Promise<void>
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
    currentThreadId: null,
    isLoadingNewThread: false,
}

interface MessagesProviderProps {
    children: ReactNode
}

export const MessagesProvider: React.FC<MessagesProviderProps> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(messagesReducer, initialState)
    const abortControllerRef = useRef<AbortController | null>(null)
    const { data: uuidData, refetch: refetchUUID } = useThreadId()

    // Initialize with a thread ID on mount
    useEffect(() => {
        if (uuidData?.data?.thread_id && !state.currentThreadId) {
            dispatch({
                type: 'SET_THREAD_ID',
                threadId: uuidData.data.thread_id,
            })
        }
    }, [uuidData?.data?.thread_id, state.currentThreadId])

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

    const startNewConversation = async (): Promise<void> => {
        try {
            dispatch({ type: 'SET_LOADING_NEW_THREAD', isLoading: true })

            // Fetch a new UUID/thread ID
            const { data: newUuidData } = await refetchUUID()
            console.log('newUuidData', newUuidData)

            if (newUuidData?.data?.thread_id) {
                dispatch({
                    type: 'START_NEW_CONVERSATION',
                    threadId: newUuidData.data.thread_id,
                })
            } else {
                throw new Error('Failed to get new thread ID')
            }
        } catch (error) {
            console.error('Error starting new conversation:', error)
            dispatch({ type: 'SET_LOADING_NEW_THREAD', isLoading: false })
            // Add error message to let user know something went wrong
            addError('Failed to start new conversation. Please try again.')
        }
    }

    const refreshCurrentThread = async (): Promise<void> => {
        try {
            const { data: newUuidData } = await refetchUUID()
            if (newUuidData?.data?.thread_id) {
                dispatch({
                    type: 'SET_THREAD_ID',
                    threadId: newUuidData.data.thread_id,
                })
            }
        } catch (error) {
            console.error('Error refreshing thread:', error)
        }
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
        startNewConversation,
        refreshCurrentThread,
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
