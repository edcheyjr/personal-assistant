import * as React from "react"
import { SVGProps } from "react"

const Icon = ({
    title,
    titleId,
    desc,
    descId,
    ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        aria-labelledby={titleId}
        aria-describedby={descId}
        {...props}
    >
        {desc ? <desc id={descId}>{desc}</desc> : null}
        {title ? <title id={titleId}>{title}</title> : null}
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M2.5 11.666a.833.833 0 0 1 .833-.833h10a2.5 2.5 0 0 0 2.5-2.5V4.999A.833.833 0 1 1 17.5 5v3.334a4.167 4.167 0 0 1-4.167 4.166h-10a.833.833 0 0 1-.833-.833Z"
            clipRule="evenodd"
        />
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M2.744 12.255a.833.833 0 0 1 0-1.178l3.334-3.333a.833.833 0 0 1 1.178 1.178l-2.744 2.744 2.744 2.744a.832.832 0 1 1-1.178 1.179l-3.334-3.334Z"
            clipRule="evenodd"
        />
    </svg>
)
export default Icon
