import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  disable?: boolean
  isRight?: boolean
  handleClick?: () => void
}

export default function Button({
  disable,
  isRight = false,
  handleClick,
}: Props) {
  const sharedStyle = `flex items-center justify-center rounded-md space-x-1.5 bg-background px-2.5 py-2 ${
    !disable ? "group-hover:bg-secondary/70" : "bg-accent/70"
  } transition duration-200 ease-in-out border ${
    !disable ? "border-blue-300/20" : ""
  }  text-sm capitalize`
  return (
    <button
      disabled={disable}
      onClick={handleClick}
      className={`group relative ${disable ? "text-primary/30" : ""}`}
    >
      {isRight ? (
        <div className={sharedStyle}>
          <span className="">next</span>
          <ChevronRight className="size-4" />
        </div>
      ) : (
        <div className={sharedStyle}>
          <ChevronLeft className="size-4" />
          <span className="">back</span>
        </div>
      )}
      {/* blur effect */}
      {/* <div className="absolute right-0 top-0 -z-10 h-full w-full rounded-md bg-blue-400/20 blur-sm transition duration-500 ease-in-out hover:blur-0  group-hover:duration-200"></div> */}
    </button>
  )
}
