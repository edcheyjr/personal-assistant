import React from 'react'
import { Headphones, Menu, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeMenu } from '@/components/ThemeMenu'
import { useThemeColor } from '@/lib/theme'
type Props = {
    toggleSidebar: () => void
}

const NavBar = ({ toggleSidebar }: Props) => {
    const { themeColor } = useThemeColor()
    return (
        // TODO: use theme color
        <div
            className="flex h-16 items-center justify-between  px-6"
            style={{
                backgroundImage: `linear-gradient(to right, ${themeColor} 80%, ${themeColor} 20%)`,
            }}
        >
            <div className="flex items-center align-center gap-3">
                <Button
                    variant={'ghost'}
                    size={'icon'}
                    onClick={toggleSidebar}
                    className="rounded-lg p-2 transition-colors lg:hidden bg-black/10"
                >
                    <Menu className="size-5" />
                </Button>
                {/* TODO: Show if reecording */}
                <div className="p-2 rounded bg-black/10">
                    <Headphones className="size-5" />
                </div>{' '}
                <span
                    className="font-medium text-white text-shadow-2xs text-shadow-black"
                    // className={`font-medium text-white text-shadow-2xs text-shadow-[${themeColor}]`}
                >
                    AI Voice Assistant
                </span>
                {/* 
                <span className="text-sm text-purple-200 font-semibold bg-black/5 px-2 py-1 rounded">
                    • Ready
                </span> */}
            </div>
            <div className="flex items-center gap-3">
                {/* TODOO: use Voice Provider to enable voice */}
                <Button
                    variant={'ghost'}
                    size={'icon'}
                    className="rounded-lg p-2 transition-colors text-white hover:text-white"
                >
                    <Mic className="size-5" />
                </Button>
                <ThemeMenu />
            </div>
        </div>
    )
}

export default NavBar
