import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { PostsTable } from './PostsTable'
import { PostForm } from './PostForm'
import { StatsSection } from './StatsSection'
import { useLocalStorage } from '../../utils/useLocalStorage'
import { Post, PostStatus } from '../../utils/types'

export const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState<string>('overview')
  const [posts, setPosts] = useLocalStorage<Post[]>('blogPosts', [])
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const handleCreatePost = () => {
    setEditingPost(null)
    setCurrentView('post-form')
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setCurrentView('post-form')
  }

  const handleSavePost = (post: Post) => {
    const isNew = !post.id
    if (isNew) {
      const newPost = {
        ...post,
        id: Date.now().toString(),
        views: 0,
        createdAt: new Date().toISOString(),
      }
      setPosts([...posts, newPost])
    } else {
      setPosts(
        posts.map((p) =>
          p.id === post.id
            ? {
                ...post,
              }
            : p,
        ),
      )
    }
    setCurrentView('posts')
  }

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter((post) => post.id !== id))
  }

  const handlePublishPost = (id: string) => {
    setPosts(
      posts.map((post) =>
        post.id === id
          ? {
              ...post,
              status: PostStatus.PUBLISHED,
              publishedAt: new Date().toISOString(),
            }
          : post,
      ),
    )
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
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onPublish={handlePublishPost}
            />
          </>
        )
      case 'post-form':
        return (
          <PostForm
            post={editingPost}
            onSave={handleSavePost}
            onCancel={() => setCurrentView('posts')}
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa]">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onCreatePost={handleCreatePost}
      />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  )
}
