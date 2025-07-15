import React from "react"

type Props = {
  isActive?: boolean
  index: number | string
  handleClick: (index: number | string) => void
}

export default function Pill({ isActive = false, index, handleClick }: Props) {
  return (
    <button
      disabled={typeof index == "string"}
      className={`${
        isActive ? "bg-emerald-500/70 " : ""
      }h-full w-fit rounded px-2.5 py-1.5 text-center align-middle text-sm font-bold transition duration-200 ease-in-out ${
        typeof index != "string" ? "hover:bg-accent/90 hover:text-primary" : ""
      }`}
      onClick={() => handleClick(index)}
    >
      {index}
    </button>
  )
}
