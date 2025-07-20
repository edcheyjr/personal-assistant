/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import React, { useEffect, useState } from 'react'
import { filterArrayDifference } from '@/utils/filterArrayDifference'
import { Plus } from 'lucide-react'

import InputChip from './InputChip'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'

interface Props {
    values: string[]
    options: string[]
    type: 'text' | 'email' | 'search'
    name: string
    label?: string
    formikTouched?: boolean
    formikError?: string
    inputHelp?: string
    required?: boolean
    placeholder?: string
    labelClass?: string
    selectChangeDefault?: string | number
    onChange: (updatedValues: string[]) => void
    onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void
    MoreInfo?: React.JSX.Element
}

function SpecialSelectionInput({
    values,
    name,
    type,
    label,
    formikTouched,
    formikError,
    placeholder,
    required,
    labelClass,
    options,
    onChange,
    onBlur,
    inputHelp,
    MoreInfo,
}: Props) {
    // console.log("values", values)
    const [searchValue, setSearchValue] = useState<string>('')
    const [warning, setWarning] = useState('')
    const [filteredOptions, setFilteredOptions] = useState<string[]>([])

    const [isOpened, setIsOpened] = useState(false)

    const handleFilterOption = (value: string) => {
        // reset warning
        setWarning('')
        // If value is empty, return an empty array
        if (value && typeof value == 'string' && value.trim() === '') {
            setFilteredOptions([])
            return
        }
        // Filter the options array based on the provided value
        const filtered = options.filter((option) => {
            // Assuming option is a string, you can modify this condition accordingly
            return option.includes(value)
        })

        // Return the first five filtered results
        setFilteredOptions(filterArrayDifference(filtered, values).slice(0, 5))
    }
    const handleAddNewItem = () => {
        const tempArr = [...values]

        if (filteredOptions.length > 0) {
            setWarning('this already exist please select it on options')
        } else if (tempArr.includes(searchValue)) {
            setWarning('this as already be added please select another')
        } else {
            tempArr.push(searchValue)
            onChange(tempArr)
            setSearchValue('')
        }
    }
    const handleSelected = (value: string) => {
        const tempArr = [...values]
        if (values.includes(value)) {
            setWarning('this as already be added please select another')
        } else {
            tempArr.push(value)
            onChange(tempArr)
        }
        setSearchValue('')
    }

    useEffect(() => {
        if (!searchValue || searchValue == '') {
            setIsOpened(false)
        } else {
            setIsOpened(true)
        }
    }, [searchValue])

    useEffect(() => {
        handleFilterOption(searchValue)
    }, [searchValue])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const key = e.key

        if (key == 'Enter') {
            e.stopPropagation()
            e.preventDefault()
            // Do what the back button to the left does
            handleAddNewItem()
        }
    }

    setTimeout(() => setWarning(''), 1000 * 60) //set warning to empty after a min
    const handleRemoveItem = (index: number) => {
        // Make a copy of the array to avoid mutating the original array
        const updatedArr = [...values]

        // Check if the index is valid
        if (index >= 0 && index < updatedArr.length) {
            // Remove the item at the specified index
            updatedArr.splice(index, 1)

            // Update state or perform any other necessary actions
            onChange(updatedArr)
        }
    }
    return (
        <div className="w-full space-y-2 pb-4 xl:pb-6">
            <div
                style={{ width: '100%' }}
                className="group flex flex-wrap gap-1.5 rounded-md border border-gray-500 p-2 group-hover:ring-2 group-hover:ring-teal-500 group-focus:border-teal-500 group-focus:outline-none group-focus:ring-2 group-focus:ring-teal-500 dark:bg-gray-700 dark:text-white md:w-3/4"
            >
                {/* Chips */}
                {values.map((item, index) => (
                    // <>
                    <InputChip
                        key={index}
                        value={item}
                        handleRemoveItem={(e) => {
                            e?.stopPropagation()
                            handleRemoveItem(index)
                        }}
                    />
                    //   ,
                    // </>
                ))}
                {/* Search With Dropdown */}
                <Popover open={isOpened}>
                    <PopoverTrigger asChild>
                        <div className="z-50 h-fit min-w-fit max-w-full ">
                            <input
                                id={name}
                                name={name}
                                placeholder={placeholder || 'type here'}
                                value={searchValue}
                                type={type}
                                onKeyDown={handleKeyDown}
                                onFocus={(e) => e.preventDefault()}
                                onBlur={onBlur}
                                onChange={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setSearchValue(e.target.value)
                                }}
                                className="cursor-text border-none bg-transparent p-2 outline-none group-focus:bg-primary/10"
                            />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-72"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <button
                            className="relative flex w-full cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground "
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleAddNewItem()
                            }}
                        >
                            <p className=" font-medium">Add item</p>
                            <Plus className="size-4" />
                        </button>
                        <Separator className="mb-1" />
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((item, index) => (
                                <article
                                    onClick={() => handleSelected(item)}
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    key={index}
                                >
                                    {item}
                                </article>
                            ))
                        ) : (
                            <div className="px-2 py-1.5">Not found</div>
                        )}
                    </PopoverContent>
                </Popover>
            </div>
            {warning ? (
                <div className="mb-2 py-1 text-sm text-orange-700 dark:text-orange-400">
                    {warning}
                </div>
            ) : null}
        </div>
    )
}

export default SpecialSelectionInput
