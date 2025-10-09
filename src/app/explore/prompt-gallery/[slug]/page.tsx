import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getPromptBySlug, getPromptComments } from '@/lib/prompt-gallery/queries'
import { createServerComponentClient } from '@/lib/supabase/server-client'
import { PromptDetailView } from '@/components/prompt-gallery/PromptDetailView'
import { PromptCommentsSection } from '@/components/prompt-gallery/PromptCommentsSection'
import { PageShell } from '@/components/ui/PageLayout'

interface PromptDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PromptDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const prompt = await getPromptBySlug(slug)

  if (!prompt) {
    return {
      title: 'Prompt not found | Syntax & Sips',
    }
  }

  return {
    title: `${prompt.title} | Prompt Gallery`,
    description: prompt.description ?? prompt.preview,
    openGraph: {
      title: `${prompt.title} | Syntax & Sips`,
      description: prompt.description ?? prompt.preview,
      images: prompt.thumbnailUrl ? [{ url: prompt.thumbnailUrl }] : undefined,
    },
  }
}

export default async function PromptDetailPage({ params }: PromptDetailPageProps) {
  const { slug } = await params
  const prompt = await getPromptBySlug(slug)

  if (!prompt) {
    notFound()
  }

  const comments = await getPromptComments(prompt.id)
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <PageShell>
      <div className="space-y-10">
        <PromptDetailView prompt={prompt} />
        <PromptCommentsSection promptSlug={prompt.slug} comments={comments} canComment={Boolean(user)} />
      </div>
    </PageShell>
  )
}

