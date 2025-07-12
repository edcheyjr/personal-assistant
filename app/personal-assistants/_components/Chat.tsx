'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Bot } from 'lucide-react'
import { Message } from '@/types/message'
import { default as MessageComponent } from '@/components/chat/Message'
import MessageInput from '@/components/chat/MessageInput'

interface QuickGroup {
    name: string
    active: boolean
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
                            <MessageComponent key={msg.id} message={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t p-5 bg-card ">
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
                    />
                </div>
            </div>
        </div>
    )
}

export default VoiceAICustomerInterface
