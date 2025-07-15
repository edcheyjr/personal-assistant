import { useState } from "react"

export function useCurrentPage(pageSize: number) {
  const [onPage, setOnPage] = useState<number>(1)
  const previousPage = pageSize * (onPage - 1)
  return { onPage, setOnPage, previousPage }
}
