import { useEffect, useState } from "react"

/**
 * Paginate sibling base on screen size
 * -----------------------------------
 *_____________________
 * if we need to increase siblings count for every page differently NB:onot recommending we can open this for
 * modification {add a param to modify default siblings count or return a function that sets that}
 *
 *______________________________
 *
 * @returns {number} siblings count
 */
export function usePaginationSiblings() {
  const [siblingCount, setSiblingCount] = useState<number>(1)
  // setting siblings count based on screen size
  useEffect(() => {
    if (window != undefined) {
      if (window.innerWidth <= 640) {
        setSiblingCount(0)
      }
    }
  }, [])
  return siblingCount
}
