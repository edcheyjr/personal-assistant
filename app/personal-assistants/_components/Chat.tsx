'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Bot, LucideIcon, Mic, MicOff, Send } from 'lucide-react'

// Types
interface Message {
    id: number
    text: string
    sender: 'user' | 'ai'
    timestamp: string
}

interface QuickGroup {
    name: string
    active: boolean
}

interface MessageProps {
    message: Message
}

const VoiceAICustomerInterface: React.FC = () => {
    const [message, setMessage] = useState<string>('')
    const [isListening, setIsListening] = useState<boolean>(false)
    const [isRecording, setIsRecording] = useState<boolean>(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedGroup, setSelectedGroup] = useState<string>('Support Team')

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = (): void => {
        if (message.trim()) {
            const newMessage: Message = {
                id: Date.now(),
                text: message,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }
            setMessages((prev) => [...prev, newMessage])
            setMessage('')

            // Simulate AI response
            setTimeout(() => {
                const aiResponse: Message = {
                    id: Date.now() + 1,
                    text: "I understand you'd like to start a conversation. How can I assist you today?",
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                }
                setMessages((prev) => [...prev, aiResponse])
            }, 1000)
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

    const Message: React.FC<MessageProps> = ({ message }) => (
        <div
            className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
            } mb-4`}
        >
            <div
                className={`max-w-xs rounded-lg px-4 py-3 sm:max-w-sm lg:max-w-md ${
                    message.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                }`}
            >
                <p className="text-sm">{message.text}</p>
                <p
                    className={`mt-1 text-xs ${
                        message.sender === 'user'
                            ? 'text-purple-200'
                            : 'text-gray-400'
                    }`}
                >
                    {message.timestamp}
                </p>
            </div>
        </div>
    )

    const handleTextareaInput = (
        e: React.FormEvent<HTMLTextAreaElement>
    ): void => {
        const target = e.target as HTMLTextAreaElement
        target.style.height = 'auto'
        target.style.height = Math.min(target.scrollHeight, 120) + 'px'
    }

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
                            <Message key={msg.id} message={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-700 p-4">
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
                    <div className="relative">
                        <div className="flex items-end gap-2 sm:gap-3">
                            <div className="relative flex-1">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    className="w-full resize-none rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none sm:text-base"
                                    rows={1}
                                    style={{
                                        minHeight: '52px',
                                        maxHeight: '120px',
                                    }}
                                    onInput={handleTextareaInput}
                                />
                            </div>

                            <button
                                onClick={toggleListening}
                                className={`rounded-lg p-2 transition-all sm:p-3 ${
                                    isRecording
                                        ? 'animate-pulse bg-red-600 hover:bg-red-700'
                                        : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                                {isRecording ? (
                                    <MicOff className="size-4 sm:size-5" />
                                ) : (
                                    <Mic className="size-4 sm:size-5" />
                                )}
                            </button>

                            <button
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                className="rounded-lg bg-purple-600 p-2 transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-700 sm:p-3"
                            >
                                <Send className="size-4 sm:size-5" />
                            </button>
                        </div>

                        {isRecording && (
                            <div className="absolute -top-12 left-4 rounded-full bg-red-600 px-3 py-1 text-sm text-white">
                                Recording...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VoiceAICustomerInterface
