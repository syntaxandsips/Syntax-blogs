import { redirect } from 'next/navigation'

interface LegacyPromptDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function LegacyPromptDetailPage({ params }: LegacyPromptDetailPageProps) {
  const { slug } = await params
  redirect(`/explore/prompt-gallery/${slug}`)
}
