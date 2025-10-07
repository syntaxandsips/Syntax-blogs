import { NextResponse } from 'next/server'
import {
  createServerComponentClient,
  createServiceRoleClient,
} from '@/lib/supabase/server-client'

const BUCKET_NAME = 'post-media'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

type ProfileRecord = {
  id: string
  is_admin: boolean
}

type StorageObject = {
  id: string | null
  name: string
  created_at: string | null
  metadata: { size?: number | null } | null
}

type ServiceClient = Awaited<ReturnType<typeof ensureBucket>>

const listAllFiles = async (client: ServiceClient) => {
  const queue = ['']
  const files: Array<{ record: StorageObject; path: string }> = []

  while (queue.length > 0) {
    const currentPrefix = queue.pop() as string
    const { data, error } = await client.storage.from(BUCKET_NAME).list(currentPrefix, {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    if (error) {
      throw new Error(`Unable to load media assets: ${error.message}`)
    }

    for (const item of data ?? []) {
      const record = item as StorageObject
      const fullPath = currentPrefix ? `${currentPrefix}/${record.name}` : record.name

      if (!record.id) {
        queue.push(fullPath)
        continue
      }

      files.push({ record, path: fullPath })
    }
  }

  return files
}

const ensureAdminProfile = async (): Promise<
  | { profile: ProfileRecord }
  | { response: NextResponse }
> => {
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return {
      response: NextResponse.json(
        { error: `Unable to load profile: ${error.message}` },
        { status: 500 },
      ),
    }
  }

  if (!profile || !profile.is_admin) {
    return {
      response: NextResponse.json(
        { error: 'Forbidden: admin access required.' },
        { status: 403 },
      ),
    }
  }

  return { profile: profile as ProfileRecord }
}

const ensureBucket = async () => {
  const serviceClient = createServiceRoleClient()
  const { data: bucket } = await serviceClient.storage.getBucket(BUCKET_NAME)

  if (!bucket) {
    const { error: bucketError } = await serviceClient.storage.createBucket(
      BUCKET_NAME,
      {
        public: true,
        fileSizeLimit: `${MAX_FILE_SIZE}`,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      },
    )

    if (bucketError) {
      throw new Error(`Unable to create media bucket: ${bucketError.message}`)
    }
  }

  return serviceClient
}

export async function GET() {
  const result = await ensureAdminProfile()
  if ('response' in result) {
    return result.response
  }

  let serviceClient
  try {
    serviceClient = await ensureBucket()
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to prepare media storage.',
      },
      { status: 500 },
    )
  }

  let fileEntries: Array<{ record: StorageObject; path: string }>
  try {
    fileEntries = await listAllFiles(serviceClient)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load media assets.',
      },
      { status: 500 },
    )
  }

  const assets = fileEntries
    .map(({ record, path }) => {
      const {
        data: publicUrlData,
      } = serviceClient.storage.from(BUCKET_NAME).getPublicUrl(path)

      return {
        id: path,
        name: record.name,
        url: publicUrlData.publicUrl,
        createdAt: record.created_at ?? new Date().toISOString(),
        size: record.metadata?.size ?? 0,
      }
    })
    .sort((a, b) => {
      const getTime = (value: string | null | undefined) =>
        value ? new Date(value).getTime() : 0
      return getTime(b.createdAt) - getTime(a.createdAt)
    })

  return NextResponse.json({ assets })
}

export async function POST(request: Request) {
  const result = await ensureAdminProfile()
  if ('response' in result) {
    return result.response
  }

  let serviceClient
  try {
    serviceClient = await ensureBucket()
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to prepare media storage.',
      },
      { status: 500 },
    )
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'A valid image file is required.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File exceeds the 5 MB upload limit.' },
      { status: 413 },
    )
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Please upload a PNG, JPG, GIF, SVG, or WebP image.' },
      { status: 415 },
    )
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'image'
  const timestamp = Date.now()
  const uniqueId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${timestamp}`
  const filePath = `${new Date().toISOString().split('T')[0]}/${uniqueId}-${safeName}`

  const { error } = await serviceClient.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      contentType: file.type || undefined,
      upsert: false,
    })

  if (error) {
    return NextResponse.json(
      { error: `Unable to upload image: ${error.message}` },
      { status: 400 },
    )
  }

  const {
    data: { publicUrl },
  } = serviceClient.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  const asset = {
    id: filePath,
    name: safeName,
    url: publicUrl,
    createdAt: new Date().toISOString(),
    size: file.size,
  }

  return NextResponse.json({ asset }, { status: 201 })
}

export async function DELETE(request: Request) {
  const result = await ensureAdminProfile()
  if ('response' in result) {
    return result.response
  }

  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'File path is required.' }, { status: 400 })
  }

  let serviceClient
  try {
    serviceClient = await ensureBucket()
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to prepare media storage.',
      },
      { status: 500 },
    )
  }

  const { error } = await serviceClient.storage.from(BUCKET_NAME).remove([path])

  if (error) {
    return NextResponse.json(
      { error: `Unable to delete image: ${error.message}` },
      { status: 400 },
    )
  }

  return NextResponse.json({ success: true })
}
