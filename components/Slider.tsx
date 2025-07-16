'use client'

import * as React from 'react'
import { Slider } from '@/components/ui/slider'

interface SliderComponentProps {
    label: string
    value: number
    onChange: (value: number) => void
    percentage: number
    selectedColor: string
}

export const SliderComponent: React.FC<SliderComponentProps> = ({
    label,
    value,
    onChange,
    percentage,
    selectedColor,
}) => {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">
                    {label}
                </span>
                <span className="text-sm text-muted-foreground">
                    {percentage}%
                </span>
            </div>
            <div className="relative w-full">
                <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[value]}
                    onValueChange={([val]) => onChange(val)}
                    className="w-full h-2 cursor-pointer"
                    trackStyle={{
                        background: `linear-gradient(to right, ${selectedColor} ${value}%, ${selectedColor} ${value}%)`,
                        opacity: 0.7,
                    }}
                    thumbStyle={{
                        backgroundColor: selectedColor,
                    }}
                />
            </div>
        </div>
    )
}
