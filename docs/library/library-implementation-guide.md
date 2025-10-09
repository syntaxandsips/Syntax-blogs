# Library Feature - Implementation Guide

## 🚀 Quick Start

This guide provides step-by-step instructions for implementing the library feature in Syntax & Sips.

## Prerequisites

- Supabase CLI installed and authenticated
- Node.js 18+ and npm
- Access to the Supabase project
- Development environment set up

## Implementation Steps

### Step 1: Database Migration

1. **Create the migration file**:
   ```bash
   # The migration file is already prepared at:
   # supabase/migrations/0015_create_user_library_schema.sql
   ```

2. **Review the migration**:
   - Check `docs/library-technical-spec.md` for the complete schema
   - Verify all tables, indexes, and RLS policies

3. **Apply the migration**:
   ```bash
   # Push to Supabase
   supabase db push
   
   # Or reset and reapply all migrations
   supabase db reset --force
   ```

4. **Verify the migration**:
   ```bash
   # Check tables were created
   supabase db diff
   ```

### Step 2: TypeScript Types

1. **Add types to `src/utils/types.ts`**:
   - Copy types from `docs/library-technical-spec.md`
   - Add to the end of the existing types file

2. **Create validation schemas**:
   ```bash
   # Create new file
   mkdir -p src/lib/library
   touch src/lib/library/validation.ts
   ```

3. **Add Zod schemas**:
   ```typescript
   // src/lib/library/validation.ts
   import { z } from 'zod'
   
   export const createListSchema = z.object({
     title: z.string().min(1).max(200),
     description: z.string().max(1000).optional(),
     slug: z.string().min(1).max(200),
     isPublic: z.boolean().default(false),
     coverImageUrl: z.string().url().optional(),
   })
   
   export const addListItemSchema = z.object({
     postId: z.string().uuid(),
     note: z.string().max(500).optional(),
     position: z.number().int().min(0).default(0),
   })
   
   export const createHighlightSchema = z.object({
     postId: z.string().uuid(),
     highlightedText: z.string().min(1).max(5000),
     note: z.string().max(1000).optional(),
     color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFEB3B'),
     positionStart: z.number().int().min(0),
     positionEnd: z.number().int().min(1),
     isPublic: z.boolean().default(false),
   })
   
   export const recordReadingSchema = z.object({
     postId: z.string().uuid(),
     readDurationSeconds: z.number().int().min(0).optional(),
     scrollPercentage: z.number().int().min(0).max(100).optional(),
     completed: z.boolean().default(false),
     lastPosition: z.number().int().min(0).default(0),
   })
   ```

### Step 3: API Routes

Create the following API route structure:

```
src/app/api/library/
├── lists/
│   ├── route.ts                    # GET, POST
│   ├── [id]/
│   │   ├── route.ts                # GET, PATCH, DELETE
│   │   └── items/
│   │       ├── route.ts            # GET, POST
│   │       └── [itemId]/
│   │           └── route.ts        # PATCH, DELETE
├── saved-lists/
│   ├── route.ts                    # GET, POST
│   └── [id]/
│       └── route.ts                # DELETE
├── highlights/
│   ├── route.ts                    # GET, POST
│   └── [id]/
│       └── route.ts                # PATCH, DELETE
├── history/
│   ├── route.ts                    # GET, POST
│   └── [id]/
│       └── route.ts                # DELETE
└── bookmarks/
    ├── route.ts                    # GET, POST
    └── [id]/
        └── route.ts                # DELETE
```

### Step 4: Frontend Routes

1. **Update `/me` route**:
   ```bash
   # Edit src/app/me/page.tsx
   # Change from admin redirect to library dashboard
   ```

2. **Create sub-routes**:
   ```bash
   mkdir -p src/app/me/lists
   mkdir -p src/app/me/saved-lists
   mkdir -p src/app/me/highlights
   mkdir -p src/app/me/history
   mkdir -p src/app/me/responses
   mkdir -p src/app/me/accounts
   ```

3. **Create page files**:
   ```bash
   touch src/app/me/lists/page.tsx
   touch src/app/me/saved-lists/page.tsx
   touch src/app/me/highlights/page.tsx
   touch src/app/me/history/page.tsx
   touch src/app/me/responses/page.tsx
   ```

### Step 5: UI Components

Create components in `src/components/library/`:

```bash
mkdir -p src/components/library
touch src/components/library/LibraryDashboard.tsx
touch src/components/library/ListsManager.tsx
touch src/components/library/ListDetailView.tsx
touch src/components/library/HighlightsViewer.tsx
touch src/components/library/ReadingHistory.tsx
touch src/components/library/ResponsesPanel.tsx
touch src/components/library/BookmarkButton.tsx
touch src/components/library/HighlightSelector.tsx
```

### Step 6: Integration

1. **Add bookmark button to posts**:
   - Update post detail page
   - Add floating bookmark button
   - Connect to bookmarks API

2. **Add highlight functionality**:
   - Implement text selection handler
   - Create highlight popup
   - Save highlights to API

3. **Track reading history**:
   - Add scroll tracking
   - Record reading time
   - Update history on page unload

#### Blog Post Experience Wiring

