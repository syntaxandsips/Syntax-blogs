import { Metadata } from 'next'
import { getActiveModels } from '@/lib/prompt-gallery/queries'
import { PageShell, PageHero } from '@/components/ui/PageLayout'
import { PromptUploadWizard } from '@/components/prompt-gallery/PromptUploadWizard'

export const metadata: Metadata = {
  title: 'Upload Prompt | Syntax & Sips',
  description: 'Share your go-to prompts with the Syntax & Sips community and help others ship faster.',
}

export default async function PromptUploadPage() {
  const models = await getActiveModels()

  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Upload prompt"
          title="Contribute to the gallery"
          description="Document your prompt, attach reference media, and tag the models you used so others can remix with confidence."
        />
      }
    >
      <PromptUploadWizard models={models} />
    </PageShell>
  )
}

