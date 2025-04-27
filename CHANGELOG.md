# Changelog

All notable changes to the SyntaxBlogs project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
