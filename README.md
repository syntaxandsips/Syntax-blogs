# Syntax and Sips

<div align="center">
  <img src=".github/images/Hero.png" alt="Syntax and Sips Hero" width="100%">
  <br>
  <h3>A modern blog platform focused on AI, Machine Learning, and Deep Learning topics with a neo-brutalism design aesthetic.</h3>
</div>

## 🚀 Overview

**Syntax and Sips** is a Next.js-based blog platform designed to showcase articles about artificial intelligence, machine learning, deep learning, and related technologies. The platform features a clean, modern interface with a neo-brutalism design style that combines bold typography, vibrant colors, and distinctive UI elements.

## ✨ Key Features

<div align="center">
  <img src=".github/images/blogs.png" alt="Blog Listing Page" width="80%">
</div>

- **🎨 Modern Design**: Neo-brutalism theme with clean typography and vibrant accents
- **📱 Responsive Layout**: Fully responsive design that works on all devices
- **🖱️ Interactive Elements**: Hover effects, dropdown menus, and animated components
- **📝 Blog Management**: Easy-to-use blog post creation and management system
- **🔗 Social Media Integration**: "Where to Follow" section with links to social platforms
- **🏷️ Recommended Topics**: Dynamic suggestions generated from live Supabase categories
- **💻 Code Highlighting**: Syntax highlighting with language selection tabs
- **🎬 Video Embeds**: YouTube video integration
- **🤖 AI Summarization**: One-click AI summary generation for blog posts
- **📊 Admin Dashboard**: Comprehensive analytics and content management

## 🛠️ Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center" width="96">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="48" height="48" alt="Next.js" />
        <br>Next.js
      </td>
      <td align="center" width="96">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="48" height="48" alt="TypeScript" />
        <br>TypeScript
      </td>
      <td align="center" width="96">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" width="48" height="48" alt="Tailwind" />
        <br>Tailwind
      </td>
      <td align="center" width="96">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="48" height="48" alt="React" />
        <br>React
      </td>
      <td align="center" width="96">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="48" height="48" alt="Node.js" />
        <br>Node.js
      </td>
    </tr>
  </table>
</div>

- **🔄 Framework**: Next.js 15.3.1 with App Router
- **🎭 Styling**: Tailwind CSS with custom neo-brutalism theme
- **✨ Animations**: Framer Motion for text effects and transitions
- **🔣 Icons**: Lucide React for modern iconography
- **🔤 Typography**: Custom sans-serif fonts for optimal readability
- **📦 State Management**: React hooks and context for state management
- **🔍 SEO**: Built-in SEO optimization with Next.js metadata

## 🎨 Design System

<div align="center">
  <img src=".github/images/read-blogs.png" alt="Blog Post Page" width="80%">
</div>

### Neo-Brutalism Design

The design follows neo-brutalism principles with:

- **Bold Typography**: Strong, impactful headings with clean sans-serif body text
- **High Contrast**: Sharp contrast between elements for visual impact
- **Thick Borders**: Distinctive black borders (3-4px) around interactive elements
- **Hard Shadows**: Offset shadows (6px) that create depth and dimension
- **Vibrant Colors**: Strategic use of bold colors against clean backgrounds
- **Geometric Shapes**: Simple rectangular elements with sharp corners

### Color Palette

<div align="center">
  <table>
    <tr>
      <td align="center">
        <div style="width: 50px; height: 50px; background-color: #6C63FF; border-radius: 5px;"></div>
        <br><code>#6C63FF</code>
        <br>Primary Purple
      </td>
      <td align="center">
        <div style="width: 50px; height: 50px; background-color: #FF5252; border-radius: 5px;"></div>
        <br><code>#FF5252</code>
        <br>Accent Red
      </td>
      <td align="center">
        <div style="width: 50px; height: 50px; background-color: #06D6A0; border-radius: 5px;"></div>
        <br><code>#06D6A0</code>
        <br>Mint Green
      </td>
      <td align="center">
        <div style="width: 50px; height: 50px; background-color: #FFD166; border-radius: 5px;"></div>
        <br><code>#FFD166</code>
        <br>Yellow
      </td>
      <td align="center">
        <div style="width: 50px; height: 50px; background-color: #118AB2; border-radius: 5px;"></div>
        <br><code>#118AB2</code>
        <br>Blue
      </td>
    </tr>
  </table>
</div>

- **Background**: Clean white (`#FFFFFF`) with subtle grid patterns
- **Text**: Deep black (`#2A2A2A`) for maximum readability
- **Accents**: Strategic use of vibrant colors for UI elements and category tags
- **Shadows**: Black shadows with slight opacity for depth

### UI Components

<div align="center">
  <img src=".github/images/admin.png" alt="Admin Dashboard" width="80%">
</div>

- **Buttons**: Bold, bordered buttons with hover animations and shadow effects
- **Cards**: Clean content cards with category tags and distinctive borders
- **Navigation**: Streamlined navbar with intuitive navigation and search
- **Code Blocks**: Syntax-highlighted code with language selection tabs
- **Social Links**: Platform icons with usernames and follow buttons

