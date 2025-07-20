/**
 * Filters the elements of array 'a' to exclude those that are present in array 'b'.
 * This function uses a Set for better performance with large arrays.
 *
 * @param {T[]} a - The array to filter (source array).
 * @param {T[]} b - The array containing elements to exclude.
 * @returns {T[]} - A new array containing elements from 'a' that are not present in 'b'.
 */
export function filterArrayDifference<T>(a: T[], b: T[]): T[] {
    const excludeSet = new Set(b)
    return a.filter((item) => !excludeSet.has(item))
}
