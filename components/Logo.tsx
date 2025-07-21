'use client'
import { useThemeColor } from '@/providers/color-theme-provider'
import { Bot } from 'lucide-react'
import React from 'react'

type Props = {}

const Logo = (props: Props) => {
    const { themeColor } = useThemeColor()
    return (
        <div className="flex items-center gap-3 ">
            <div
                style={{ backgroundColor: themeColor }}
                className="flex p-2 items-center justify-center rounded-md bg-purple-600"
            >
                <Bot className="size-5 text-white" />
            </div>
            <div className="w-full">
                <h1 className="text-base font-bold">Multi Agents</h1>
                <p className="text-xs text-gray-400">Sentiint.ai</p>
            </div>
        </div>
    )
}

export default Logo
