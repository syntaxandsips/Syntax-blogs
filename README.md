# SyntaxBlogs

A modern blog platform focused on AI, Machine Learning, and Deep Learning topics with a neo-brutalism design aesthetic.

## Overview

SyntaxBlogs is a Next.js-based blog platform designed to showcase articles about artificial intelligence, machine learning, deep learning, and related technologies. The platform features a clean, modern interface with a neo-brutalism design style.

## Features

- **Modern Design**: Neo-brutalism theme with clean typography and vibrant accents
- **Responsive Layout**: Fully responsive design that works on all devices
- **Interactive Elements**: Hover effects, dropdown menus, and animated components
- **Blog Management**: Easy-to-use blog post creation and management
- **Social Media Integration**: "Where to Follow" section with links to social platforms
- **Recommended Topics**: Curated topic suggestions for readers

## Tech Stack

- **Framework**: Next.js 15.3.1
- **Styling**: Tailwind CSS with custom neo-brutalism theme
- **Animations**: React Spring for text effects
- **Icons**: Lucide React for modern iconography
- **Typography**: Custom sans-serif fonts for readability

## Design Elements

### Color Scheme

#### Neo-Brutalism Color Palette

| Color Name | Hex Code | Description |
|------------|----------|-------------|
| Mint | `#DAF5F0` | Light mint green |
| Sage | `#B5D2AD` | Soft sage green |
| Lemon | `#FDFD96` | Pale yellow |
| Peach | `#F8D6B3` | Soft peach |
| Lavender | `#FCDFFF` | Light lavender |
| Periwinkle | `#E3DFF2` | Soft periwinkle blue |
| Aqua | `#A7DBD8` | Light aqua blue |
| Lime | `#BAFCA2` | Bright lime green |
| Mustard | `#FFDB58` | Mustard yellow |
| Coral | `#FFA07A` | Coral orange |
| Pink | `#FFC0CB` | Soft pink |
| Lilac | `#C4A1FF` | Light lilac purple |
| Sky | `#87CEEB` | Sky blue |
| Mint Green | `#90EE90` | Bright mint green |
| Gold | `#F4D738` | Gold yellow |
| Tomato | `#FF7A5C` | Tomato red |
| Rose | `#FFB2EF` | Rose pink |
| Violet | `#A388EE` | Soft violet |
| Turquoise | `#69D2E7` | Turquoise blue |
| Olive | `#7FBC8C` | Olive green |
| Orange | `#E3A018` | Deep orange |
| Red | `#FF6B6B` | Bright red |
| Hot Pink | `#FF69B4` | Hot pink |
| Purple | `#9723C9` | Deep purple |

- **Primary Background**: Yellow (`#FFFF00`)
- **Text Color**: Black (`#000000`)
- **Accent Colors**: Various colors from the palette above for different UI elements
- **Hover Effects**: Color transitions with offset shadows in neo-brutalism style

### Typography

- Sans-serif typography for subtitles and blog content
- Bold headings with clean, readable body text

### UI Components

- **Buttons**: Neo-brutalism style with border, shadow, and hover effects
- **Cards**: Clean cards with category tags and metadata
- **Navigation**: Simple navbar with logo, blogs link, and search functionality
- **Social Links**: Platform icons with usernames and follow buttons

## Project Structure

```text
syntaxblogs/
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js app router pages
│   │   ├── blogs/     # Blog listing and individual posts
│   │   └── page.tsx   # Home/landing page
│   ├── components/    # Reusable UI components
│   │   └── ui/        # UI component library
│   ├── styles/        # Global styles and theme
│   └── utils/         # Utility functions
└── package.json       # Project dependencies
```

## Key Components

- **Hero Page**: Clean landing page without navbar, featuring coding-related visuals and random background changes
- **Blog Listing**: Grid layout of blog posts with metadata and interactive elements
- **Blog Post**: Detailed article view with back navigation and content formatting
- **Sidebar**: Recommended topics and "Where to Follow" sections
- **Article Metadata**: Publication date, view count, and action menu
- **Action Menu**: Share link and "Generate post" options

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/syntaxblogs.git
   cd syntaxblogs
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Deployment

The project is configured for deployment to GitHub Pages using GitHub Actions.

### Initial Setup (One-time)

You'll need to manually enable GitHub Pages in your repository settings:

1. Go to your repository on GitHub
2. Navigate to Settings > Pages
3. Under "Source", select "GitHub Actions" from the dropdown
4. Save the settings

This manual setup is required only once. After that, the site will be deployed automatically whenever changes are pushed to the main branch.

### How It Works

1. When you push changes to the `main` branch, GitHub Actions automatically builds the site
2. The workflow creates a static export of your Next.js application
3. The built files are deployed to GitHub Pages
4. Your site will be available at `https://[username].github.io/[repository-name]/`
5. The workflow is defined in `.github/workflows/deploy.yml`

### Manual Deployment

If you want to deploy manually:

1. Build the project:

   ```bash
   npm run build
   ```

2. The static site will be generated in the `out` directory
3. You can deploy this directory to any static hosting service

## Customization

### Adding New Blog Posts

Add new blog posts by creating entries in the blogs data array with the following structure:

```javascript
{
  slug: 'post-slug',
  title: 'Post Title',
  excerpt: 'Brief excerpt of the post content...',
  category: 'Category',
  accent: 'accent-class',
  date: 'Month DD, YYYY',
  views: 123,
}
```

### Modifying the Theme

The neo-brutalism theme can be customized in `src/styles/neo-brutalism.css`. Key CSS variables include:

```css
:root {
  --neo-background: white;
  --neo-text: black;
  --neo-accent: #8a2be2;
  --neo-secondary: #ff6b6b;
  --neo-tertiary: #4ecdc4;
  --neo-border-width: 2px;
  --neo-shadow-offset: 4px;
  --neo-shadow-color: rgba(0, 0, 0, 0.8);
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Design inspiration from neo-brutalism trend
- Icons from Lucide React
- Animation components from React Spring
