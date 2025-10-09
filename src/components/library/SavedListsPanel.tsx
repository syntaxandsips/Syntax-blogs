import Link from 'next/link'
import type { SavedList } from '@/utils/types'

interface SavedListsPanelProps {
  savedLists: SavedList[]
}

export function SavedListsPanel({ savedLists }: SavedListsPanelProps) {
  return (
    <section className="space-y-4">
      <header className="border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black text-black">Saved community lists</h1>
        <p className="text-sm text-black/70">Inspiration curated by fellow readers. Visit their collections to explore new topics.</p>
      </header>
      {savedLists.length === 0 ? (
        <div className="rounded-[32px] border-4 border-dashed border-black/40 bg-[#FDF7FF] px-6 py-10 text-center font-semibold text-black/70">
          You haven&apos;t saved any community lists yet. Browse featured collections to discover new angles.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {savedLists.map((saved) => (
            <article
              key={saved.id}
              className="space-y-3 rounded-[32px] border-4 border-black bg-white p-6 text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]"
            >
              <div>
                <p className="text-lg font-black">{saved.listTitle}</p>
                <p className="text-sm text-black/70">By {saved.listOwnerName}</p>
              </div>
              <p className="text-sm text-black/70">{saved.listDescription ?? 'No description provided.'}</p>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{saved.listItemCount} items</span>
                <span>Saved {new Date(saved.savedAt).toLocaleDateString()}</span>
              </div>
              <Link
                href={`/me/lists/${saved.listId}`}
                className="inline-flex items-center justify-center rounded-[24px] border-4 border-black bg-[#87CEEB] px-4 py-2 font-bold text-black transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
              >
                View list
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
