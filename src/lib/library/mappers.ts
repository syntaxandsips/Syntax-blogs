type Nullable<T> = T | null
type Maybe<T> = T | null | undefined

export const mapUserList = (record: {
  id: string
  profile_id: string
  title: string
  description: Nullable<string>
  slug: string
  is_public: boolean
  cover_image_url: Nullable<string>
  item_count: number
  created_at: string
  updated_at: string
}) => ({
  id: record.id,
  profileId: record.profile_id,
  title: record.title,
  description: record.description ?? null,
  slug: record.slug,
  isPublic: record.is_public,
  coverImageUrl: record.cover_image_url ?? null,
  itemCount: record.item_count,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
})

export const mapListItem = (record: {
  id: string
  list_id: string
  post_id: string
  note: Nullable<string>
  position: number
  added_at: string
  posts?:
    | {
        id: Maybe<string>
        title: Maybe<string>
        slug: Maybe<string>
        excerpt: Maybe<string>
        featured_image_url: Maybe<string>
      }
    | {
        id: Maybe<string>
        title: Maybe<string>
        slug: Maybe<string>
        excerpt: Maybe<string>
        featured_image_url: Maybe<string>
      }[]
    | null
}) => ({
  id: record.id,
  listId: record.list_id,
  postId: record.post_id,
  ...(() => {
    const post = Array.isArray(record.posts) ? record.posts[0] ?? null : record.posts ?? null
    return {
      postTitle: post?.title ?? 'Untitled',
      postSlug: post?.slug ?? '',
      postExcerpt: post?.excerpt ?? null,
      postCoverImage: post?.featured_image_url ?? null,
    }
  })(),
  note: record.note ?? null,
  position: record.position,
  addedAt: record.added_at,
})

export const mapSavedList = (record: {
  id: string
  profile_id: string
  list_id: string
  saved_at: string
  user_lists?:
    | {
        title: Maybe<string>
        description: Maybe<string>
        item_count: Maybe<number>
        profiles?:
          | {
              display_name: Maybe<string>
            }
          | {
              display_name: Maybe<string>
            }[]
          | null
      }
    | {
        title: Maybe<string>
        description: Maybe<string>
        item_count: Maybe<number>
        profiles?:
          | {
              display_name: Maybe<string>
            }
          | {
              display_name: Maybe<string>
            }[]
          | null
      }[]
    | null
}) => ({
  id: record.id,
  profileId: record.profile_id,
  listId: record.list_id,
  ...(() => {
    const list = Array.isArray(record.user_lists) ? record.user_lists[0] ?? null : record.user_lists ?? null
    const profile = Array.isArray(list?.profiles) ? list?.profiles[0] ?? null : list?.profiles ?? null
    return {
      listTitle: list?.title ?? 'Untitled list',
      listDescription: list?.description ?? null,
      listOwnerName: profile?.display_name ?? 'Community curator',
      listItemCount: list?.item_count ?? 0,
    }
  })(),
  savedAt: record.saved_at,
})

export const mapHighlight = (record: {
  id: string
  profile_id: string
  post_id: string
  highlighted_text: string
  note: Nullable<string>
  color: string
  position_start: number
  position_end: number
  is_public: boolean
  created_at: string
  updated_at: string
  posts?:
    | {
        title: Maybe<string>
        slug: Maybe<string>
      }
    | {
        title: Maybe<string>
        slug: Maybe<string>
      }[]
    | null
}) => ({
  id: record.id,
  profileId: record.profile_id,
  postId: record.post_id,
  ...(() => {
    const post = Array.isArray(record.posts) ? record.posts[0] ?? null : record.posts ?? null
    return {
      postTitle: post?.title ?? 'Untitled post',
      postSlug: post?.slug ?? '',
    }
  })(),
  highlightedText: record.highlighted_text,
  note: record.note ?? null,
  color: record.color,
  positionStart: record.position_start,
  positionEnd: record.position_end,
  isPublic: record.is_public,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
})

export const mapReadingHistory = (record: {
  id: string
  profile_id: string
  post_id: string
  read_at: string
  read_duration_seconds: Nullable<number>
  scroll_percentage: Nullable<number>
  completed: boolean
  last_position: number
  created_at: string
  updated_at: string
  posts?:
    | {
        title: Maybe<string>
        slug: Maybe<string>
        excerpt: Maybe<string>
        featured_image_url: Maybe<string>
      }
    | {
        title: Maybe<string>
        slug: Maybe<string>
        excerpt: Maybe<string>
        featured_image_url: Maybe<string>
      }[]
    | null
}) => ({
  id: record.id,
  profileId: record.profile_id,
  postId: record.post_id,
  ...(() => {
    const post = Array.isArray(record.posts) ? record.posts[0] ?? null : record.posts ?? null
    return {
      postTitle: post?.title ?? 'Untitled post',
      postSlug: post?.slug ?? '',
      postExcerpt: post?.excerpt ?? null,
      postCoverImage: post?.featured_image_url ?? null,
    }
  })(),
  readAt: record.read_at,
  readDurationSeconds: record.read_duration_seconds ?? null,
  scrollPercentage: record.scroll_percentage ?? null,
  completed: record.completed,
  lastPosition: record.last_position,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
})

export const mapBookmark = (record: {
  id: string
  profile_id: string
  post_id: string
  created_at: string
  posts?:
    | {
        title: Maybe<string>
        slug: Maybe<string>
        excerpt: Maybe<string>
        featured_image_url: Maybe<string>
      }
    | {
        title: Maybe<string>
        slug: Maybe<string>
        excerpt: Maybe<string>
        featured_image_url: Maybe<string>
      }[]
    | null
}) => ({
  id: record.id,
  profileId: record.profile_id,
  postId: record.post_id,
  ...(() => {
    const post = Array.isArray(record.posts) ? record.posts[0] ?? null : record.posts ?? null
    return {
      postTitle: post?.title ?? 'Untitled post',
      postSlug: post?.slug ?? '',
      postExcerpt: post?.excerpt ?? null,
      postCoverImage: post?.featured_image_url ?? null,
    }
  })(),
  createdAt: record.created_at,
})
