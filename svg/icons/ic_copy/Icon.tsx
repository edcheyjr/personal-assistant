import * as React from "react"
import { SVGProps } from "react"
import { cn } from "@/utils/cn"

const Icon = ({
    title,
    titleId,
    desc,
    descId,
    className,
    ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        className={cn("size-4", className)}
        aria-labelledby={titleId}
        aria-describedby={descId}
        {...props}
    >
        {desc ? <desc id={descId}>{desc}</desc> : null}
        {title ? <title id={titleId}>{title}</title> : null}

        <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
    </svg>
)
export default Icon
