import React from "react"

import { usePagination } from "@/lib/hooks/pagination-hooks/use-pagination"

import Button from "./Button"
import Pill from "./Pill"

type Props = {
  onPageChange: (currentPage: number) => void
  totalCount: number
  siblingCount?: number
  currentPage: number
  pageSize: number
}

export default function Pagination(props: Props) {
  const {
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage = 1,
    pageSize,
  } = props
  const paginationRange = usePagination({
    totalCount,
    pageSize,
    siblingCount,
    currentPage,
  })
  // If there are less than 2 itemss in pagination range we shall not render the component
  if (currentPage === 0 || paginationRange?.length < 2) {
    return null
  }
  const onNext = () => {
    onPageChange(currentPage + 1)
  }

  const onPrevious = () => {
    onPageChange(currentPage - 1)
  }
  const lastPage = paginationRange[paginationRange.length - 1] //find last page
  return (
    <div className="">
      <div className="flex items-center justify-center space-x-2.5">
        <Button handleClick={onPrevious} disable={currentPage == 1} />
        <div></div>
        {paginationRange.map((item) => (
          <Pill
            key={item}
            isActive={item == currentPage}
            index={item ? item : " "}
            handleClick={(index) => {
              typeof index == "number" && onPageChange(index)
            }}
          />
        ))}
        <div></div>
        <Button
          isRight
          handleClick={onNext}
          disable={lastPage == currentPage}
        />
      </div>
    </div>
  )
}