## 📂 Project Structure

<div align="center">
  <img src=".github/images/changelogs.png" alt="Changelog Page" width="80%">
</div>

```text
syntaxblogs/
├── public/                # Static assets and animations
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── admin/         # Admin dashboard and post management
│   │   ├── blogs/         # Blog listing and individual posts
│   │   ├── docs/          # Documentation pages
│   │   ├── changelog/     # Changelog display page
│   │   └── page.tsx       # Home/landing page
│   ├── components/        # Reusable UI components
│   │   ├── admin/         # Admin panel components
│   │   └── ui/            # UI component library
│   ├── styles/            # Global styles and theme
│   ├── utils/             # Utility functions
│   └── docs/              # Documentation markdown files
├── CHANGELOG.md           # Project version history
└── package.json           # Project dependencies
```

## 🧩 Key Features Showcase

### Landing Page

<div align="center">
  <img src=".github/images/Hero.png" alt="Landing Page" width="80%">
</div>

The landing page features a modern UI design with:

- **Navbar**: Clean navigation with logo, links, and responsive mobile menu
- **Hero Section**: Eye-catching hero with animated elements and call-to-action
- **Topics Section**: Interactive topic cards with hover effects
- **Newsletter Section**: Email subscription with neo-brutalism styling
- **Footer**: Comprehensive footer with social links and site sections

### Blog Listing

<div align="center">
  <img src=".github/images/blogs.png" alt="Blog Listing" width="80%">
</div>

The blog listing page includes:

- **Filter System**: Topic-based filtering for content discovery
- **Blog Cards**: Neo-brutalism styled cards with metadata and category tags
- **Pagination**: Intuitive navigation between blog pages
- **Search**: Content search functionality with real-time results

### Blog Post Reading

<div align="center">
  <img src=".github/images/read-blogs.png" alt="Blog Post" width="80%">
</div>

The blog post page features:

- **Article Layout**: Clean, readable layout with proper typography
- **Code Blocks**: Syntax-highlighted code with language selection tabs
- **Video Embeds**: YouTube video integration with responsive sizing
- **AI Summarization**: One-click AI summary generation for quick overviews
- **Sidebar**: Recommended topics and "Where to Follow" sections

### Admin Dashboard

<div align="center">
  <img src=".github/images/admin.png" alt="Admin Dashboard" width="80%">
</div>

The admin panel includes:

- **Dashboard Overview**: Analytics and statistics at a glance
- **Post Management**: Create, edit, publish, and delete blog posts
- **Markdown Editor**: Rich content editor with preview functionality
- **Publishing Options**: Draft, schedule, or immediately publish content
- **Category Management**: Organize content with customizable categories

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

<div align="center">
  <img src=".github/images/changelogs.png" alt="Changelog Page" width="80%">
