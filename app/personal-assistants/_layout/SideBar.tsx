import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { ViewType } from '@/types/view'
import {
    BarChart3,
    Bot,
    LucideIcon,
    MessageSquare,
    Settings,
    X,
} from 'lucide-react'
import React from 'react'

type Props = {
    sidebarOpen: boolean
    currentView: ViewType
    handleNavClick: (view: ViewType) => void
    toggleSidebar: () => void
}

interface NavItemProps {
    icon: LucideIcon
    label: string
    active: boolean
    onClick: () => void
}

const SideMenuBar = ({
    sidebarOpen,
    currentView,
    handleNavClick,
    toggleSidebar,
}: Props) => {
    const NavItem: React.FC<NavItemProps> = ({
        icon: Icon,
        label,
        active,
        onClick,
    }) => (
        <button
            onClick={() => {
                onClick()
                handleNavClick(currentView)
            }}
            className={`cursor-pointer flex w-full gap-3 rounded-lg px-4 py-3 transition-all ${
                active
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
            }`}
        >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
        </button>
    )

    return (
        <div
            className={`
  fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-gray-800 transition-transform duration-300 ease-in-out lg:relative
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  lg:translate-x-0
`}
        >
            {/* Header */}
            <div className="border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <Logo />
                    <Button
                        variant={'ghost'}
                        size={'icon'}
                        onClick={toggleSidebar}
                        className="rounded-lg p-2 transition-colors hover:bg-gray-700 lg:hidden "
                    >
                        <X className="size-5" />
                    </Button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 space-y-2 p-4">
                <NavItem
                    icon={MessageSquare}
                    label="Customer Interface"
                    active={currentView === 'customer-interface'}
                    onClick={() => handleNavClick('customer-interface')}
                />
                <NavItem
                    icon={BarChart3}
                    label="Agent Overview"
                    active={currentView === 'agent-overview'}
                    onClick={() => handleNavClick('agent-overview')}
                />
                <NavItem
                    icon={Settings}
                    label="Agent Configuration"
                    active={currentView === 'agent-configuration'}
                    onClick={() => handleNavClick('agent-configuration')}
                />
            </div>

            {/* System Status */}
            <div className="border-t border-gray-700 p-4">
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Total Agents</span>
                        <span className="font-medium">6</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Active Agents</span>
                        <span className="font-medium">6</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Agent Groups</span>
                        <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">System Status</span>
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-green-500"></div>
                            <span className="font-medium text-green-400">
                                Operational
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideMenuBar
