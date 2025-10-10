# UI/UX Delta Plan

## 1. Information Architecture Updates
- **Global Navigation:** Introduce top-level hubs for Spaces, Feeds, Events, Funding, Projects, and Admin (role-gated). Utilize mega-menu for quick access to joined spaces and upcoming events.
- **Space Shell:** Each space gets a consistent layout with overview, content tabs (Articles, Discussions, Q&A, Events, Workshops), members, rules, and analytics.
- **Creator Console:** Consolidate drafts, scheduled posts, bounties, donations, and events into a single dashboard accessible from `/creator`.
- **Admin Console:** Expand IA to include feature flag management, KYC approvals, moderation escalation, and audit log explorer.

## 2. Component Inventory (New & Updated)
| Component | Type | Status | Notes |
| --- | --- | --- | --- |
| `SpaceHeader` | Server component | New | Displays space branding, rules CTA, join/leave actions, feature-flag aware. |
| `SpaceRolePill` | Client component | New | Shows member role, tooltip with privileges. |
| `ContentComposer` | Client component | Updated | Modular editor supporting Article/Discussion/Q&A/Event/Workshop templates with plugin architecture. |
| `TemplatePickerModal` | Client component | New | Allows selecting space-level templates with previews and accessibility hints. |
| `ModerationQueueTable` | Client component | Updated | Adds filters for queue type, bulk actions, SLA indicators. |
| `ReputationBadge` | Client component | Updated | Reflects new tiers, includes tooltip for required XP. |
| `DonationWidget` | Client component | New | Supports one-time/recurring pledges, fee breakdown slider, donor anonymity toggle. |
| `EventCard` | Server component | New | Lists schedule, venue/map, availability, price. |
| `NotificationPreferencesMatrix` | Client component | New | Grid-based control for per-space/per-content notification toggles. |
| `AuditLogTimeline` | Server component | New | Timeline visualization for moderation/flag changes with filter chips. |
| `FeatureFlagManager` | Client component | New | Admin console surface for creating, editing, and auditing feature flags with accessible forms and toggles. |
| `UserManagement` | Client component | Updated | Role assignment UI now gated by `rbac_hardening_v1`, highlights highest role badge and displays RBAC guidance tooltips. |

## 3. Design Tokens & Theming
- **Color:** Expand palette to include semantic tokens (`success`, `warning`, `danger`, `info`, `neutral`) with accessible contrast; provide dark/light variants.
- **Spacing:** Introduce scale `space-xxs` (4px) to `space-xxl` (48px) for layout rhythm across dashboards.
- **Typography:** Define tokens for headings (`display`, `headline`, `title`, `body`, `mono`) with clamp-based responsive sizing.
- **Elevation:** Create shadow tokens for interactive surfaces (cards, modals) aligned with neo-brutalism outlines.
- **Radius:** Maintain bold outlines but add `radius-sm` (4px) for chip components and `radius-lg` (16px) for cards.

## 4. Accessibility Notes
- All new interactive components must support keyboard navigation, focus-visible styles, and ARIA attributes.
- Provide descriptive labels for toggles (e.g., fee coverage slider, feature flag enable switch) and ensure error messages include guidance.
- For events, include accessibility notes (wheelchair access, ASL availability) and ensure color-coded statuses have text equivalents.
- Implement reduced motion mode for animations in reputation celebrations and feed transitions.

## 5. Responsive Behavior
- **Mobile:** Sticky quick actions (Join Space, New Post) at bottom; collapsible filters for search and moderation queues.
- **Tablet:** Two-column layout for dashboards with persistent navigation drawer.
- **Desktop:** Grid-based analytics with quick-glance KPI cards, multi-pane messaging UI.

## 6. Documentation & Handoff
- Maintain component specs in Storybook (to be configured) with accessibility checklists.
- Update `neobrutalismthemecomp.MD` with new tokens and examples.
- Capture screenshots/GIFs for each new flow when feature flags progress to pilot.
