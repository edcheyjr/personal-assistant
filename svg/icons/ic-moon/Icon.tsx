import * as React from "react"
import { SVGProps } from "react"

const IconMoon = ({
    title,
    titleId,
    desc,
    descId,
    ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        aria-labelledby={titleId}
        aria-describedby={descId}
        {...props}
    >
        {desc ? <desc id={descId}>{desc}</desc> : null}
        {title ? <title id={titleId}>{title}</title> : null}
        <g fill="none" fillOpacity={0}>
            <path d="m15.22 6.03 2.53-1.94L14.56 4 13.5 1l-1.06 3-3.19.09 2.53 1.94-.91 3.06 2.63-1.81 2.63 1.81z">
                <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="0.7s;lineMdMoonRisingLoop0.begin+6s"
                    dur="0.4s"
                    values="0;1"
                />
                <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdMoonRisingLoop0.begin+2.2s"
                    dur="0.4s"
                    values="1;0"
                />
            </path>
            <path d="M13.61 5.25 15.25 4l-2.06-.05L12.5 2l-.69 1.95L9.75 4l1.64 1.25-.59 1.98 1.7-1.17 1.7 1.17z">
                <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdMoonRisingLoop0.begin+3s"
                    dur="0.4s"
                    values="0;1"
                />
                <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdMoonRisingLoop0.begin+5.2s"
                    dur="0.4s"
                    values="1;0"
                />
            </path>
            <path d="M19.61 12.25 21.25 11l-2.06-.05L18.5 9l-.69 1.95-2.06.05 1.64 1.25-.59 1.98 1.7-1.17 1.7 1.17z">
                <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdMoonRisingLoop0.begin+0.4s"
                    dur="0.4s"
                    values="0;1"
                />
                <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdMoonRisingLoop0.begin+2.8s"
                    dur="0.4s"
                    values="1;0"
                />
            </path>
            <path d="m20.828 9.731 1.876-1.439-2.366-.067L19.552 6l-.786 2.225-2.366.067 1.876 1.439L17.601 12l1.951-1.342L21.503 12z">
                <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdMoonRisingLoop0.begin+3.4s"
                    dur="0.4s"
                    values="0;1"
                />
                <animate
                    fill="freeze"
                    attributeName="fill-opacity"
                    begin="lineMdMoonRisingLoop0.begin+5.6s"
                    dur="0.4s"
                    values="1;0"
                />
            </path>
        </g>
        <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 28a10.994 10.994 0 0 0 12.56 10.89C17.95 41.36 15.17 43 12 43a9 9 0 0 1-9-9c0-3.17 1.64-5.95 4.11-7.56C7.04 26.95 7 27.47 7 28Z"
        >
            <animateMotion
                fill="freeze"
                calcMode="linear"
                dur="0.6s"
                path="M0 0v-22"
            />
        </path>
    </svg>
)
export default IconMoon
