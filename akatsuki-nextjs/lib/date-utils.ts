/**
 * Formats a date string into a consistent YYYY-MM-DD format to avoid 
 * hydration mismatches between server and client locales.
 */
export function formatDate(dateString: string | Date): string {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

/**
 * Formats a date string into a consistent YYYY-MM-DD HH:mm format.
 */
export function formatDateTime(dateString: string | Date): string {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
}
