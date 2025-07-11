const getAPIBaseURL = () => {
    let apiUrl: string | undefined = ''
    if (process.env.NODE_ENV === 'development') {
        apiUrl = process.env.NEXT_PUBLIC_DEV_BASE_URL
    } else if (process.env.NODE_ENV === 'production') {
        apiUrl = process.env.NEXT_PUBLIC_PRODUCTION_BASE_URL
    }
    if (!apiUrl) {
        throw new Error('[DEV|PROD]_BASE_URL is not defined')
    }

    return apiUrl
}

export { getAPIBaseURL }
