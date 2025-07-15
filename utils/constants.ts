const MAX_TOAST_NOTIFICATION_COUNT = 3 as const
const CONTENT_TYPE = [
    'application/json',
    'multipart/form-data',
    'application/x-www-form-urlencoded',
] as const // used content types
const unknownErr = 'Oops🥲! there was a server error, try later' as const //unknown error message
export { MAX_TOAST_NOTIFICATION_COUNT, unknownErr, CONTENT_TYPE }