- File: `src/app/blogs/[slug]/NewBlogPostClient.tsx`
- Wrap the markdown renderer with `HighlightSelector` when the reader is authenticated to enable inline saves.
- Render the `BookmarkButton` beside the summarize action and hydrate it with the user's existing bookmark state.
- Initialise the reading tracker by
  - Fetching the latest bookmark and reading history entry via `/api/library/bookmarks` and `/api/library/history`.
  - Tracking scroll percentage and time-on-page with debounced flushes to `/api/library/history`.
  - Using `navigator.sendBeacon` as a fallback during `beforeunload` to guarantee persistence.
- Display call-to-action banners for unauthenticated readers prompting a sign in flow using the neo-brutalist design tokens (border-4, bold fills, hard shadows).
- Handle error feedback with accessible alerts (`aria-live="polite"`) so assistive tech announces sync issues.

### Step 7: Testing

1. **Create test files**:
   ```bash
   mkdir -p tests/library
   touch tests/library/lists.spec.ts
   touch tests/library/highlights.spec.ts
   touch tests/library/history.spec.ts
   ```

2. **Run tests**:
   ```bash
   npm run test
   npm run test:ui
   ```

## Component Examples

### LibraryDashboard Component

```typescript
'use client'

import { useEffect, useState } from 'react'
import { BookmarkIcon, ListIcon, HighlighterIcon, ClockIcon } from 'lucide-react'

interface LibraryStats {
  totalBookmarks: number
  totalLists: number
  totalHighlights: number
  totalReadingHistory: number
}

export function LibraryDashboard() {
  const [stats, setStats] = useState<LibraryStats | null>(null)
  
  useEffect(() => {
    // Fetch stats from API
    fetch('/api/library/stats')
      .then(res => res.json())
      .then(data => setStats(data))
  }, [])
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BookmarkIcon />}
          label="Bookmarks"
          value={stats?.totalBookmarks ?? 0}
          href="/me/bookmarks"
        />
        <StatCard
          icon={<ListIcon />}
          label="Lists"
          value={stats?.totalLists ?? 0}
          href="/me/lists"
        />
        <StatCard
          icon={<HighlighterIcon />}
          label="Highlights"
          value={stats?.totalHighlights ?? 0}
          href="/me/highlights"
        />
        <StatCard
          icon={<ClockIcon />}
          label="Reading History"
          value={stats?.totalReadingHistory ?? 0}
          href="/me/history"
        />
      </div>
    </div>
  )
}
```

### BookmarkButton Component

```typescript
'use client'

import { useState } from 'react'
import { BookmarkIcon } from 'lucide-react'

interface BookmarkButtonProps {
  postId: string
  initialBookmarked?: boolean
}

export function BookmarkButton({ postId, initialBookmarked = false }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)
  
  const toggleBookmark = async () => {
    setLoading(true)
    
    try {
      if (bookmarked) {
        await fetch(`/api/library/bookmarks/${postId}`, { method: 'DELETE' })
        setBookmarked(false)
      } else {
        await fetch('/api/library/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId })
        })
        setBookmarked(true)
      }
    } catch (error) {
      console.error('Failed to toggle bookmark', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`
        rounded-lg border-3 border-black p-3
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        transition-all hover:translate-x-[2px] hover:translate-y-[2px]
        hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
        ${bookmarked ? 'bg-[#9723C9] text-white' : 'bg-white text-black'}
      `}
    >
      <BookmarkIcon className={bookmarked ? 'fill-current' : ''} />
    </button>
  )
}
```

## API Route Example

### Lists Route (`src/app/api/library/lists/route.ts`)

```typescript
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase/server-client'
import { createListSchema } from '@/lib/library/validation'

export async function GET() {
  const supabase = createServerComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()
  
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }
  
  const { data: lists, error } = await supabase
    .from('user_lists')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ lists })
}

export async function POST(request: Request) {
  const supabase = createServerComponentClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const validation = createListSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validation.error },
      { status: 400 }
    )
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()
  
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }
  
  const { data: list, error } = await supabase
    .from('user_lists')
    .insert({
      profile_id: profile.id,
      ...validation.data
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ list }, { status: 201 })
}
```

## Deployment Checklist

- [ ] Database migration applied
- [ ] TypeScript types added
- [ ] Validation schemas created
- [ ] All API routes implemented
- [ ] All frontend routes created
- [ ] UI components built
- [ ] Integration complete
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Accessibility verified
- [ ] Mobile responsiveness checked

## Troubleshooting

### Migration Issues
- Ensure Supabase CLI is authenticated
- Check for conflicting table names
- Verify RLS policies are correct

### API Issues
- Check authentication middleware
- Verify Supabase client configuration
- Review RLS policies

### UI Issues
- Check component imports
- Verify API endpoints
- Review browser console for errors

## Next Steps

After completing the implementation:

1. **User Testing**: Conduct user testing sessions
2. **Analytics**: Set up tracking for library features
3. **Documentation**: Update user-facing documentation
4. **Marketing**: Announce the new feature
5. **Iteration**: Gather feedback and iterate

## Resources

- [Implementation Plan](./library-feature-implementation-plan.md)
- [Technical Spec](./library-technical-spec.md)
- [Feature Summary](./library-feature-summary.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

