import React from 'react'

type Props = {
    children: React.ReactNode
}

export default function layout({ children }: Props) {
    return <div className="size-full min-h-screen">{children}</div>
}
