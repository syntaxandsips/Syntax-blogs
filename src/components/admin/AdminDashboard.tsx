"use client"

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { PostsTable } from './PostsTable'
import { PostForm } from './PostForm'
import { StatsSection } from './StatsSection'
import { UserManagement } from './UserManagement'
import { CommentsModeration } from './CommentsModeration'
import { TaxonomyManager } from './TaxonomyManager'
import { createBrowserClient } from '@/lib/supabase/client'
import { Menu } from 'lucide-react'
import {
  AdminPost,
  AdminRole,
  AdminCommentSummary,
  AdminUserSummary,
  CreateAdminUserPayload,
  CommentStatus,
  CategoryOption,
  TagOption,
  PostFormValues,
  PostStatus,
  UpdateAdminUserPayload,
} from '@/utils/types'

interface AdminDashboardProps {
  profileId: string
  displayName: string
  isAdmin: boolean
}

interface FeedbackState {
  type: 'success' | 'error'
  message: string
}

export const AdminDashboard = ({
  profileId,
  displayName,
  isAdmin,
}: AdminDashboardProps) => {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(), [])
  const [currentView, setCurrentView] = useState<string>('overview')
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [tags, setTags] = useState<TagOption[]>([])
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshingPosts, setIsRefreshingPosts] = useState(false)
  const [isPostSaving, setIsPostSaving] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false)
  const [isUserMutationInFlight, setIsUserMutationInFlight] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [comments, setComments] = useState<AdminCommentSummary[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [hasLoadedComments, setHasLoadedComments] = useState(false)
  const [commentsFilter, setCommentsFilter] = useState<CommentStatus | 'all'>('all')

  const mapPostsFromPayload = useCallback((data: AdminPost[]) => {
    setPosts(
      data.map((post) => ({
        ...post,
        excerpt: post.excerpt ?? null,
        accentColor: post.accentColor ?? null,
        categoryId: post.categoryId ?? null,
        categoryName: post.categoryName ?? null,
        categorySlug: post.categorySlug ?? null,
        seoTitle: post.seoTitle ?? null,
        seoDescription: post.seoDescription ?? null,
        featuredImageUrl: post.featuredImageUrl ?? null,
        socialImageUrl: post.socialImageUrl ?? null,
        tags: post.tags ?? [],
        publishedAt: post.publishedAt ?? null,
        scheduledFor: post.scheduledFor ?? null,
        authorId: post.authorId ?? null,
        views: post.views ?? 0,
      })),
    )
  }, [])

  const fetchPosts = useCallback(async () => {
    setIsRefreshingPosts(true)

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'GET',
        cache: 'no-store',
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to load posts.')
      }

      mapPostsFromPayload(payload.posts as AdminPost[])
    } finally {
      setIsRefreshingPosts(false)
    }
  }, [mapPostsFromPayload])

  const loadInitialData = useCallback(async () => {
    setIsLoading(true)
    setFeedback(null)

    try {
      const [
        { data: categoriesData, error: categoryError },
        { data: tagsData, error: tagsError },
      ] = await Promise.all([
        supabase
          .from('categories')
          .select('id, name, slug')
          .order('name'),
        supabase
          .from('tags')
          .select('id, name, slug')
          .order('name'),
        fetchPosts().catch((error) => {
          throw error
        }),
      ])

      if (categoryError) {
        throw new Error(categoryError.message)
      }

      if (tagsError) {
        throw new Error(tagsError.message)
      }

      setCategories((categoriesData ?? []) as CategoryOption[])
      setTags((tagsData ?? []) as TagOption[])
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to load dashboard data.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [fetchPosts, supabase])

  useEffect(() => {
    void loadInitialData()
  }, [loadInitialData])

  const handleRefreshPosts = useCallback(async () => {
    setFeedback(null)

    try {
      await fetchPosts()
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to refresh posts.',
      })
    }
  }, [fetchPosts])

  const handleCreatePost = () => {
    setEditingPost(null)
    setCurrentView('post-form')
    setIsMobileSidebarOpen(false)
  }

  const handleEditPost = (post: AdminPost) => {
    setEditingPost(post)
    setCurrentView('post-form')
  }

  const handleSavePost = async (values: PostFormValues) => {
    setIsPostSaving(true)
    setFeedback(null)

    try {
      const endpoint = values.id
        ? `/api/admin/posts/${values.id}`
        : '/api/admin/posts'

      const payload = {
        ...values,
        authorId: values.authorId ?? profileId,
      }

      const response = await fetch(endpoint, {
        method: values.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error ?? 'Unable to save the post.')
      }

      setFeedback({
        type: 'success',
        message: values.id ? 'Post updated successfully.' : 'Post created successfully.',
      })
      setCurrentView('posts')
      setEditingPost(null)
      await fetchPosts()
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to save the post.',
      })
    } finally {
      setIsPostSaving(false)
    }
  }

  const refreshCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name')

    if (error) {
      throw new Error(error.message)
    }

    setCategories((data ?? []) as CategoryOption[])
  }, [supabase])

  const refreshTags = useCallback(async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, slug')
      .order('name')

    if (error) {
      throw new Error(error.message)
    }

    setTags((data ?? []) as TagOption[])
  }, [supabase])

  const normalizeSlug = useCallback(
    (value: string) =>
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-'),
    [],
  )

  const handleCreateCategory = useCallback(async (name: string, slug?: string) => {
    const sanitizedName = name.trim()
    const normalizedSlug = normalizeSlug(slug && slug.trim().length > 0 ? slug : sanitizedName)

    if (!sanitizedName || !normalizedSlug) {
      throw new Error('Category name and slug are required.')
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: sanitizedName, slug: normalizedSlug })
      .select('id, name, slug')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    setCategories((prev) => [data as CategoryOption, ...prev])
  }, [normalizeSlug, supabase])

  const handleUpdateCategory = useCallback(
    async (id: string, values: { name: string; slug: string }) => {
      const sanitizedName = values.name.trim()
      const normalizedSlug = normalizeSlug(values.slug)

      if (!sanitizedName || !normalizedSlug) {
        throw new Error('Category name and slug are required.')
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ name: sanitizedName, slug: normalizedSlug })
      .eq('id', id)
      .select('id, name, slug')
      .single()

    if (error) {
      throw new Error(error.message)
    }

      setCategories((prev) =>
        prev.map((category) => (category.id === id ? (data as CategoryOption) : category)),
      )
    },
    [normalizeSlug, supabase],
  )

  const handleDeleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    setCategories((prev) => prev.filter((category) => category.id !== id))
  }, [supabase])

  const handleCreateTag = useCallback(async (name: string, slug?: string) => {
    const sanitizedName = name.trim()
    const normalizedSlug = normalizeSlug(slug && slug.trim().length > 0 ? slug : sanitizedName)

    if (!sanitizedName || !normalizedSlug) {
      throw new Error('Tag name and slug are required.')
    }

    const { data, error } = await supabase
      .from('tags')
      .insert({ name: sanitizedName, slug: normalizedSlug })
      .select('id, name, slug')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    setTags((prev) => [data as TagOption, ...prev])
  }, [normalizeSlug, supabase])

  const handleUpdateTag = useCallback(
    async (id: string, values: { name: string; slug: string }) => {
      const sanitizedName = values.name.trim()
      const normalizedSlug = normalizeSlug(values.slug)

      if (!sanitizedName || !normalizedSlug) {
        throw new Error('Tag name and slug are required.')
    }

    const { data, error } = await supabase
      .from('tags')
      .update({ name: sanitizedName, slug: normalizedSlug })
      .eq('id', id)
      .select('id, name, slug')
      .single()

    if (error) {
      throw new Error(error.message)
    }

      setTags((prev) => prev.map((tag) => (tag.id === id ? (data as TagOption) : tag)))
    },
    [normalizeSlug, supabase],
  )

  const handleDeleteTag = useCallback(async (id: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    setTags((prev) => prev.filter((tag) => tag.id !== id))
  }, [supabase])

  const runTaxonomyAction = useCallback(
    async (operation: () => Promise<void>, successMessage: string) => {
      setFeedback(null)

      try {
        await operation()
        setFeedback({ type: 'success', message: successMessage })
        return true
      } catch (error) {
        setFeedback({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to update content taxonomy.',
        })
        return false
      }
    },
    [],
  )

  const requestCreateCategory = useCallback(
    (name: string, slug?: string) =>
      runTaxonomyAction(
        () => handleCreateCategory(name, slug),
        'Category created successfully.',
      ),
    [handleCreateCategory, runTaxonomyAction],
  )

  const requestUpdateCategory = useCallback(
    (id: string, values: { name: string; slug: string }) =>
      runTaxonomyAction(
        () => handleUpdateCategory(id, values),
        'Category updated successfully.',
      ),
    [handleUpdateCategory, runTaxonomyAction],
  )

  const requestDeleteCategory = useCallback(
    (id: string) =>
      runTaxonomyAction(() => handleDeleteCategory(id), 'Category deleted successfully.'),
    [handleDeleteCategory, runTaxonomyAction],
  )

  const requestCreateTag = useCallback(
    (name: string, slug?: string) =>
      runTaxonomyAction(() => handleCreateTag(name, slug), 'Tag created successfully.'),
    [handleCreateTag, runTaxonomyAction],
  )

  const requestUpdateTag = useCallback(
    (id: string, values: { name: string; slug: string }) =>
      runTaxonomyAction(() => handleUpdateTag(id, values), 'Tag updated successfully.'),
    [handleUpdateTag, runTaxonomyAction],
  )

  const requestDeleteTag = useCallback(
    (id: string) =>
      runTaxonomyAction(() => handleDeleteTag(id), 'Tag deleted successfully.'),
    [handleDeleteTag, runTaxonomyAction],
  )

  const requestRefreshCategories = useCallback(
    () => runTaxonomyAction(() => refreshCategories(), 'Categories refreshed.'),
    [refreshCategories, runTaxonomyAction],
  )

  const requestRefreshTags = useCallback(
    () => runTaxonomyAction(() => refreshTags(), 'Tags refreshed.'),
    [refreshTags, runTaxonomyAction],
  )

  const handleDeletePost = async (id: string) => {
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to delete the post.')
      }

      setFeedback({ type: 'success', message: 'Post deleted successfully.' })
      await fetchPosts()
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to delete the post.',
      })
    }
  }

  const handlePublishPost = async (id: string) => {
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: PostStatus.PUBLISHED,
          publishedAt: new Date().toISOString(),
          scheduledFor: null,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to publish the post.')
      }

      setFeedback({ type: 'success', message: 'Post published successfully.' })
      await fetchPosts()
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to publish the post.',
      })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/me')
  }

  const handleNavigate = (view: string) => {
    setCurrentView(view)
    setIsMobileSidebarOpen(false)
  }

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        cache: 'no-store',
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to load users.')
      }

      setUsers((payload.users ?? []) as AdminUserSummary[])
      setRoles((payload.roles ?? []) as AdminRole[])
      setHasLoadedUsers(true)
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to load users.',
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    if (currentView === 'users' && !hasLoadedUsers && !isLoadingUsers) {
      void fetchUsers()
    }
  }, [currentView, fetchUsers, hasLoadedUsers, isLoadingUsers])

  const fetchComments = useCallback(async () => {
    setIsLoadingComments(true)
    try {
      const response = await fetch('/api/admin/comments', {
        method: 'GET',
        cache: 'no-store',
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to load comments.')
      }

      setComments((payload.comments ?? []) as AdminCommentSummary[])
      setHasLoadedComments(true)
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to load comments.',
      })
    } finally {
      setIsLoadingComments(false)
    }
  }, [])

  useEffect(() => {
    if (currentView === 'comments' && !hasLoadedComments && !isLoadingComments) {
      void fetchComments()
    }
  }, [currentView, fetchComments, hasLoadedComments, isLoadingComments])

  const handleCreateUser = async (values: CreateAdminUserPayload) => {
    setIsUserMutationInFlight(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to create user.')
      }

      const createdUser = payload.user as AdminUserSummary

      setUsers((prev) => {
        const filtered = prev.filter((user) => user.profileId !== createdUser.profileId)
        return [createdUser, ...filtered]
      })

      setFeedback({
        type: 'success',
        message: 'User created successfully.',
      })
      return true
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to create user.',
      })
      return false
    } finally {
      setIsUserMutationInFlight(false)
    }
  }

  const handleUpdateUser = async (
    profileId: string,
    values: UpdateAdminUserPayload,
  ) => {
    setIsUserMutationInFlight(true)
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/users/${profileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to update user.')
      }

      const updatedUser = payload.user as AdminUserSummary

      setUsers((prev) => {
        const others = prev.filter((user) => user.profileId !== updatedUser.profileId)
        return [updatedUser, ...others]
      })

      setFeedback({
        type: 'success',
        message: 'User updated successfully.',
      })
      return true
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to update user.',
      })
      return false
    } finally {
      setIsUserMutationInFlight(false)
    }
  }

  const handleApproveComment = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: CommentStatus.APPROVED }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to approve comment.')
      }

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === id
            ? { ...comment, status: CommentStatus.APPROVED }
            : comment,
        ),
      )
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to approve comment.',
      })
    }
  }

  const handleRejectComment = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: CommentStatus.REJECTED }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to reject comment.')
      }

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === id
            ? { ...comment, status: CommentStatus.REJECTED }
            : comment,
        ),
      )
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to reject comment.',
      })
    }
  }

  const handleDeleteComment = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to delete comment.')
      }

      setComments((prev) => prev.filter((comment) => comment.id !== id))
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to delete comment.',
      })
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <>
            <h1 className="text-[#2A2A2A] text-3xl font-bold mb-8">
              Dashboard Overview
            </h1>
            <StatsSection posts={posts} />
            <div className="bg-white border-3 border-[#2A2A2A]/20 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </>
        )
      case 'posts':
        return (
          <>
            <h1 className="text-[#2A2A2A] text-3xl font-bold mb-8">
              Blog Posts
            </h1>
            <PostsTable
              posts={posts}
              isLoading={isRefreshingPosts}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onPublish={handlePublishPost}
              onRefresh={handleRefreshPosts}
            />
          </>
        )
      case 'post-form':
        return (
          <PostForm
            post={editingPost}
            categories={categories}
            tags={tags}
            onSave={handleSavePost}
            onCancel={() => setCurrentView('posts')}
            isSaving={isPostSaving}
          />
        )
      case 'taxonomy':
        return (
          <TaxonomyManager
            categories={categories}
            tags={tags}
            onCreateCategory={requestCreateCategory}
            onUpdateCategory={requestUpdateCategory}
            onDeleteCategory={requestDeleteCategory}
            onRefreshCategories={requestRefreshCategories}
            onCreateTag={requestCreateTag}
            onUpdateTag={requestUpdateTag}
            onDeleteTag={requestDeleteTag}
            onRefreshTags={requestRefreshTags}
          />
        )
      case 'users':
        return (
          <UserManagement
            users={users}
            roles={roles}
            isLoading={isLoadingUsers}
            isSaving={isUserMutationInFlight}
            onRefresh={fetchUsers}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
          />
        )
      case 'comments':
        return (
          <CommentsModeration
            comments={comments}
            isLoading={isLoadingComments}
            activeFilter={commentsFilter}
            onChangeFilter={setCommentsFilter}
            onRefresh={fetchComments}
            onApprove={handleApproveComment}
            onReject={handleRejectComment}
            onDelete={handleDeleteComment}
          />
        )
      case 'analytics':
        return (
          <>
            <h1 className="text-[#2A2A2A] text-3xl font-bold mb-8">
              Analytics
            </h1>
            <div className="bg-white border-3 border-[#2A2A2A]/20 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              <p className="text-gray-500">Analytics features coming soon...</p>
            </div>
          </>
        )
      case 'settings':
        return (
          <>
            <h1 className="text-[#2A2A2A] text-3xl font-bold mb-8">Settings</h1>
            <div className="bg-white border-3 border-[#2A2A2A]/20 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              <p className="text-gray-500">Settings features coming soon...</p>
            </div>
          </>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <p className="text-lg font-semibold">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen bg-[#f8f9fa]">
      <div className="hidden lg:flex">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          onCreatePost={handleCreatePost}
          onSignOut={handleSignOut}
          displayName={displayName}
          isAdmin={isAdmin}
        />
      </div>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            onCreatePost={handleCreatePost}
            onSignOut={handleSignOut}
            displayName={displayName}
            isAdmin={isAdmin}
            className="relative z-50 w-[min(85vw,320px)]"
            showCloseButton
            onClose={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[#2A2A2A]/10 bg-[#f8f9fa] px-4 py-4 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="inline-flex items-center justify-center rounded-md border-2 border-[#2A2A2A]/10 bg-white p-2 text-[#2A2A2A] shadow-sm"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#2A2A2A]/70">
              Admin Area
            </p>
            <h1 className="text-lg font-bold text-[#2A2A2A]">Dashboard</h1>
          </div>
          <div className="w-9" aria-hidden="true" />
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {feedback && (
              <div
                className={`rounded-md border-2 p-4 font-semibold ${
                  feedback.type === 'success'
                    ? 'border-green-500/30 bg-green-50 text-green-700'
                    : 'border-red-500/30 bg-red-50 text-red-700'
                }`}
              >
                {feedback.message}
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
