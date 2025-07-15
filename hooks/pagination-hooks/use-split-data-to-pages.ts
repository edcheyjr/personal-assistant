import { useEffect, useMemo, useState } from "react"

interface Props<T> {
  data: T[]
  pageSize: number
  currentPage: number
}

/**
 * Custom hook to split data into pages and manage loading state.
 *
 * @template T
 * @param {Object} props - The properties object.
 * @param {T[]} props.data - The array of data to be paginated.
 * @param {number} props.pageSize - The number of items per page.
 * @param {number} props.currentPage - The current page number (1-based index).
 * @returns {Object} An object containing the current page data and the loading state.
 * @returns {T[]} returns.pageData - The data for the current page.
 * @returns {boolean} returns.isLoading - The loading state indicating whether the page data is being loaded.
 *
 * @example
 * const { pageData, isLoading } = useSplitDataToPageData({ data: myDataArray, pageSize: 10, currentPage: 1 });
 */
export function useSplitDataToPageData<T>({
  data,
  pageSize,
  currentPage,
}: Props<T>): { pageData: T[]; isLoading: boolean } {
  const [isPageLoading, setPageIsLoading] = useState<boolean>(true)
  const [currentPageData, setCurrentPageData] = useState<T[]>([])

  const slicedArray = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return data.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, pageSize, data])

  useEffect(() => {
    if (slicedArray !== currentPageData) {
      setPageIsLoading(true)
      setCurrentPageData(slicedArray)
      setPageIsLoading(false)
    }
  }, [slicedArray, currentPageData])

  return { pageData: currentPageData, isLoading: isPageLoading }
}
