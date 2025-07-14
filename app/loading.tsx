import Loader from '@/components/Loader'
import React from 'react'

type Props = {}

const loading = (props: Props) => {
    return (
        <div className=" grid min-h-screen place-content-center">
            <Loader className="size-12" />
        </div>
    )
}

export default loading
