import { MessageProps } from '@/types/message'
import React from 'react'

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

export default Message
