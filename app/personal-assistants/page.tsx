'use client'

import { ViewType } from '@/types/view'
import React, { useState } from 'react'
import SideMenuBar from './_layout/SideBar'
import { Headphones, Menu, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Chat from './_components/Chat'
import Settings from './_components/Settings'

export default function PersonalAssitants({ sessionData }: any) {
    const [currentView, setCurrentView] =
        useState<ViewType>('customer-interface')
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

    const toggleSidebar = (): void => {
        setSidebarOpen(!sidebarOpen)
    }

    const handleNavClick = (view: ViewType): void => {
        setCurrentView(view)
        setSidebarOpen(false) // Close sidebar on mobile after navigation
    }
    return (
        <div className="relative flex min-h-screen size-full bg-gray-900 text-white">
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <SideMenuBar
                sidebarOpen={sidebarOpen}
                currentView={currentView}
                handleNavClick={handleNavClick}
                toggleSidebar={toggleSidebar}
            />
            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Top Bar */}
                <div className="flex h-16 items-center justify-between bg-purple-600 px-6">
                    <div className="flex items-center gap-3">
                        <Button
                            variant={'ghost'}
                            size={'icon'}
                            onClick={toggleSidebar}
                            className="rounded-lg p-2 transition-colors hover:bg-purple-700 lg:hidden"
                        >
                            <Menu className="size-5" />
                        </Button>
                        <Headphones className="size-5" />
                        <span className="font-medium">AI Voice Assistant</span>
                        <span className="text-sm text-purple-200">• Ready</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant={'ghost'}
                            size={'icon'}
                            className="rounded-lg p-2 transition-colors hover:bg-purple-700"
                        >
                            <Mic className="size-5" />
                        </Button>
                    </div>
                </div>

                {/* Chat Area */}
                {currentView == 'customer-interface' ? <Chat /> : <></>}
                {/* Setting */}
                {currentView == 'agent-configuration' ? <Settings /> : <></>}
            </div>
        </div>
    )
}