</div>

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/syntaxblogs.git
   cd syntaxblogs
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Supabase:**

   Create a `.env.local` file in the project root and add your Supabase environment variables:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   - The `NEXT_PUBLIC_*` keys are safe for the browser and are required for both the reader UI and Supabase Auth flows.
   - Keep the `SUPABASE_SERVICE_ROLE_KEY` on the server. Never expose it to the client—use it only inside server actions, route handlers, or scripts.
   - For local development parity, install the [Supabase CLI](https://supabase.com/docs/guides/cli) and run `supabase start` to launch a local Postgres instance that matches production.

4. **Apply the database schema:**

   Apply the entire Supabase schema using the CLI so that every migration in [`supabase/migrations`](supabase/migrations) is executed in order:

   ```bash
   supabase db reset --force
   ```

   If you prefer to review each migration individually, run them sequentially instead:

   ```bash
   supabase db push --file supabase/migrations/0001_create_blog_schema.sql
   supabase db push --file supabase/migrations/0002_hardening_existing_schema.sql
   supabase db push --file supabase/migrations/0003_manage_profile_hierarchy.sql
   ```

   These migrations define the `post_status` enum, core blog tables, helper triggers, RPCs, and the Row Level Security policies the application expects.

5. **Seed the test admin user (local/dev):**

   After the schema is in place, create a ready-to-use admin account with:

   ```bash
   npm run seed:test-user
   ```

   The script provisions (or refreshes) the `test.admin@syntaxblogs.dev` user with the password `TestAdmin123!` and ensures the associated profile has admin privileges.

6. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🔐 Test Credentials

The project ships with a reproducible admin account for local verification. Run `npm run seed:test-user` whenever you need to
refresh the credentials.

| Role  | Email                        | Password       | Notes                                      |
|-------|------------------------------|----------------|--------------------------------------------|
| Admin | `test.admin@syntaxblogs.dev` | `TestAdmin123!` | Created via the seeding script; has full access |

> **Security tip:** Never promote this test account in production environments. Instead, create real users from the Supabase
> dashboard or rotate the credentials immediately after testing.

## 🌐 Deployment

<div align="center">
  <img src=".github/images/blogs.png" alt="Blog Page" width="80%">
</div>

The project is configured for deployment to GitHub Pages using GitHub Actions.

### Automated Deployment

1. **GitHub Actions Workflow:**
   - Automatically triggered when changes are pushed to the `main` branch
   - Creates a static export of the Next.js application
   - Deploys the built files to GitHub Pages
   - Site available at `https://[username].github.io/[repository-name]/`

2. **Initial Setup (One-time):**
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Under "Source", select "GitHub Actions" from the dropdown
   - Save the settings

### Manual Deployment Options

For manual deployment:

1. **Build the project:**

   ```bash
   npm run build
   ```

2. **Deploy options:**
   - The static site will be generated in the `out` directory
   - Deploy to Vercel: `vercel --prod`
   - Deploy to Netlify: Connect your GitHub repository
   - Deploy to any static hosting service by uploading the `out` directory

## ⚙️ Customization

<div align="center">
  <img src=".github/images/read-blogs.png" alt="Blog Reading" width="80%">
</div>

### Adding New Blog Posts

Create new blog posts through the admin panel or by inserting rows into the Supabase `posts` table. The column mapping mirrors the `Post` interface used in the application:

```sql
insert into posts (
  title,
  slug,
  excerpt,
  content,
  accent_color,
  status,
  views,
  published_at,
  scheduled_for,
  author_id,
  category_id
)
values (
  'Post Title',
  'post-slug',
  'Brief excerpt of the post content...',
  'Full markdown content with code blocks and embeds...',
  '#6C63FF',
  'published',
  123,
  '2023-07-16T10:00:00Z',
  null,
  '00000000-0000-0000-0000-000000000000',
  null
);
```

Use the Supabase dashboard or CLI to seed categories and generate author records that reference Supabase Auth users. View counters and timestamps are managed automatically by the application and database triggers.

### Migrating legacy JSON or MongoDB data

If you're migrating from the old localStorage/MongoDB seed, export your existing posts to JSON and run the TypeScript helper in [`scripts/migrate-posts.ts`](scripts/migrate-posts.ts):

```bash
SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... npx ts-node scripts/migrate-posts.ts path/to/export.json
```

The script will:

- Upsert categories referenced by the legacy records.
- Normalise status strings (`draft`, `scheduled`, `published`) to the Postgres enum.
- Convert timestamps to ISO format and preserve existing UUIDs when possible.
- Upsert posts and tags, linking them through the `post_tags` junction table.

Inspect the Supabase dashboard after the run to verify all rows imported correctly.

### Code Block Formatting

For syntax-highlighted code blocks with language selection, use the special syntax:

```markdown
{:code-block}
{:javascript}
function example() {
  console.log("Hello world");
}
{:python}
def example():
    print("Hello world")
{:code-block}
```

### Modifying the Theme

The neo-brutalism theme can be customized in the Tailwind configuration and CSS files:

```css
:root {
  --primary: #6C63FF;
  --secondary: #FF5252;
  --accent: #06D6A0;
  --background: #FFFFFF;
  --text: #2A2A2A;
  --border-width: 3px;
  --shadow-offset: 6px;
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Spring](https://react-spring.dev/) - Animation library
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icons
- Design inspiration from neo-brutalism trend

## 🧰 Environment Setup

To run the platform locally you will need a Supabase project, the CLI, and a configured `.env.local` file.

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create a `.env.local` file** with the following values (replace the placeholders with the credentials from your Supabase project):
   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```
3. **Apply the database schema**
   ```bash
   supabase db push
   ```
4. **Seed an admin account** (optional helper for local QA)
   ```bash
   npm run seed:test-user
   ```

### Newsletter Edge Function

The production newsletter flow is powered by a Supabase edge function.

```bash
supabase functions deploy newsletter-subscribe --project-ref <your-project-ref>
supabase functions set-env --project-ref <your-project-ref> --env-file .env.local
```

Finally, expose the function publicly via the Supabase dashboard or CLI and ensure that the site environment variables match your deployment.

## 🧪 Testing & QA

The project ships with Playwright and API-level tests. The auth tests require a running application instance.

```bash
# Static checks
npm run lint

# API contract tests (no browser required)
npm run test

# Full E2E suite (requires a running dev server and credentials)
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 \
PLAYWRIGHT_E2E_EMAIL=admin@example.com \
PLAYWRIGHT_E2E_PASSWORD=super-secret \
npm run test:headed
```

The authentication suite is skipped automatically unless the `PLAYWRIGHT_TEST_BASE_URL` variable is present. Supply `PLAYWRIGHT_E2E_EMAIL` and `PLAYWRIGHT_E2E_PASSWORD` to exercise the happy-path login test.

## 🚀 Deployment Checklist

- ✅ Supabase migrations applied (`supabase db push`)
- ✅ Edge function `newsletter-subscribe` deployed
- ✅ Environment variables configured for the target platform
- ✅ `npm run build` completes without warnings
- ✅ `npm run test` passes (and the optional auth suite if credentials are available)

With these steps complete the Syntax and Sips application is production ready and can be deployed to Vercel, Netlify, or any Next.js compatible host.
