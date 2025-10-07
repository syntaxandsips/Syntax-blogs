import { createServiceRoleClient } from '@/lib/supabase/server-client'

export interface PostComment {
  id: string
  content: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
  author: {
    id: string | null
    displayName: string | null
    avatarUrl: string | null
  }
}

interface CommentRecord {
  id: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  author: {
    id: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
}

export const getApprovedCommentsForPost = async (postId: string): Promise<PostComment[]> => {
  const supabase = createServiceRoleClient()

  try {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `id, content, status, created_at, author:author_profile_id (id, display_name, avatar_url)`,
      )
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    const rows = (data ?? []) as CommentRecord[]

    return rows.map((row) => ({
      id: row.id,
      content: row.content,
      status: row.status,
      createdAt: row.created_at,
      author: {
        id: row.author?.id ?? null,
        displayName: row.author?.display_name ?? null,
        avatarUrl: row.author?.avatar_url ?? null,
      },
    }))
  } catch (error) {
    console.error('Unable to load comments for post', postId, error)
    return []
  }
}
