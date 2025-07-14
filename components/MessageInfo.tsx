import { Dispatch, SetStateAction, useEffect, useState } from "react"
import * as React from "react"
import { cn } from "@/utils/cn"
import { CheckCircle2, XCircle } from "lucide-react"

type Props = {
    children: React.ReactNode
    isSuccess?: boolean
    isOpen: boolean
    setMessageOpen: Dispatch<SetStateAction<boolean>>
}

//
const Message = (props: Props) => {
    return (
        <div
            id="toast-success"
            className={` mb-4 w-full items-center rounded-sm p-3 text-gray-50 shadow ${
                props.isOpen ? "flex" : "hidden"
            } ${
                props.isSuccess
                    ? "bg-green-500"
                    : "bg-red-600 dark:bg-red-500/20"
            }`}
            role="alert"
        >
            <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-50/20 text-white dark:bg-gray-700/20 ">
                {props.isSuccess ? (
                    <svg
                        aria-hidden="true"
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                ) : (
                    <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                        <svg
                            aria-hidden="true"
                            className="size-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                        <span className="sr-only">Warning icon</span>
                    </div>
                )}
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ml-3 text-sm font-bold">{props.children}</div>
            <button
                type="button"
                className="-m-1.5 ml-auto inline-flex size-8 rounded-lg bg-white/10 p-1.5 text-gray-50 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300  "
                data-dismiss-target="#toast-success"
                aria-label="Close"
                onClick={() => props.setMessageOpen(false)}
            >
                <span className="sr-only">Close</span>
                <svg
                    aria-hidden="true"
                    className="size-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    ></path>
                </svg>
            </button>
        </div>
    )
}

interface FormMessagesProps extends React.HTMLAttributes<HTMLDivElement> {
    messages?: string[] | string | React.ReactNode
    type?: "error" | "success"
}
function FormMessages({
    messages,
    type = "error",
    className,
    ...props
}: FormMessagesProps) {
    if (!messages) {
        return null
    }

    const isReactNode = React.isValidElement(messages)

    if (!isReactNode && typeof messages === "string") {
        messages = [messages]
    }

    return (
        <div
            aria-invalid={type === "error"}
            className={cn(
                "text-destructive flex flex-col text-sm dark:text-red-400",
                type === "success" && " text-muted-foreground",
                className
            )}
            {...props}
        >
            {isReactNode
                ? messages
                : (messages as string[]).map((value, i) => (
                      <div key={i.toString()} className="flex gap-2">
                          {type === "error" ? (
                              <XCircle className="relative top-0.5 size-4 shrink-0" />
                          ) : (
                              <CheckCircle2 className="relative top-0.5 size-4 shrink-0" />
                          )}
                          <p>{value}</p>
                      </div>
                  ))}
        </div>
    )
}

export { Message, FormMessages }
