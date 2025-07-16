"use client"

import React, { FocusEventHandler } from "react"
import { cn } from "@/utils/cn"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface SelectOption<K, T> {
    value: K
    label: T
}

interface Props<K, T> extends React.ComponentProps<typeof Select> {
    defaultLabel?: React.ReactNode | string
    selectItems: Readonly<SelectOption<K, T>[]>
    placeholder?: string
    width?: string
    className?: string
    inputHelper?: React.ReactNode
}

export function SelectInput<K extends string, T extends React.ReactNode>({
    defaultLabel,
    selectItems,
    placeholder = "Select",
    width = "w-[180px]",
    className,
    defaultValue,
    inputHelper,
    disabled,
    ...rest
}: Props<K, T>) {
    const radius = 100
    const [visible, setVisible] = React.useState(false)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const handleMouseEnter = () => !disabled && setVisible(true)
    const handleMouseLeave = () => !disabled && setVisible(false)

    const handleMouseMove = ({
        currentTarget,
        clientX,
        clientY,
    }: React.MouseEvent) => {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    return (
        <Select {...rest} disabled={disabled} defaultValue={defaultValue}>
            <div>
                <motion.div
                    style={{
                        background: useMotionTemplate`radial-gradient(
              ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
              var(--blue-500),
              transparent 80%
            )`,
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="group/input relative w-full rounded-lg p-[2px] transition duration-300"
                >
                    <SelectTrigger
                        className={cn(
                            "shadow-xs shadow-input duration-400 bg-input border-border focus-visible:ring-primary ring-border focus:ring-primary flex h-10 w-full resize-y rounded-md border px-3 py-2 text-sm text-black transition placeholder:text-gray-400 focus:ring-2 focus-visible:outline-none  focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none dark:text-white dark:shadow-[0px_0px_1px_1px_var(--neutral-700)] dark:placeholder:text-gray-500",
                            `${width}`,
                            className
                        )}
                        defaultValue={defaultValue}
                    >
                        <SelectValue
                            placeholder={placeholder}
                            defaultValue={defaultValue}
                            className="w-full placeholder:text-neutral-400"
                        />
                    </SelectTrigger>
                </motion.div>
                {inputHelper && (
                    <div className="text-muted-foreground mt-2 text-sm">
                        {inputHelper}
                    </div>
                )}
            </div>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{defaultLabel}</SelectLabel>
                    {selectItems.map((item, index) => {
                        return (
                            <SelectItem
                                key={index + item.value}
                                value={item.value}
                            >
                                {item.label}
                            </SelectItem>
                        )
                    })}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
