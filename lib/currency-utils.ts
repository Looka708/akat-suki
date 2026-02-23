/**
 * Formats a currency value with the appropriate symbol or code.
 * Supported: PKR, USD, EUR, GBP, INR.
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        // Add custom handling for PKR if the locale doesn't support it well
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    return formatter.format(amount);
}
