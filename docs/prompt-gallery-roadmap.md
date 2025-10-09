# Prompt Gallery Feature Roadmap

## 1. Vision & Success Criteria
- **Objective**: Launch a community-driven Prompt Gallery inside the Resources area that allows discovery, curation, and monetization of prompts across text, image, video, audio, and emerging model categories.
- **Key Outcomes**:
  - ≥60% of logged-in users engage with the gallery weekly through browsing, filtering, or interacting.
  - ≥100 curated prompts uploaded in the first 90 days with <2% flagged for policy violations.
  - Time-to-discovery for top prompts under 3 clicks through filters, search, or featured placements.

## 2. Competitive Insights
| Platform | Differentiators We Should Acknowledge | Opportunities for Syntax & Sips |
| --- | --- | --- |
| **PromptBase** | Marketplace UX with seller flow, Stripe payouts, and tiered marketplace fees encourage professional creators.[^promptbase-fees] | Offer freemium listings with optional premium boosts while keeping payouts simple (Stripe Connect). |
| **SnackPrompt** | Cross-platform ecosystem (browser extension, ChatGPT integration) plus community-run marketplace and curated newsletters.[^snackprompt-features] | Integrate Supabase profiles so uploads, bookmarks, and newsletter preferences sync; explore lightweight browser extension later. |
| **PromptHero** | Deep model taxonomy (image, video, LLM), academy content, and community challenges to keep galleries fresh.[^prompthero-taxonomy] | Mirror model taxonomy, add challenges/quests aligned with our gamification system to surface fresh prompts. |

## 3. User Experience Blueprint
### 3.1 Information Architecture
1. **Resources > Prompt Gallery** (new navigation item under expandable Resources menu).
2. **Landing States**:
   - *Browse*: Masonry/grid of prompt cards with global filters active.
   - *Collections*: Curated themed bundles (e.g., "Onboarding Flows", "Halloween Visuals").
   - *Upload*: Multi-step wizard accessible via CTA and user dashboard.
3. **Detail Page**: Hero section (reference media + metadata), prompt body, model requirements, stats, social actions, and threaded comments.

### 3.2 Prompt Card Anatomy
- Thumbnail (reference image or model icon) with overlay badges for media type (image/video/text/audio) and monetization status (free/premium).
- Title + 2-line preview of the prompt.
- Model + Model version chips (e.g., “Midjourney v6”, “GPT-4o mini”).
- Engagement stats (views, saves, upvotes, downloads) and user avatar.
- Quick actions: **Copy**, **Download**, **Save**, **Report**.

### 3.3 Filtering & Sorting UX
- **Left Sidebar Filters** (persistent on desktop, slide-over on mobile):
  - Model families (Midjourney, DALL·E, Sora, GPT, Claude, Runway, custom models).
  - Media types (Image, Video, Text, Audio, 3D, Workflow).
  - Use case tags (Marketing, Education, Entertainment, Productivity, Experimental).
  - Popularity toggles (Trending, Most Used, Staff Picks).
  - Quality sliders (Average rating ≥4, Downloads >100, Upvote ratio >70%).
  - Monetization (Free, Tip-enabled, Premium price tiers).
  - Date posted (24h, 7d, 30d, Custom range).
- **Sort Bar** across the gallery for quick toggles: Relevance, Newest, Top Rated, Most Downloaded, Most Commented.
- **Filter Pills** appear below header to summarize the current query with a one-click “Clear All”.

### 3.4 Upload Wizard
1. **Basics**: Title, short description, media type, model selection (supports multi-select for variants).
2. **Prompt Content**: Structured fields for main prompt, negative prompt (image/video), and parameter notes; Markdown preview with syntax highlight.
3. **References**: Drag-and-drop image/video thumbnail, optional gallery (max 6 assets) stored in Supabase Storage.
4. **Tagging & Pricing**: Auto-suggested tags, difficulty level, monetization selection (free/tip/premium) with Supabase function to calculate revenue share.
5. **Review & Publish**: Summary preview, policy checklist, optional schedule for moderation queue.
- Autosave drafts every 15 seconds to prevent loss.

### 3.5 Community Interactions
- Voting with weighted reputation (XP + role modifiers) to surface quality content.
- Comment threads with @mentions and inline references to prompt edits.
- Bookmark collections tied to user dashboards.
- Shareable social cards (Open Graph images generated via edge function) for each prompt.
- Version history so authors can iterate on prompts without losing discussion context.

## 4. Technical Architecture
### 4.1 Data Model Extensions
- **Tables**: `prompt_submissions`, `prompt_assets`, `prompt_tags`, `prompt_votes`, `prompt_stats_daily`, `prompt_collections`, `prompt_comments`, `prompt_downloads`, `prompt_copy_events`.
- **Relationships**: Each prompt links to users, selected models (many-to-many via `prompt_models`), and optional monetization entries.
- **Indexes & Search**: Postgres full-text search on title + prompt body; vector embeddings (pgvector) to power semantic search and “related prompts”.

