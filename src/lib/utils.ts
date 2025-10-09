import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge conditional class names while applying Tailwind CSS conflict resolution.
 *
 * @param {...ClassValue[]} inputs One or more class name values supported by `clsx`.
 * @returns {string} Space-delimited class string with Tailwind precedence applied.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert an arbitrary string into a URL-safe slug.
 *
 * @param {string} input Source text (e.g., post title).
 * @returns {string} Lowercase slug truncated to 120 characters with hyphen separators.
 */
export function generateSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

/**
 * Format large numeric counts using compact notation (e.g., 1.2K, 3.4M).
 * Falls back to the raw number when the Intl implementation is unavailable.
 *
 * @param {number} value Numeric value to format.
 * @returns {string} Human readable string representation.
 */
export function formatCompactNumber(value: number) {
  if (!Number.isFinite(value)) {
    return '0'
  }

  try {
    const formatter = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    })
    return formatter.format(value)
  } catch (error) {
    console.warn('Unable to format number compactly', error)
    return String(value)
  }
}
