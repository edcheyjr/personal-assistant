'use client'

import { ViewType } from '@/types/view'
import React, { useState } from 'react'
import SideMenuBar from './_layout/SideBar'

import Chat from './_components/Chat'
import Settings from './_components/Settings'
import NavBar from './_layout/NavBar'
import ThemeDemo from '@/components/ui/theme-demo'

export default function PersonalAssitants({ sessionData }: any) {
    const [currentView, setCurrentView] =
        useState<ViewType>('customer-interface')
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

    const toggleSidebar = (): void => {
        setSidebarOpen(!sidebarOpen)
    }

    const handleNavClick = (view: ViewType): void => {
        setCurrentView(view)
        setSidebarOpen(false)
    }
    return (
        <div className="relative flex min-h-screen size-full overflow-hidden ">
            {/* Sidebar Overlay for Mobile */}

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
                <NavBar toggleSidebar={toggleSidebar} />
                {/* Chat Area */}
                {currentView == 'customer-interface' ? <Chat /> : <></>}
                {/* Agent Overview */}
                {currentView == 'agent-overview' ? <ThemeDemo /> : <></>}

                {/* Setting */}
                {currentView == 'agent-configuration' ? <Settings /> : <></>}
            </div>
        </div>
    )
}
