'use client'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { ViewType } from '@/types/view'
import {
    LoaderIcon,
    LogOut,
    LucideIcon,
    MessageSquare,
    Settings,
    X,
} from 'lucide-react'
import React, { useState } from 'react'
import { cn } from '@/utils/cn'
import { AgentType } from '@/types/agent'
import { useAgentContext } from '@/providers/agents-provider'
import { useRouter } from 'next/navigation'
import { routes } from '@/lib/routes'
import { signOut } from 'next-auth/react'

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
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { agents, isLoading, error } = useAgentContext()

    const numberUniqueAgentTypes = agents.reduce(
        (set: Set<AgentType>, agent) => {
            set.add(agent.agent_type)
            return set
        },
        new Set<AgentType>()
    ).size
    const handleSignOut = async () => {
        setLoading(false)
        await signOut()
        setLoading(true)
    }
    const NavItem: React.FC<NavItemProps> = ({
        icon: Icon,
        label,
        active,
        onClick,
    }) => (
        <Button
            variant={active ? 'default' : 'ghost'}
            onClick={onClick}
            className={cn(
                'w-full justify-start gap-3 px-4 py-3 h-auto font-medium transition-all',
                active
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
        >
            <Icon size={18} />
            <span>{label}</span>
        </Button>
    )

    return (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}
            <div
                className={cn(
                    'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-card border-r border-border transition-transform duration-300 ease-in-out lg:relative',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    'lg:translate-x-0'
                )}
            >
                {/* Header */}
                <div className="border-b border-border p-3">
                    <div className="flex items-center justify-between w-full">
                        <Logo />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="h-8 w-8 lg:hidden"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 p-4">
                    <NavItem
                        icon={MessageSquare}
                        label="Customer Interface"
                        active={currentView === 'customer-interface'}
                        onClick={() => handleNavClick('customer-interface')}
                    />
                    {/* <NavItem
                        icon={BarChart3}
                        label="Agent Overview"
                        active={currentView === 'agent-overview'}
                        onClick={() => handleNavClick('agent-overview')}
                    /> */}
                    <NavItem
                        icon={Settings}
                        label="Agent Configuration"
                        active={currentView === 'agent-configuration'}
                        onClick={() => handleNavClick('agent-configuration')}
                    />
                </nav>

                {/* System Status */}
                <div className="border-t border-border p-3.5">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                Total Agents
                            </span>
                            <span className="font-medium text-foreground">
                                {agents.length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                Active Agents
                            </span>
                            <span className="font-medium text-foreground">
                                {agents.length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                Agent Types
                            </span>
                            <span className="font-medium text-foreground">
                                {numberUniqueAgentTypes}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                                System Status
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"></div>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    Operational
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Logout  */}
                    <Button
                        variant={'outline'}
                        size={'lg'}
                        disabled={loading}
                        onClick={handleSignOut}
                        className="w-full mt-10 "
                    >
                        {loading ? (
                            <LoaderIcon className="animate-spin size-5 " />
                        ) : (
                            <LogOut className="size-5" />
                        )}{' '}
                        Logout
                    </Button>
                </div>
            </div>
        </>
    )
}

export default SideMenuBar
