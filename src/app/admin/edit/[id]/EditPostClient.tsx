"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/neo-brutalism.css';

// Categories for blog posts
const CATEGORIES = [
  { value: 'AI', label: 'Artificial Intelligence' },
  { value: 'DEEP_LEARNING', label: 'Deep Learning' },
  { value: 'MACHINE_LEARNING', label: 'Machine Learning' },
  { value: 'COMPUTER_VISION', label: 'Computer Vision' },
  { value: 'REINFORCEMENT_LEARNING', label: 'Reinforcement Learning' },
  { value: 'NLP', label: 'Natural Language Processing' },
];

// Accent colors for blog posts
const ACCENT_COLORS = [
  { value: 'accent-purple', label: 'Purple' },
  { value: 'accent-blue', label: 'Blue' },
  { value: 'accent-green', label: 'Green' },
  { value: 'accent-red', label: 'Red' },
  { value: 'accent-orange', label: 'Orange' },
];

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
}

interface EditPostClientProps {
  postId: string;
}

export default function EditPostClient({ postId }: EditPostClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('AI');
  const [accent, setAccent] = useState('accent-purple');
  const [publishType, setPublishType] = useState('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    setIsAuthenticated(true);
    
    // Load posts from localStorage
    const savedPosts = localStorage.getItem('blogPosts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const foundPost = posts.find((p: BlogPost) => p.id === postId);
      
      if (foundPost) {
        setPost(foundPost);
        setTitle(foundPost.title);
        setSlug(foundPost.slug);
        setExcerpt(foundPost.excerpt);
        setContent(foundPost.content);
        setCategory(foundPost.category);
        setAccent(foundPost.accent);
        setPublishType(foundPost.status);
        
        if (foundPost.status === 'scheduled' && foundPost.publishDate) {
          // Convert ISO date to local datetime format for input
          const date = new Date(foundPost.publishDate);
          const localDatetime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 16);
          setScheduledDate(localDatetime);
        }
      } else {
        router.push('/admin');
      }
    }
    
    setIsLoading(false);
  }, [router, postId]);

  // Generate slug from title if slug is empty
  useEffect(() => {
    if (title && !slug) {
      setSlug(title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      );
    }
  }, [title, slug]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!slug.trim()) newErrors.slug = 'Slug is required';
    if (!excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    if (publishType === 'scheduled' && !scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    // Update post object
    const updatedPost = {
      ...post,
      title,
      slug,
      excerpt,
      content,
      category,
      accent,
      status: publishType as 'draft' | 'scheduled' | 'published',
      publishDate: publishType === 'published' ? new Date().toISOString() : 
                  publishType === 'scheduled' ? new Date(scheduledDate).toISOString() : '',
    };
    
    // Get existing posts from localStorage
    const existingPostsJSON = localStorage.getItem('blogPosts');
    const existingPosts = existingPostsJSON ? JSON.parse(existingPostsJSON) : [];
    
    // Update post in array
    const updatedPosts = existingPosts.map((p: BlogPost) => 
      p.id === postId ? updatedPost : p
    );
    
    // Save back to localStorage
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
    
    setIsSaving(false);
    router.push('/admin');
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !post) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="neo-brutalism border-b border-black p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <button
            type="button"
            onClick={handleCancel}
            className="neo-button py-2 px-4"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <form onSubmit={handleSubmit} className="neo-container p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-black'}`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug</label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={`w-full px-3 py-2 border ${errors.slug ? 'border-red-500' : 'border-black'}`}
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              </div>
              
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium mb-1">Excerpt</label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border ${errors.excerpt ? 'border-red-500' : 'border-black'}`}
                />
                {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-black"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="accent" className="block text-sm font-medium mb-1">Accent Color</label>
                <select
                  id="accent"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="w-full px-3 py-2 border border-black"
                >
                  {ACCENT_COLORS.map((color) => (
                    <option key={color.value} value={color.value}>{color.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Publish Settings</label>
                <div className="space-y-2">
                  <div>
                    <input
                      type="radio"
                      id="draft"
                      name="publishType"
                      value="draft"
                      checked={publishType === 'draft'}
                      onChange={() => setPublishType('draft')}
                      className="mr-2"
                    />
                    <label htmlFor="draft">Save as Draft</label>
                  </div>
                  
                  <div>
                    <input
                      type="radio"
                      id="publish"
                      name="publishType"
                      value="published"
                      checked={publishType === 'published'}
                      onChange={() => setPublishType('published')}
                      className="mr-2"
                    />
                    <label htmlFor="publish">Publish Immediately</label>
                  </div>
                  
                  <div>
                    <input
                      type="radio"
                      id="schedule"
                      name="publishType"
                      value="scheduled"
                      checked={publishType === 'scheduled'}
                      onChange={() => setPublishType('scheduled')}
                      className="mr-2"
                    />
                    <label htmlFor="schedule">Schedule for Later</label>
                  </div>
                  
                  {publishType === 'scheduled' && (
                    <div className="pl-6 pt-2">
                      <label htmlFor="scheduledDate" className="block text-sm font-medium mb-1">Publication Date and Time</label>
                      <input
                        id="scheduledDate"
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className={`w-full px-3 py-2 border ${errors.scheduledDate ? 'border-red-500' : 'border-black'}`}
                        aria-describedby={errors.scheduledDate ? "scheduledDate-error" : undefined}
                      />
                      {errors.scheduledDate && (
                        <p id="scheduledDate-error" className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">Content</label>
                <p className="text-xs text-gray-500 mb-2">
                  Supports Markdown, code blocks, and YouTube embeds. Use {`{youtube:VIDEO_ID}`} for embeds.
                </p>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className={`w-full px-3 py-2 border ${errors.content ? 'border-red-500' : 'border-black'} font-mono`}
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="neo-button px-4 py-2"
            >
              {isSaving ? 'Saving...' : 'Update Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
