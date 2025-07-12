import React from 'react'
import { Headphones, Menu, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeMenu } from '@/components/ThemeMenu'
type Props = {
    toggleSidebar: () => void
}

const NavBar = ({ toggleSidebar }: Props) => {
    return (
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
                <span className="text-sm text-purple-200 font-semibold">
                    • Ready
                </span>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant={'ghost'}
                    size={'icon'}
                    className="rounded-lg p-2 transition-colors hover:bg-purple-700 text-white hover:text-white"
                >
                    <Mic className="size-5" />
                </Button>
                <ThemeMenu />
            </div>
        </div>
    )
}

export default NavBar
