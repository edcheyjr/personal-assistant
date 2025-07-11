/**
 * get objects item from localStorage
 * ___________________________
 *
 * @param {string} key item key
 * __________________________
 *
 * @returns {T} results
 */
export const getStorageItem = <T extends object | Array<T> | string | number>(
    key: string
): T | undefined => {
    if (typeof window === 'undefined') {
        // Handle server-side rendering or static site generation
        return undefined
    }

    try {
        const storageItem = localStorage.getItem(key)

        if (storageItem) {
            // Handle string or number cases
            if (typeof storageItem === 'string') {
                return storageItem as any
            } else if (typeof storageItem === 'number') {
                return storageItem
            } else {
                try {
                    return JSON.parse(storageItem)
                } catch (parseError) {
                    console.error(
                        'Error parsing JSON from localStorage:',
                        parseError
                    )
                    return undefined
                }
            }
        } else {
            if (process.env.APP_ENV !== 'production') {
                throw new Error(
                    'failed to parse object is either null or undefined'
                )
            }
            console.warn(`no item with ${key} currently`)
        }
    } catch (error: any) {
        if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
        } else {
            console.error('An unknown error occurred:', error)
        }
    }
}

/**
 * setting the localstorage with data
 * ________________________________
 *
 * @param {string} name key
 * @param {T} item item to be stored
 *  */
export const setStorageItem = <T>(name: string, item: T) => {
    localStorage.setItem(name, JSON.stringify(item))
}

interface ItemWithExpiry<T> {
    /** data being stored */
    item: T
    /**expiry time */
    expiry: number
}

/**
 *  setting the localstorage with data with expiry date
 * @param {string} name key
 * @param {T} item item to be stored
 * @param {number} ttl time in millisec to add
 */
export function setStorageItemWithExpiry<T>(
    name: string,
    item: T,
    ttl: number
) {
    const now = new Date()

    // `item` is an object which contains the original item
    // as well as the time when it's supposed to expire
    const value = {
        item: item,
        expiry: now.getTime() + ttl,
    } as ItemWithExpiry<T>
    localStorage.setItem(name, JSON.stringify(value))
}

export function getStorageItemWithExpiry<T>(
    name: string
): T | null | undefined {
    if (typeof window === 'undefined') {
        // Handle server-side rendering or static site generation
        return undefined
    }

    const itemStr = localStorage.getItem(name)
    // if the item doesn't exist, return null
    if (!itemStr) {
        return null
    }
    const item = JSON.parse(itemStr) as ItemWithExpiry<T>
    const now = new Date()
    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
        // If the item is expired, delete the item from storage
        // and return null
        localStorage.removeItem(name)
        return item.item
    }
    return item.item
}

// remove item from localstorage
export function removeItemFromStorage(name: string) {
    localStorage.removeItem(name)
    return null
}
