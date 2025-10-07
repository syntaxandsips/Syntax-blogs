import { NextRequest, NextResponse } from 'next/server'

import {
  ALLOWED_PROFILE_PHOTO_MIME_TYPES,
  MAX_PROFILE_PHOTO_SIZE,
  PROFILE_PHOTOS_BUCKET,
  getObjectPathFromPublicUrl,
} from '@/lib/storage/profile-photos'
import {
  createServerComponentClient,
  createServiceRoleClient,
} from '@/lib/supabase/server-client'

const deriveOwnedObjectPath = (objectPath: string | null, userId: string): string | null => {
  if (!objectPath) {
    return null
  }

  const trimmed = objectPath.trim().replace(/^\/+/, '')
  if (!trimmed) {
    return null
  }

  const segments = trimmed.split('/')
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    return null
  }

  const [ownerId, ...rest] = segments

  if (ownerId !== userId || rest.length === 0) {
    return null
  }

  return [ownerId, ...rest].join('/')
}

const ensureProfilePhotosBucket = async () => {
  const serviceClient = createServiceRoleClient()
  const { data: bucket, error } = await serviceClient.storage.getBucket(PROFILE_PHOTOS_BUCKET)

  if (error) {
    throw new Error(`Unable to inspect avatar bucket: ${error.message}`)
  }

  if (!bucket) {
    const { error: createError } = await serviceClient.storage.createBucket(PROFILE_PHOTOS_BUCKET, {
      public: true,
      fileSizeLimit: `${MAX_PROFILE_PHOTO_SIZE}`,
      allowedMimeTypes: ALLOWED_PROFILE_PHOTO_MIME_TYPES,
    })

    if (createError) {
      throw new Error(`Unable to create avatar bucket: ${createError.message}`)
    }
  } else {
    const { error: updateError } = await serviceClient.storage.updateBucket(PROFILE_PHOTOS_BUCKET, {
      public: true,
      fileSizeLimit: `${MAX_PROFILE_PHOTO_SIZE}`,
      allowedMimeTypes: ALLOWED_PROFILE_PHOTO_MIME_TYPES,
    })

    if (updateError) {
      throw new Error(`Unable to update avatar bucket: ${updateError.message}`)
    }
  }

  return serviceClient
}

const validateFile = (file: File | null): file is File => {
  if (!file) {
    throw new Error('No file provided.')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (PNG, JPG, GIF, SVG, or WebP).')
  }

  if (!ALLOWED_PROFILE_PHOTO_MIME_TYPES.includes(file.type)) {
    throw new Error('Unsupported image format. Please choose PNG, JPG, GIF, SVG, or WebP.')
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    throw new Error('Image is larger than 5MB. Choose a smaller file.')
  }

  return true
}

const resolveUser = async () => {
  const supabase = createServerComponentClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(`Unable to verify authentication: ${error.message}`)
  }

  if (!user) {
    throw new Error('Unauthorized')
  }

  return { supabase, user }
}

export async function POST(request: NextRequest) {
  let supabase, user
  try {
    ;({ supabase, user } = await resolveUser())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch (error) {
    console.error('Failed to read avatar upload payload', error)
    return NextResponse.json({ error: 'Unable to process upload.' }, { status: 400 })
  }

  const fileEntry = formData.get('file')
  const candidateFile = fileEntry instanceof File ? fileEntry : null

  try {
    validateFile(candidateFile)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid upload.' },
      { status: 400 },
    )
  }

  if (!candidateFile) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }

  const file = candidateFile

  let serviceClient
  try {
    serviceClient = await ensureProfilePhotosBucket()
  } catch (error) {
    console.error('Failed to prepare avatar bucket', error)
    return NextResponse.json(
      { error: 'Unable to prepare storage for profile photos. Please try again later.' },
      { status: 500 },
    )
  }

  const extension =
    file.name?.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const objectPath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

  const { error: uploadError } = await serviceClient.storage.from(PROFILE_PHOTOS_BUCKET).upload(objectPath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'application/octet-stream',
  })

  if (uploadError) {
    console.error('Failed to upload avatar to storage', uploadError)
    return NextResponse.json(
      { error: 'Unable to upload profile photo. Please try again.' },
      { status: 500 },
    )
  }

  let existingAvatarPath: string | null = null
  const {
    data: existingProfile,
    error: existingProfileError,
  } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingProfileError) {
    console.error('Failed to fetch existing profile for avatar cleanup', existingProfileError)
  } else if (existingProfile?.avatar_url) {
    const derivedPath = getObjectPathFromPublicUrl(existingProfile.avatar_url)
    existingAvatarPath = deriveOwnedObjectPath(derivedPath, user.id)
  }

  if (existingAvatarPath && existingAvatarPath !== objectPath) {
    const { error: removeError } = await serviceClient.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .remove([existingAvatarPath])

    if (removeError) {
      console.warn('Failed to remove previous avatar', removeError)
    }
  }

  const {
    data: { publicUrl },
  } = serviceClient.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(objectPath)

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('user_id', user.id)

  if (profileError) {
    console.error('Failed to update profile with new avatar', profileError)
    return NextResponse.json(
      { error: 'Profile updated partially. Please refresh and try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ avatarUrl: publicUrl })
}

export async function DELETE(request: NextRequest) {
  let supabase, user
  try {
    ;({ supabase, user } = await resolveUser())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }

  let payload: { avatarUrl?: unknown }
  try {
    payload = await request.json()
  } catch (error) {
    console.error('Failed to read avatar removal payload', error)
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 })
  }

  const avatarUrl = typeof payload.avatarUrl === 'string' ? payload.avatarUrl : null
  const requestedObjectPath = deriveOwnedObjectPath(
    avatarUrl ? getObjectPathFromPublicUrl(avatarUrl) : null,
    user.id,
  )

  const {
    data: profile,
    error: profileLookupError,
  } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileLookupError) {
    console.error('Failed to load profile before avatar removal', profileLookupError)
    return NextResponse.json(
      { error: 'Unable to verify current profile photo. Please try again later.' },
      { status: 500 },
    )
  }

  const storedObjectPath = deriveOwnedObjectPath(
    profile?.avatar_url ? getObjectPathFromPublicUrl(profile.avatar_url) : null,
    user.id,
  )

  let serviceClient
  if (storedObjectPath) {
    if (requestedObjectPath && requestedObjectPath !== storedObjectPath) {
      console.warn('Ignoring mismatched avatar removal request', {
        requestedObjectPath,
        storedObjectPath,
        userId: user.id,
      })
    }

    try {
      serviceClient = await ensureProfilePhotosBucket()
    } catch (error) {
      console.error('Failed to prepare avatar bucket for removal', error)
      return NextResponse.json(
        { error: 'Unable to prepare storage for profile photos. Please try again later.' },
        { status: 500 },
      )
    }

    const { error } = await serviceClient.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .remove([storedObjectPath])
    if (error) {
      console.warn('Failed to remove avatar from storage', error)
    }
  } else if (requestedObjectPath) {
    console.warn('Ignoring avatar removal request without stored object path', {
      requestedObjectPath,
      userId: user.id,
    })
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('user_id', user.id)

  if (profileError) {
    console.error('Failed to clear avatar url on profile', profileError)
    return NextResponse.json(
      { error: 'Unable to update profile. Please refresh and try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
