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

        <path d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8Zm-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z" />
    </svg>
)
export default Icon
