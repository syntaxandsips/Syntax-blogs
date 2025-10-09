# Changelog

All notable changes to the SyntaxBlogs project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned - Library Feature
- **User Library System**: Complete Medium-style library feature for saving and organizing content
  - Your Library: Central dashboard for all saved content
  - Your Lists: Create and manage custom lists of posts
  - Saved Lists: Save and follow lists from other users
  - Highlights: Text highlighting with notes and color coding
  - Reading History: Track reading activity and progress
  - Responses: Manage all comments and interactions
- **Database Schema**: New tables for user_lists, list_items, saved_lists, highlights, reading_history, bookmarks
- **API Routes**: Complete REST API for library operations at /api/library/*
- **UI Components**: Neo-brutalism styled components for all library features
- **Route Migration**: /me route migrated from admin redirect to user library dashboard
- **Privacy Controls**: Granular privacy settings for lists and highlights
- **Documentation**: Comprehensive guides for library feature implementation

### Documentation
- Added `docs/library-feature-implementation-plan.md` - Complete implementation roadmap
- Added `docs/library-feature-summary.md` - Executive summary and feature overview
- Added `docs/library-technical-spec.md` - Detailed technical specifications and database schema

## [1.12.9] - 2025-02-27

### Fixed

- Fixed excessive spacing between sidebar and main content on the account page when sidebar is open
- Improved sidebar collapsed state with better icon sizing, padding, and button layouts
- Enhanced sidebar toggle button visibility and positioning with improved hover effects
- Optimized content area width and padding for better professional appearance
- Added proper transitions and hover states for sidebar menu items in both expanded and collapsed states
- Hidden profile stats (posts/comments) icons when sidebar is collapsed for cleaner appearance
- Fixed blogs page layout to have sticky right sidebar with "Recommended topics" and "Where to follow" sections
- Preserved neo-brutalism design with rotated cards and shadows on sticky sidebar
- Removed scrollbar from sidebar by eliminating max-height constraint for better UX

### Changed

- Removed automatic margin adjustments from `SidebarInset` component for more predictable layout behavior
- Updated sidebar to be full-height (`lg:h-screen`) and sticky from top of viewport
- Improved sidebar header and footer styling with better borders and spacing
- Enhanced collapsed sidebar icons to be larger (20px) and properly centered in square buttons
- Adjusted main content max-width from `max-w-7xl` to `max-w-6xl` for better readability
- Replaced chevron icon with intuitive `PanelLeftClose`/`PanelLeftOpen` icons for sidebar toggle button
- Changed toggle button shape from circular to rounded square for better visual clarity
- Added tooltip to toggle button showing "Collapse sidebar" or "Expand sidebar"
- Consolidated profile information into a single tooltip when sidebar is collapsed
- Added active state animation to toggle button (press effect)
- Updated blogs page layout to use sticky positioning for right sidebar (`lg:sticky lg:top-24`)
- Applied same sticky sidebar layout to individual blog post pages for consistency
- Added hover effects to sidebar cards (`transition-transform hover:rotate-0`)
- Added padding wrapper (`px-2 lg:px-0`) to prevent rotated card clipping
- Removed max-height and overflow constraints from sidebar for full content visibility

## [1.12.8] - 2025-02-26

### Added

- Introduced a documentation index along with dedicated setup, testing, and API reference guides under `docs/` to centralize onboarding resources.
- Added TSDoc comments to Supabase helpers and utilities to clarify parameters, return values, and error handling expectations.

### Changed

- Reorganized the hero README with a full table of contents, expanded setup instructions, and direct links to supporting guides.
- Updated changelog to reflect the documentation overhaul.

## [1.12.7] - 2025-02-22

### Changed

- Refined documentation tone with a professional Tabler icon-driven README refresh that highlights core features, setup, and operations.
- Added README formatting standards to `AGENTS.md` so future updates keep iconography and executive-ready messaging consistent.

## [1.12.6] - 2025-02-20

### Changed

- Modernized the README with an expanded product overview, architecture summary, and setup guidance that omits legacy seed credentials.
- Updated admin onboarding docs to reflect manual Supabase-managed account creation.

### Removed

- Deprecated the local test-user seeding script and scrubbed references to bundled credentials.

## [1.12.5] - 2025-02-16

### Changed

- Replaced the React Spring blur animation with a Framer Motion implementation compatible with React 19
- Made blog category filters and recommended topics derive from live Supabase data instead of hardcoded lists
- Updated README instructions to clarify migration execution and Supabase setup steps

### Fixed

- Resolved the `npm install` peer dependency conflict caused by `@react-spring/web` requiring React 18

## [1.12.4] - 2024-07-16

### Changed

- Completely redesigned README.md with modern layout and visual elements
- Added screenshots of all major pages to the documentation
- Enhanced project description with detailed feature explanations
- Improved installation and deployment instructions
- Added comprehensive code block formatting guide
- Updated tech stack information with visual icons

## [1.12.3] - 2024-07-16

### Added

- Created comprehensive Markdown guide for blog authors
- Added specific guide for using code blocks with syntax highlighting
- Documented multi-language code block functionality
- Added examples and best practices for content creation

## [1.12.2] - 2024-07-16

### Fixed

- Fixed blog post page error with exact slug matching by adding variants with trailing hyphens
- Added all possible slug variations to prevent 500 errors on blog post pages
- Ensured all URL patterns are properly handled in generateStaticParams
- Added comprehensive slug handling for better static site generation

## [1.12.1] - 2024-07-16

### Fixed

- Fixed blog post page error with missing static params by adding all required slugs
- Removed old BlogPostClient component that was no longer in use
- Fixed accessibility issues in the admin panel components
- Added proper ARIA labels and titles to form elements
- Improved screen reader support for color selection buttons

## [1.12.0] - 2024-07-16

### Changed

- Completely redesigned admin panel with modern UI
- Implemented new dashboard overview with statistics
- Added new post management interface with improved filtering
- Enhanced post editor with better markdown support
- Improved user experience with better navigation and layout
- Added accent color selection for blog posts
- Implemented better status indicators for post publishing state
- Enhanced mobile responsiveness for admin interface

## [1.11.3] - 2024-07-16

### Fixed

- Properly fixed warning about `params.slug` in blog post page by correctly awaiting params before accessing properties

## [1.11.2] - 2024-07-16

### Fixed

- Fixed popup appearing when AI summarize button is clicked by modifying the Loader component
- Improved user experience by keeping all content in the same view

## [1.11.1] - 2024-07-16

### Changed

- Modified SummarizeButton components to display AI summary directly in the page
- Removed popup/modal from both SummarizeButton and NewSummarizeButton components
- Improved user experience by keeping all content in the same view

## [1.11.0] - 2024-07-16

### Changed

- Completely revamped the article read page with new neo-brutalism UI design
- Implemented new CodeBlock component with language selection and copy functionality
- Added new VideoEmbed component with improved styling
- Created new SummarizeButton with loading animation and summary display
- Enhanced article layout with better typography and spacing
- Improved tag styling with colored backgrounds
- Updated sidebar with "AI and ML Insights" and "Where to follow" sections
- Added social platform icons with colored backgrounds
- Maintained compatibility with existing data structure

## [1.10.2] - 2024-07-15

### Changed

- Updated NewSidebar component to match the neo-brutalism design used in NewFollowSection
- Ensured consistent UI for "AI and ML Insights" and "Where to follow" sections across all pages
- Improved styling with proper border, shadow, and rotation effects
- Enhanced social media platform icons with colored backgrounds

## [1.10.1] - 2024-07-15

### Changed

- Fixed active tab highlighting in the navbar to properly show the current page
- Updated blog post page to include static params for all blog slugs to fix the "missing param" error
- Removed unused UI components to make the app more lightweight and faster
- Improved overall performance by cleaning up the codebase

### Removed

- Removed old UI components that were no longer being used:
  - ArticleMetadata.tsx
  - ReadArticleButton.tsx
  - Sidebar.tsx
  - RecommendedTopics.tsx
  - WhereToFollow.tsx
  - FollowButton.tsx
  - navbar.tsx (old version)

## [1.10.0] - 2024-07-15

### Changed

- Completely redesigned blogs page with new neo-brutalism UI
- Added new topic filters with improved styling
- Enhanced blog cards with better visual hierarchy
- Improved "Where to follow" section with platform icons
- Updated recommended topics with AI and ML focus
- Added dropdown menu for blog post actions (share, generate)
- Improved overall visual consistency with the landing page
- Enhanced mobile responsiveness for better user experience

## [1.9.0] - 2024-07-15

### Fixed

- Fixed hydration errors by adding type attributes to all buttons
- Added type="button" to buttons in NewNavbar component
- Added type="button" to buttons in HeroSection component
- Added type="button" to buttons in ContentPreview component
- Improved client/server rendering consistency
- Resolved "Hydration failed because the server rendered HTML didn't match the client" errors

## [1.8.9] - 2024-07-15

### Changed

- Replaced the old landing page with the new modern UI design
- Made the new landing page the default page at the root URL
- Updated ConditionalNavbar to use the new navbar component
- Removed the old navbar and its components
- Simplified layout structure by removing redundant main tag
- Improved overall site navigation and consistency

## [1.8.8] - 2024-07-15

### Added

- Created new landing page with modern UI design at `/new-landing`
- Implemented new components following the provided design:
  - NewNavbar with desktop and mobile navigation
  - HeroSection with background elements and call-to-action buttons
  - TopicsSection with interactive topic cards
  - ContentPreview with filter buttons and content cards
  - NewsletterSection with email subscription form
  - NewFooter with social links and site sections
- Added tailwind.config.js with necessary theme extensions
- Updated global CSS with new color variables and utility classes

## [1.8.7] - 2024-07-15

### Fixed

- Added `--legacy-peer-deps` flag to npm installation in GitHub Actions workflow
- Resolved dependency conflict between `@react-spring/web@9.7.5` and `react@19.1.0`
- Fixed build failures caused by incompatible peer dependencies

## [1.8.6] - 2024-07-15

### Security

- Removed enablement parameter from configure-pages action
- Added warning about secure token handling
- Improved workflow to avoid token exposure

## [1.8.5] - 2024-07-15

### Fixed

- Fixed git branch handling in GitHub Actions workflow
- Added explicit branch tracking to prevent checkout errors
- Improved branch switching logic after gh-pages creation
- Added fallback to main branch if original branch checkout fails

## [1.8.4] - 2024-07-15

### Fixed

- Fixed GitHub Actions workflow syntax errors
- Simplified GitHub Pages enablement approach
- Removed dependency on Personal Access Token
- Used built-in GitHub token for API calls
- Added better error handling for API calls
- Updated documentation with simplified setup instructions

## [1.8.3] - 2024-07-15

### Changed

- Updated GitHub Pages enablement to use Personal Access Token
- Added detailed instructions for setting up PAT in README
- Improved error handling for GitHub Pages API calls
- Added fallback message when PAT is not available
- Enhanced workflow to support both automatic and manual GitHub Pages setup

## [1.8.2] - 2024-07-15

### Enhanced

- Improved GitHub Actions workflow with robust error handling
- Added detailed logging for GitHub Pages API operations
- Enhanced gh-pages branch creation process
- Implemented HTTP status code checking for API responses
- Added fallback mechanisms for GitHub Pages enablement

## [1.8.1] - 2024-07-15

### Changed

- Simplified GitHub Actions workflow for GitHub Pages deployment
- Updated documentation with manual GitHub Pages setup instructions
- Removed automatic GitHub Pages enablement due to permission constraints

## [1.8.0] - 2024-07-15

### Added

- Configured GitHub Pages deployment with GitHub Actions
- Added static export configuration to Next.js
- Created GitHub Actions workflow for automated deployment
- Added .nojekyll file to prevent Jekyll processing
- Updated documentation with deployment information

## [1.7.6] - 2024-07-14

### Added

- Created new `/changelog` page that renders the CHANGELOG.md content
- Added links to changelog in both desktop and mobile navigation
- Added custom styling for changelog content
- Implemented proper markdown rendering for the changelog

### Fixed

- Fixed error in `/blogs/[slug]` route by properly awaiting params
- Improved error handling in blog post routes
- Enhanced markdown rendering with better styling

## [1.7.5] - 2024-07-14

### Fixed

- Fixed 404 error on /blogs route
- Restructured blogs page to use client-side component
- Improved blogs page loading with proper server/client separation
- Enhanced error handling for blog post loading
- Added fallback UI for when no blog posts are available
- Fixed navigation links to properly point to the blogs page

## [1.7.4] - 2024-07-14

### Fixed

- Fixed "Maximum update depth exceeded" error in React components
- Resolved infinite re-rendering loops in useEffect hooks
- Improved state management with useCallback and useRef
- Fixed dependency arrays in useEffect hooks
- Optimized LoaderContext to prevent circular dependencies
- Enhanced cleanup of timeouts to prevent memory leaks
- Improved component lifecycle management
- Fixed state update logic to prevent cascading updates

## [1.7.3] - 2024-07-14

### Fixed

- Fixed infinite loading issue with multiple safety timeouts
- Added fade-out animation when loader is dismissed
- Improved loader detection of page load completion
- Added multiple fallback mechanisms to ensure loader disappears
- Enhanced video loading with proper loading state detection
- Added fallback spinner while video is loading
- Implemented window.load event listener for more reliable load detection
- Added safety timeouts at multiple levels to prevent stuck loaders

## [1.7.2] - 2024-07-14

### Fixed

- Fixed hydration errors by adding suppressHydrationWarning to body element
- Resolved loader styling issues that were causing the whole page to turn black
- Added dedicated CSS classes for loader components in neo-brutalism.css
- Improved loader overlay with proper styling and transparency
- Enhanced page loading experience with smoother transitions
- Fixed client-side rendering issues with proper mounting checks
- Removed inline styles in favor of CSS classes for better maintainability
- Improved video loading performance and compatibility

## [1.7.1] - 2024-07-14

### Fixed

- Fixed loading animations by switching from Lottie to webm video format
- Updated loader components to use video elements instead of Lottie
- Fixed 404 page animation to use webm video
- Improved loading performance with native video elements
- Enhanced compatibility across browsers with standard video format

## [1.7.0] - 2024-07-14

### Added

- Added animations for loading states throughout the application
- Implemented page loading animation with loader
- Added AI summarization loading animation
- Added content generation loading animation
- Created custom 404 page with animation
- Implemented LoaderContext for centralized loading state management
- Added GeneratePostButton component for AI content generation
- Optimized loading states for better user experience

### Changed

- Updated SummarizeButton to use the new loading system
- Improved landing page with better loading transitions
- Enhanced overall performance with optimized loading states
- Fixed button type attributes for better accessibility

## [1.6.0] - 2024-07-14

### Changed

- Completely redesigned landing page with enhanced neo-brutalism styling
- Added interactive animated title with hover effects for each character
- Improved feature cards with hover animations and interactive elements
- Enhanced decorative elements with better positioning and animations
- Created custom animated button component with hover effects
- Added random background pattern selection on page refresh
- Rearranged layout for better visibility without scrolling
- Improved mobile responsiveness with better spacing and sizing
- Enhanced overall visual appeal with better color coordination
- Added decorative corner accents to the title container
- Implemented subtle animations for better user engagement
- Improved typography with better font sizing and spacing

## [1.5.1] - 2024-07-13

### Fixed

- Fixed hydration error by moving decorative elements to a client-side only component
- Improved code structure with better component separation
- Enhanced rendering performance by optimizing client-side elements

## [1.5.0] - 2024-07-13

### Changed

- Removed top and bottom black borders as requested
- Changed title font to Bebas Neue for better visual impact
- Increased title font size for more prominence
- Improved topic tags with better spacing and visibility
- Enhanced tag styling with larger icons and better contrast
- Increased padding and sizing of category tags
- Added minimum width to tags for better proportions
- Improved tag icon containers with better styling
- Enhanced mobile responsiveness for better display on all devices
- Maintained the grid background and decorative elements
- Adjusted spacing between elements for better visual balance
- Improved flex-wrap behavior for better tag layout
- Optimized for better readability and visual appeal

## [1.4.0] - 2024-07-13

### Changed

- Completely redesigned landing page with enhanced visual elements
- Added subtle grid background for better structure
- Added animated decorative elements for visual interest
- Improved typography with Poppins font for better readability
- Enhanced tag icons with circular backgrounds
- Added gradient backgrounds to all colored elements
- Improved hover effects with subtle animations
- Added pattern overlays to title and button elements
- Enhanced mobile responsiveness with better adaptations
- Improved overall visual hierarchy and balance
- Added subtle texture and pattern elements throughout
- Refined animations for better performance
- Improved accessibility with better contrast ratios

## [1.3.2] - 2024-07-13

### Changed

- Enhanced visual impact of the landing page with more polished neo-brutalism styling
- Increased border thickness to 5px for stronger visual presence
- Enlarged shadows to 8px for more dramatic effect
- Improved typography with better font weights and sizes
- Added subtle shine effect on hover for interactive elements
- Increased spacing between elements for better visual balance
- Enhanced color contrast for better readability (white text on purple)
- Improved mobile responsiveness with better proportions
- Added subtle hover effect to title container
- Refined button styling with bolder text and better padding
- Enlarged category tag icons to 7px for better visibility
- Improved transitions for smoother interactions
- Adjusted spacing and padding for better overall balance

## [1.3.1] - 2024-07-13

### Changed

- Refined landing page to match exact neo-brutalism specifications
- Removed all grid lines and decorative elements for a cleaner design
- Increased horizontal bars to 15px at top and bottom of viewport
- Arranged category tags in a perfect horizontal row with equal spacing
- Enlarged icons in category tags for better visibility (6px)
- Applied consistent 4px black borders to all UI elements
- Implemented uniform 6px offset shadows on all elements
- Used specified color palette exactly as requested:
  - Title: Deep Purple (#9723C9) with white text
  - Subtitle: White background with black text
  - Tags: Purple (#9723C9), Pink (#FF69B4), Blue (#87CEEB), Green (#90EE90)
  - CTA Button: Bright Pink (#FF69B4) with black text
- Improved hover interactions with crisp 4px translations
- Enhanced mobile responsiveness with proper stacking behavior
- Added Archivo Black font for the title text
- Improved spacing between elements for better visual hierarchy
- Ensured all text is properly capitalized according to specifications

## [1.2.8] - 2024-07-13

### Changed

- Refined neo-brutalism design to better follow design principles
- Updated color palette to use a more focused set of colors
- Improved landing page with structured grid and clearer hierarchy
- Enhanced UI components with harder edges and more pronounced shadows
- Simplified decorative elements with more structured positioning
- Added category tags to landing page
- Improved typography with uppercase titles and better spacing
- Replaced inline styles with CSS classes for better maintainability
- Added solid black shadows instead of semi-transparent ones
- Increased border thickness for better neo-brutalism aesthetic

## [1.2.7] - 2024-07-13

### Changed

- Implemented new neo-brutalism color palette throughout the website
- Updated README.md with detailed color palette documentation
- Removed background animation from landing page and replaced with solid yellow background
- Enhanced decorative elements with random positioning and rotation
- Updated neo-brutalism CSS variables with new color scheme
- Improved button styling with thicker borders and more pronounced shadows
- Added more vibrant colors to UI elements for better visual impact

## [1.2.6] - 2024-07-12

### Changed

- Redesigned landing page to match neo-brutalism theme
- Added decorative elements (stars, squares, circles) to landing page
- Replaced standard button with neo-brutalism styled button
- Improved title and subtitle styling with neo-brutalism containers
- Removed theme switcher from landing page
- Enhanced overall visual consistency between landing page and blog pages

## [1.2.5] - 2024-07-12

### Changed

- Removed dark mode from the entire website
- Removed preset/hardcoded blog posts
- Modified admin panel to only show developer-published posts
- Fixed hydration error in FollowButton component
- Improved blog post loading with proper loading and not-found states
- Enhanced client-side data fetching for blog posts

## [1.2.4] - 2024-07-12

### Fixed

- Fixed Next.js params access warning in edit post page
- Separated client and server components for better architecture
- Created dedicated EditPostClient component
- Improved accessibility of form elements
- Added proper labels to datetime inputs
- Added type attributes to all buttons

## [1.2.3] - 2024-07-12

### Changed

- Removed all duplicate navbars in admin page
- Updated ConditionalNavbar to exclude admin pages
- Implemented single black navbar with improved styling
- Added red hover effect to logout button
- Improved overall navigation consistency

## [1.2.2] - 2024-07-12

### Added

- Redesigned admin interface with neo-brutalism styling
- Improved table layout with better spacing and typography
- Enhanced status indicators with proper styling
- Added shadow effects to buttons and containers
- Improved empty state design for better user experience

### Fixed

- Fixed accessibility issues by adding type attributes to all buttons
- Updated anchor tags to use Next.js Link component
- Improved responsive design for mobile devices
- Enhanced visual hierarchy with better typography

## [1.2.1] - 2024-07-12

### Fixed

- Fixed blog detail page error by separating server and client components
- Created proper BlogPostClient component for client-side rendering
- Resolved "use client" and generateStaticParams conflict
- Fixed missing Sidebar component by creating it in the UI components directory
- Updated component imports to use the correct paths
- Fixed BlogPostClient import by using absolute path with @/app prefix

## [1.2.0] - 2024-07-12

### Added

- New neo-brutalism design for blog pages
- Redesigned blog cards with colored corner triangles
- Improved "Where to follow" section with platform icons
- Topic pills for recommended topics
- Consistent styling for buttons and UI elements

### Changed

- Updated Navbar with simplified design
- Redesigned blog detail page with improved typography and layout
- Simplified ArticleMetadata component
- Updated BackButton component with new styling

## [1.1.1] - 2024-07-11

### Fixed

- Updated Tailwind CSS directives to be compatible with v4
- Created src/styles/tailwind.css with correct v4 directives
- Removed inline styles from FollowButton component
- Added feature detection for scrollbar-width CSS property
- Fixed markdown linting issues in changelog.md

## [1.1.0] - 2024-07-10

### Added

- Article metadata with publication date and view count
- Share functionality in article dropdown menu
- "Generate post" option in article dropdown menu
- Orange hover effects for interactive elements
- Comprehensive README.md with project documentation
- This CHANGELOG.md file to track project changes

### Changed

- Renamed "Create post using AI" to "Generate post" in dropdown menu
- Improved button hover styling with orangish-red color
- Enhanced dropdown menu visibility with proper styling and borders
- Updated social follow buttons with consistent styling
- Fixed event propagation in dropdown menu to prevent unintended navigation

### Removed

- Comments count from article metadata
- Inline styles causing hydration errors

### Fixed

- Hydration errors in server/client rendering
- Dropdown menu visibility and interaction issues
- Button hover effects consistency across the application
- Accessibility issues with proper ARIA labels and titles
- Event handling to prevent unintended navigation when using dropdown menu

## [1.0.0] - 2024-07-05

### Added

- Initial project setup with Next.js 15.3.1
- Neo-brutalism design theme with custom CSS
- Blog listing page with article cards
- Individual blog post pages with content
- "Where to Follow" section with social media links
- Recommended topics section in sidebar
- Responsive layout for all screen sizes
- Custom button components with neo-brutalism styling
- Navigation bar with logo and search functionality
- Home page with coding-related visuals
- Random background changes on page refresh
- Custom typography with sans-serif fonts

### Changed

- Removed navbar from hero/home page
- Simplified UI with clean, minimalist approach

### Fixed

- Font paths and loading issues
- Text alignment and spacing
- Decorative elements opacity and positioning
