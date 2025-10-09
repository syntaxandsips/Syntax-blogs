interface ResponsesPanelProps {
  responsesCount: number
}

export function ResponsesPanel({ responsesCount }: ResponsesPanelProps) {
  return (
    <section className="space-y-4">
      <header className="border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black text-black">Responses</h1>
        <p className="text-sm text-black/70">
          Comment management is coming soon. For now you can review your discussions directly on each article.
        </p>
      </header>
      <div className="rounded-[32px] border-4 border-dashed border-black/40 bg-[#FDF7FF] px-6 py-10 text-center font-semibold text-black/70">
        You&apos;ve shared {responsesCount} responses so far. We&apos;ll surface them here once the responses center is live.
      </div>
    </section>
  )
}
