import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, BookmarkPlus, Copy, Download, MessageCircle } from 'lucide-react'
import { PromptSummary } from '@/lib/prompt-gallery/types'
import { cn } from '@/lib/utils'

interface PromptCardProps {
  prompt: PromptSummary
  onCopy?: (prompt: PromptSummary) => void
  onBookmark?: (prompt: PromptSummary) => void
}

const mediaTypeLabel: Record<string, string> = {
  image: '🖼️ Image',
  video: '🎥 Video',
  text: '📝 Text',
  audio: '🔊 Audio',
  '3d': '🎮 3D',
  workflow: '🧩 Workflow',
}

const monetizationLabel: Record<string, string> = {
  free: 'Free',
  'tip-enabled': 'Tip-enabled',
  premium: 'Premium',
}

export function PromptCard({ prompt, onCopy, onBookmark }: PromptCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border-4 border-black bg-white shadow-[10px_10px_0px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-1">
      <div className="relative h-48 w-full overflow-hidden border-b-4 border-black bg-[#FFE066]">
        {prompt.thumbnailUrl ? (
          <Image
            src={prompt.thumbnailUrl}
            alt={`${prompt.title} preview`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">{mediaTypeLabel[prompt.mediaType] ?? '✨'}</div>
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {mediaTypeLabel[prompt.mediaType] ?? prompt.mediaType}
          </span>
          <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold uppercase text-black">
            {monetizationLabel[prompt.monetizationType] ?? prompt.monetizationType}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <header className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black leading-tight text-black">
                <Link href={`/resources/prompt-gallery/${prompt.slug}`} className="hover:underline">
                  {prompt.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-black/70">{prompt.description ?? prompt.preview}</p>
            </div>
            <Link
              href={`/resources/prompt-gallery/${prompt.slug}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-[#6C63FF] text-white shadow-[4px_4px_0_rgba(0,0,0,0.25)]"
              aria-label={`View ${prompt.title}`}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {prompt.models.map((model) => (
              <span
                key={model.id}
                className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold uppercase text-black"
              >
                {model.display_name}
              </span>
            ))}
          </div>
        </header>

        {prompt.tags.length ? (
          <ul className="flex flex-wrap gap-2">
            {prompt.tags.map((tag) => (
              <li
                key={tag.id}
                className="rounded-full border border-dashed border-black/40 px-3 py-1 text-xs font-semibold uppercase text-black/70"
              >
                #{tag.name}
              </li>
            ))}
          </ul>
        ) : null}

        <footer className="mt-auto flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-black/70">
            <span>{prompt.difficulty} • {prompt.language}</span>
            <span>{prompt.stats.upvotes} upvotes • {prompt.stats.downloads} downloads</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-sm font-semibold text-black/70">
              <div className="flex items-center gap-1">
                <Copy className="h-4 w-4" aria-hidden="true" />
                {prompt.stats.copies}
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" aria-hidden="true" />
                {prompt.stats.downloads}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {prompt.stats.comments}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onCopy?.(prompt)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold uppercase text-black transition-colors hover:bg-[#FFCA3A]',
                )}
              >
                <Copy className="h-3 w-3" aria-hidden="true" /> Copy
              </button>
              <button
                type="button"
                onClick={() => onBookmark?.(prompt)}
                className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#6C63FF] px-3 py-1 text-xs font-semibold uppercase text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5"
              >
                <BookmarkPlus className="h-3 w-3" aria-hidden="true" /> Save
              </button>
            </div>
          </div>
        </footer>
      </div>
    </article>
  )
}

