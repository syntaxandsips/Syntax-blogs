export const PROFILE_PHOTOS_BUCKET = 'profile-photos'

export const ALLOWED_PROFILE_PHOTO_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

export const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024

export const getObjectPathFromPublicUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/')
    const bucketIndex = segments.findIndex((segment) => segment === PROFILE_PHOTOS_BUCKET)

    if (bucketIndex === -1) {
      return null
    }

    return segments.slice(bucketIndex + 1).join('/')
  } catch (error) {
    console.error('Failed to derive storage path from url', error)
    return null
  }
}
