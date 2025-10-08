export interface PrimaryNavItem {
  label: string
  href: string
}

export const primaryNavigation: PrimaryNavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Podcasts', href: '/podcasts' },
  { label: 'Changelog', href: '/changelog' },
]