### 4.2 API & Services
- App Router route handlers under `app/api/prompts/*` for CRUD, interactions, and analytics ingestion.
- Supabase Row Level Security rules ensuring users can modify only their uploads; admin bypass for moderation.
- Edge Functions for heavy tasks (generating social images, computing trending scores, rate-limiting copy/download events).
- Scheduled Supabase cron jobs to backfill leaderboard stats and decay popularity scores nightly.

### 4.3 Frontend Components
- `PromptGalleryPage` (Server Component) orchestrating initial data fetch with streaming filters.
- `PromptFilterSidebar` (Client) managing filter state synced to URL query parameters.
- `PromptGrid` + `PromptCard` components supporting infinite scroll and skeleton loading.
- `PromptDetailPage` with tabbed sections (Prompt, Variations, Comments, Changelog).
- `PromptUploadWizard` (Client) using React Hook Form + Zod for validation.
- Shared `usePromptFilters` hook to centralize filter schema and defaults.

### 4.4 Moderation & Trust
- Admin dashboard widgets for queue review, auto-flagging (NSFW detection, duplicate prompt scoring), and bulk actions.
- Community guidelines acceptance tracking; block publishing until accepted.
- Audit log entries for edits, takedowns, and reinstatements to support dispute resolution.

## 5. Analytics & Monetization Hooks
- Track funnel metrics: upload completion rate, filter usage, conversions from views to downloads.
- Revenue handling via Supabase functions + Stripe Connect, capturing platform fee configurable in admin panel.
- Optional “tip jar” integration using micro-payment providers if prompt is free but tip-enabled.
- Weekly digest email summarizing new top prompts per model; integrate with existing newsletter engine.

## 6. Accessibility & Performance Considerations
- Ensure prompt cards meet WCAG contrast and support keyboard-only navigation for copy/download actions.
- Lazy-load reference assets and use responsive image sizes to keep gallery TTI under 2s.
- Debounce filter changes with optimistic UI; prefetch prompt detail data on hover/focus for desktop.
- Provide loading skeletons and fallback text states for low-bandwidth users.

## 7. Phased Implementation Timeline
| Phase | Duration | Scope | Exit Criteria |
| --- | --- | --- | --- |
| **Phase 0 – Discovery** | 1 sprint | Finalize requirements, map Supabase schema updates, produce UX wireframes + design tokens. | Approved UX flows, migration plan, engineering estimates. |
| **Phase 1 – Foundation** | 2 sprints | Implement database tables, basic gallery listing, upload wizard (drafts), and copy/download tracking. | Users can upload prompts (admin approval), browse basic gallery, copy prompts. |
| **Phase 2 – Engagement** | 2 sprints | Advanced filters, voting, comments, semantic search, and collections. | Filters persist across sessions, voting affects rankings, comments live. |
| **Phase 3 – Monetization & Moderation** | 2 sprints | Stripe payouts, premium listings, admin queue, automated policy checks. | First payout processed in sandbox, admin can approve/deny submissions. |
| **Phase 4 – Growth** | Continuous | Challenges, badges, newsletters, browser extension spikes, A/B testing. | Engagement KPIs trending upward and backlog groomed for enhancements. |

## 8. Risk Register & Mitigations
- **Content Quality Drift**: Introduce creator reputation tiers and automated linting (prompt length, banned keywords) before publish.
- **Performance Bottlenecks**: Cache filter metadata via Edge Config; use pagination thresholds to guard against large scans.
- **Abuse & Spam**: Rate limit uploads, require verified email before publishing, leverage Supabase Functions for abuse heuristics.
- **Legal/Policy Compliance**: Surface license selection (CC0, Custom) and require attestations; maintain takedown workflow.

## 9. Future Enhancements
- AI-assisted prompt optimization suggestions (e.g., rewrite for clarity, parameter tuning hints).
- Collaborative prompt authoring with draft-sharing and inline comments.
- API access for enterprise customers to pull curated prompt sets programmatically.
- Community challenges tied to Syntax & Sips gamification (XP boosts, seasonal badges).

---
[^promptbase-fees]: PromptBase sell page describing zero-fee direct sales, 20% marketplace fee, and Stripe payouts. Source: https://r.jina.ai/https://promptbase.com/sell
[^snackprompt-features]: SnackPrompt about page outlining Magic Keys extension, ChatGPT integration, desktop app, and marketplace features. Source: https://r.jina.ai/https://snackprompt.com/about
[^prompthero-taxonomy]: PromptHero homepage detailing multi-model taxonomy, academy, and community challenges. Source: https://r.jina.ai/https://prompthero.com/
