# Library Feature Implementation Plan

## Overview
This document outlines the comprehensive plan for implementing a Medium-style library feature for Syntax & Sips, enabling users to save posts, create custom lists, highlight content, track reading history, and manage responses.

## Feature Requirements

### User Library Dashboard (`/me`)
The `/me` route will be migrated from admin redirect to a full user dashboard with the following tabs:

1. **Your Library** - Overview of all saved content
2. **Your Lists** - Custom user-created lists
3. **Saved Lists** - Lists saved from other users
4. **Highlights** - Text highlights from articles
5. **Reading History** - Chronological reading activity
6. **Responses** - User comments and interactions

### Sub-routes Structure
```
/me                    → Library overview dashboard
/me/accounts           → Account settings (existing functionality)
/me/lists              → Manage custom lists
/me/lists/[id]         → View specific list
/me/saved-lists        → View saved lists from others
/me/highlights         → View all highlights
/me/history            → Reading history timeline
/me/responses          → Comments and interactions
```

## Database Schema Design

### 1. User Lists Table
```sql
create table if not exists public.user_lists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  slug text not null,
  is_public boolean not null default false,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_lists_profile_slug_unique unique(profile_id, slug)
);
```

### 2. List Items Table
```sql
create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.user_lists(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  note text,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  constraint list_items_unique unique(list_id, post_id)
);
```

### 3. Saved Lists Table
```sql
create table if not exists public.saved_lists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  list_id uuid not null references public.user_lists(id) on delete cascade,
  saved_at timestamptz not null default now(),
  constraint saved_lists_unique unique(profile_id, list_id)
);
```

### 4. Highlights Table
```sql
create table if not exists public.highlights (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  highlighted_text text not null,
  note text,
  color text default '#FFEB3B',
  position_start integer not null,
  position_end integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 5. Reading History Table
```sql
create table if not exists public.reading_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  read_at timestamptz not null default now(),
  read_duration_seconds integer,
  scroll_percentage integer,
  completed boolean not null default false,
  constraint reading_history_unique unique(profile_id, post_id, read_at)
);
```

### 6. Bookmarks Table (Quick Save)
```sql
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint bookmarks_unique unique(profile_id, post_id)
);
```

## TypeScript Types

### Core Library Types
```typescript
export interface UserList {
  id: string
  profileId: string
  title: string
  description: string | null
  slug: string
  isPublic: boolean
  coverImageUrl: string | null
  itemCount: number
  createdAt: string
  updatedAt: string
}

export interface ListItem {
  id: string
  listId: string
  postId: string
  postTitle: string
  postSlug: string
  postExcerpt: string | null
  note: string | null
  position: number
  addedAt: string
}

export interface Highlight {
  id: string
  profileId: string
  postId: string
  postTitle: string
  postSlug: string
  highlightedText: string
  note: string | null
  color: string
  positionStart: number
  positionEnd: number
  createdAt: string
  updatedAt: string
}

export interface ReadingHistoryEntry {
  id: string
  profileId: string
  postId: string
  postTitle: string
  postSlug: string
  postExcerpt: string | null
  readAt: string
  readDurationSeconds: number | null
  scrollPercentage: number | null
  completed: boolean
}

export interface Bookmark {
  id: string
  profileId: string
  postId: string
  postTitle: string
  postSlug: string
  postExcerpt: string | null
  createdAt: string
}
```

## API Routes Structure

### Lists API (`/api/library/lists`)
- `GET` - Fetch user's lists
- `POST` - Create new list
- `PATCH /[id]` - Update list
- `DELETE /[id]` - Delete list

### List Items API (`/api/library/lists/[id]/items`)
- `GET` - Fetch list items
- `POST` - Add item to list
- `DELETE /[itemId]` - Remove item from list
- `PATCH /[itemId]` - Update item note/position

### Highlights API (`/api/library/highlights`)
- `GET` - Fetch user's highlights
- `POST` - Create highlight
- `PATCH /[id]` - Update highlight
- `DELETE /[id]` - Delete highlight

### Reading History API (`/api/library/history`)
- `GET` - Fetch reading history
- `POST` - Record reading activity
- `DELETE /[id]` - Remove history entry

### Bookmarks API (`/api/library/bookmarks`)
- `GET` - Fetch bookmarks
- `POST` - Add bookmark
- `DELETE /[id]` - Remove bookmark

## UI Components (Neo-Brutalism Style)

### 1. LibraryDashboard Component
- Overview stats (total saved, lists, highlights)
- Recent activity feed
- Quick access to all tabs
- Neo-brutalism cards with thick borders and shadows

### 2. ListsManager Component
- Grid/list view of user lists
- Create new list modal
- Edit/delete list actions
- Drag-and-drop reordering

### 3. HighlightsViewer Component
- Filterable by post
- Color-coded highlights
- Add notes to highlights
- Export highlights feature

### 4. ReadingHistory Component
- Timeline view of reading activity
- Filter by date range
- Reading stats (time spent, completion rate)
- Continue reading suggestions

### 5. ResponsesPanel Component
- All user comments across posts
- Filter by status (approved/pending)
- Quick navigation to original posts

## Implementation Phases

### Phase 1: Database & Types (Current)
1. Create migration file `0015_create_user_library_schema.sql`
2. Add TypeScript types to `src/utils/types.ts`
3. Create validation schemas in `src/lib/library/validation.ts`

### Phase 2: Backend API
1. Implement all API routes
2. Add RLS policies for security
3. Create helper functions for common operations

### Phase 3: Frontend Routes
1. Migrate `/me` from admin redirect to library dashboard
2. Create all sub-routes
3. Implement navigation and routing logic

### Phase 4: UI Components
1. Build core library components
2. Integrate with existing post pages
3. Add save/bookmark buttons to posts
4. Implement highlight selection UI

### Phase 5: Integration & Polish
1. Connect all components to API
2. Add loading states and error handling
3. Implement real-time updates
4. Add analytics tracking
5. Update documentation

## Security Considerations

### Row Level Security (RLS) Policies
- Users can only access their own library data
- Public lists can be viewed by anyone
- Saved lists respect original list privacy settings
- Reading history is strictly private

### Data Privacy
- Reading history is never shared publicly
- Highlights can be optionally shared
- Lists have granular privacy controls

## Next Steps
1. Review and approve this plan
2. Begin Phase 1: Database schema implementation
3. Create migration file with all tables and indexes
4. Add TypeScript types and validation schemas

