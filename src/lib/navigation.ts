export interface NavigationItem {
  label: string
  href: string
  description?: string
}

export interface NavigationSection {
  title: string
  items: NavigationItem[]
}

export interface NavigationCategory {
  label: string
  description?: string
  sections: NavigationSection[]
}

export const topLevelNavigation: NavigationItem[] = [
  {
    label: 'Home',
    href: '/',
    description: 'Return to the Syntax & Sips landing page.',
  },
]

export const navigationCategories: NavigationCategory[] = [
  {
    label: 'Explore',
    description: 'Dive into stories, shows, and learning paths curated by the Syntax & Sips team.',
    sections: [
      {
        title: 'Editorial',
        items: [
          {
            label: 'Blogs',
            href: '/blogs',
            description: 'Read curated insights, experiments, and interviews from the crew.',
          },
          {
            label: 'Topics',
            href: '/topics',
            description: 'Explore articles grouped by discipline, industry, and experience level.',
          },
          {
            label: 'Changelog',
            href: '/changelog',
            description: 'Catch up on weekly platform improvements and release notes.',
          },
        ],
      },
      {
        title: 'Shows & Media',
        items: [
          {
            label: 'Podcasts',
            href: '/podcasts',
            description: 'Listen to the Syntax & Sips brew while you code or commute.',
          },
          {
            label: 'Videos',
            href: '/videos',
            description: 'Watch livestream replays, workshops, and visual explainers.',
          },
        ],
      },
      {
        title: 'Learning',
        items: [
          {
            label: 'Tutorials',
            href: '/tutorials',
            description: 'Follow step-by-step builds that level up your technical toolkit.',
          },
          {
            label: 'Docs',
            href: '/docs',
            description: 'Reference architecture notes, APIs, and contributor guidelines.',
          },
        ],
      },
    ],
  },
  {
    label: 'Resources',
    description: 'Programs, downloads, and community touchpoints to keep you shipping.',
    sections: [
      {
        title: 'Community & Programs',
        items: [
          {
            label: 'Creator Program',
            href: '/creator',
            description: 'Partner with Syntax & Sips to publish long-form pieces and shows.',
          },
          {
            label: 'Apply as a Contributor',
            href: '/apply',
            description: 'Pitch story ideas and join the editorial contributor roster.',
          },
          {
            label: 'Roadmap',
            href: '/roadmap',
            description: 'See what features, series, and community perks launch next.',
          },
        ],
      },
      {
        title: 'Tools & Downloads',
        items: [
          {
            label: 'Resources Hub',
            href: '/resources',
            description: 'Download templates, cheat sheets, and engineering accelerators.',
          },
          {
            label: 'Newsletter',
            href: '/newsletter',
            description: 'Subscribe for weekly digests, jobs, and behind-the-scenes notes.',
          },
        ],
      },
    ],
  },
  {
    label: 'Support',
    description: 'Stay informed about policies, account access, and platform health.',
    sections: [
      {
        title: 'Policy Center',
        items: [
          {
            label: 'Privacy Policy',
            href: '/privacy',
            description: 'Understand how we safeguard and process your personal data.',
          },
          {
            label: 'Terms of Use',
            href: '/terms',
            description: 'Review the participation guidelines for the Syntax & Sips community.',
          },
          {
            label: 'Cookie Policy',
            href: '/cookies',
            description: 'Learn how tracking works and adjust your preference center.',
          },
          {
            label: 'Editorial Disclaimer',
            href: '/disclaimer',
            description: 'Read the scope and limitations of our tutorials and commentary.',
          },
        ],
      },
      {
        title: 'Account',
        items: [
          {
            label: 'Sign in',
            href: '/login',
            description: 'Access your dashboard, badges, and personalized recommendations.',
          },
          {
            label: 'Create an account',
            href: '/signup',
            description: 'Join Syntax & Sips to earn XP, submit ideas, and save progress.',
          },
        ],
      },
    ],
  },
]

export const siteNavigationItems: NavigationItem[] = Array.from(
  new Map(
    [...topLevelNavigation, ...navigationCategories.flatMap((category) => category.sections.flatMap((section) => section.items))].map((item) => [
      item.href,
      item,
    ]),
  ).values(),
)
