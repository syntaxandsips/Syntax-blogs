"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/neo-brutalism.css';

// Types for our blog posts
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  slug: string;
  date: string;
  publishDate: string;
  status: 'draft' | 'scheduled' | 'published';
  views: number;
  accent: string;
  author?: string; // Add author field to identify developer posts
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/me');
      return;
    }

    setIsAuthenticated(true);

    // Load posts from localStorage
    const savedPosts = localStorage.getItem('blogPosts');
    if (savedPosts) {
      // Filter to only show developer posts (posts without an author field or with author="Developer")
      const allPosts = JSON.parse(savedPosts);
      const developerPosts = allPosts.filter((post: BlogPost) =>
        !post.author || post.author === "Developer"
      );
      setPosts(developerPosts);
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/me');
  };

  const handleCreatePost = () => {
    router.push('/admin/create');
  };

  const handleEditPost = (id: string) => {
    router.push(`/admin/edit/${id}`);
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      // Get all posts from localStorage
      const savedPosts = localStorage.getItem('blogPosts');
      const allPosts = savedPosts ? JSON.parse(savedPosts) : [];

      // Remove the post from all posts
      const updatedAllPosts = allPosts.filter((post: BlogPost) => post.id !== id);

      // Update localStorage with all posts
      localStorage.setItem('blogPosts', JSON.stringify(updatedAllPosts));

      // Update state with only developer posts
      const developerPosts = updatedAllPosts.filter((post: BlogPost) =>
        !post.author || post.author === "Developer"
      );
      setPosts(developerPosts);
    }
  };

  const handlePublishPost = (id: string) => {
    // Get all posts from localStorage to update
    const savedPosts = localStorage.getItem('blogPosts');
    const allPosts = savedPosts ? JSON.parse(savedPosts) : [];

    // Update the specific post
    const updatedAllPosts = allPosts.map((post: BlogPost) => {
      if (post.id === id) {
        return {
          ...post,
          status: 'published' as const,
          publishDate: new Date().toISOString(),
          author: "Developer" // Mark as developer post
        };
      }
      return post;
    });

    // Update localStorage with all posts
    localStorage.setItem('blogPosts', JSON.stringify(updatedAllPosts));

    // Update state with only developer posts
    const developerPosts = updatedAllPosts.filter((post: BlogPost) =>
      !post.author || post.author === "Developer"
    );
    setPosts(developerPosts);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black p-4 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">SYNTAX AND SIPS</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/blogs" className="text-white font-medium hover:text-purple-300 transition-colors">Blogs</Link>
            <button
              type="button"
              onClick={handleLogout}
              className="py-2 px-4 border-2 border-white bg-black text-white font-bold hover:bg-red-600 hover:border-red-600 transition-all"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SyntaxBlogs Admin</h1>
          <p className="text-gray-600">Manage your blog posts and content</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`py-2 px-4 border-2 border-black font-bold transition-all ${
                activeTab === 'posts'
                  ? 'bg-purple-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              ALL POSTS
            </button>
            <button
              type="button"
              className={`py-2 px-4 border-2 border-black font-bold transition-all ${
                activeTab === 'drafts'
                  ? 'bg-purple-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('drafts')}
            >
              DRAFTS
            </button>
            <button
              type="button"
              className={`py-2 px-4 border-2 border-black font-bold transition-all ${
                activeTab === 'scheduled'
                  ? 'bg-purple-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('scheduled')}
            >
              SCHEDULED
            </button>
            <button
              type="button"
              className={`py-2 px-4 border-2 border-black font-bold transition-all ${
                activeTab === 'published'
                  ? 'bg-purple-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('published')}
            >
              PUBLISHED
            </button>
          </div>
          <button
            type="button"
            onClick={handleCreatePost}
            className="py-2 px-6 border-2 border-black bg-purple-500 text-white font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            CREATE NEW POST
          </button>
        </div>

        <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-black">
            {activeTab === 'posts' && 'All Posts'}
            {activeTab === 'drafts' && 'Draft Posts'}
            {activeTab === 'scheduled' && 'Scheduled Posts'}
            {activeTab === 'published' && 'Published Posts'}
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-lg text-gray-600 mb-4">No posts found</p>
              <button
                type="button"
                onClick={handleCreatePost}
                className="py-2 px-4 border-2 border-black bg-white font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                CREATE YOUR FIRST POST
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b-2 border-black font-bold">Title</th>
                    <th className="text-left p-3 border-b-2 border-black font-bold">Category</th>
                    <th className="text-left p-3 border-b-2 border-black font-bold">Status</th>
                    <th className="text-left p-3 border-b-2 border-black font-bold">Date</th>
                    <th className="text-left p-3 border-b-2 border-black font-bold">Views</th>
                    <th className="text-left p-3 border-b-2 border-black font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts
                    .filter(post => {
                      if (activeTab === 'posts') return true;
                      return post.status === activeTab;
                    })
                    .map(post => (
                      <tr key={post.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 font-medium">{post.title}</td>
                        <td className="p-3">
                          <span className="px-3 py-1 border-2 border-black text-xs font-bold">
                            {post.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 border-2 border-black text-xs font-bold ${
                            post.status === 'published' ? 'bg-green-100' :
                            post.status === 'scheduled' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            {post.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">{new Date(post.date).toLocaleDateString()}</td>
                        <td className="p-3">{post.views}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditPost(post.id)}
                              className="px-3 py-1 border-2 border-black bg-white font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            >
                              EDIT
                            </button>
                            {post.status !== 'published' && (
                              <button
                                type="button"
                                onClick={() => handlePublishPost(post.id)}
                                className="px-3 py-1 border-2 border-black bg-green-100 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                              >
                                PUBLISH
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id)}
                              className="px-3 py-1 border-2 border-black bg-red-100 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            >
                              DELETE
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
