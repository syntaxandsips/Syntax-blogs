'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Download, Copy, Share2 } from 'lucide-react'
import { PromptDetail } from '@/lib/prompt-gallery/types'

interface PromptDetailViewProps {
  prompt: PromptDetail
}

export function PromptDetailView({ prompt }: PromptDetailViewProps) {
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!status) return
    const timeout = window.setTimeout(() => setStatus(null), 2500)
    return () => window.clearTimeout(timeout)
  }, [status])

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.promptText)
      setStatus('Prompt copied to clipboard!')
    } catch (error) {
      console.error('Unable to copy prompt', error)
      setStatus('Unable to copy prompt. Try again.')
    }
  }

  const downloadPrompt = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            title: prompt.title,
            prompt: prompt.promptText,
            negativePrompt: prompt.negativePrompt,
            parameters: prompt.parameters,
            models: prompt.models,
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    )

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${prompt.slug}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    setStatus('Prompt JSON downloaded!')
  }

  const sharePrompt = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt.title,
          text: prompt.description ?? prompt.promptText.slice(0, 140),
          url: window.location.href,
        })
      } catch (error) {
        console.error('Unable to share prompt', error)
      }
    } else {
      copyPrompt()
    }
  }

  return (
    <div className="space-y-8">
      {status ? (
        <div className="rounded-3xl border-4 border-black bg-[#A0C4FF] px-6 py-3 text-sm font-semibold text-black shadow-[6px_6px_0_rgba(0,0,0,0.15)]">
          {status}
        </div>
      ) : null}

      <header className="rounded-3xl border-4 border-black bg-white p-8 shadow-[12px_12px_0_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
          <div className="relative h-48 w-full overflow-hidden rounded-2xl border-2 border-black bg-[#FFE066] lg:h-64 lg:w-72">
            {prompt.thumbnailUrl ? (
              <Image src={prompt.thumbnailUrl} alt={`${prompt.title} preview`} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">✨</div>
            )}
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-black/60">{prompt.mediaType}</p>
              <h1 className="mt-2 text-3xl font-black text-black lg:text-4xl">{prompt.title}</h1>
              <p className="mt-3 text-base text-black/70">{prompt.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyPrompt}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-[#FFCA3A] px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-black shadow-[5px_5px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5"
              >
                <Copy className="h-4 w-4" aria-hidden="true" /> Copy prompt
              </button>
              <button
                type="button"
                onClick={downloadPrompt}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-black shadow-[5px_5px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Download JSON
              </button>
              <button
                type="button"
                onClick={sharePrompt}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-[#6C63FF] px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[5px_5px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" /> Share
              </button>
            </div>
            <dl className="grid gap-4 text-sm font-semibold text-black/70 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="uppercase tracking-[0.2em]">Creator</dt>
                <dd className="mt-1 text-base font-black text-black">{prompt.author.display_name ?? 'Community Member'}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.2em]">Difficulty</dt>
                <dd className="mt-1 text-base text-black">{prompt.difficulty}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.2em]">Language</dt>
                <dd className="mt-1 text-base text-black">{prompt.language}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.2em]">License</dt>
                <dd className="mt-1 text-base text-black">{prompt.license}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.2em]">Models</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {prompt.models.map((model) => (
                    <span key={model.id} className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs uppercase">
                      {model.display_name}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.2em]">Monetization</dt>
                <dd className="mt-1 text-base text-black">{prompt.monetizationType}</dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="rounded-3xl border-4 border-black bg-white p-6 shadow-[10px_10px_0_rgba(0,0,0,0.08)]">
          <h2 className="text-lg font-black uppercase tracking-[0.3em] text-black/70">Prompt</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl border-2 border-black bg-[#F9F7FF] p-4 text-sm leading-relaxed text-black shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
            {prompt.promptText}
          </pre>
          {prompt.negativePrompt ? (
            <div className="mt-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-black/60">Negative prompt</h3>
              <pre className="mt-2 whitespace-pre-wrap rounded-2xl border-2 border-black bg-[#FFE5EC] p-4 text-sm text-black shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
                {prompt.negativePrompt}
              </pre>
            </div>
          ) : null}
        </article>

        <aside className="space-y-4">
          <div className="rounded-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0_rgba(0,0,0,0.08)]">
            <h2 className="text-lg font-black uppercase tracking-[0.3em] text-black/70">Parameters</h2>
            <dl className="mt-4 space-y-3 text-sm text-black">
              {prompt.parameters
                ? Object.entries(prompt.parameters).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between gap-3">
                      <dt className="font-semibold uppercase tracking-[0.2em] text-black/70">{key}</dt>
                      <dd className="break-all text-right text-black">{String(value)}</dd>
                    </div>
                  ))
                : (
                    <p className="text-sm text-black/60">No additional parameters provided.</p>
                  )}
            </dl>
          </div>
          <div className="rounded-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0_rgba(0,0,0,0.08)]">
            <h2 className="text-lg font-black uppercase tracking-[0.3em] text-black/70">Stats</h2>
            <dl className="mt-4 space-y-3 text-sm text-black">
              <div className="flex items-center justify-between">
                <dt>Upvotes</dt>
                <dd className="font-black">{prompt.stats.upvotes}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Downloads</dt>
                <dd className="font-black">{prompt.stats.downloads}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Copies</dt>
                <dd className="font-black">{prompt.stats.copies}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Comments</dt>
                <dd className="font-black">{prompt.stats.comments}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>

      {prompt.assets.length ? (
        <section className="rounded-3xl border-4 border-black bg-white p-6 shadow-[10px_10px_0_rgba(0,0,0,0.08)]">
          <h2 className="text-lg font-black uppercase tracking-[0.3em] text-black/70">Reference media</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prompt.assets.map((asset) => (
              <figure key={asset.id} className="overflow-hidden rounded-2xl border-2 border-black bg-[#F9F7FF]">
                <Image src={asset.thumbnail_url ?? asset.file_url} alt="Prompt reference" width={600} height={400} className="h-48 w-full object-cover" />
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

