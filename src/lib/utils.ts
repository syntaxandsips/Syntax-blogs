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
