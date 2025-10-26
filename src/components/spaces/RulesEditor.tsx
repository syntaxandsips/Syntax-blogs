'use client'

interface SpaceRule {
  id: string
  title: string
  body: string
  kind: string
  position: number
}

interface RulesEditorProps {
  rules: SpaceRule[]
  canEdit: boolean
}

export const RulesEditor = ({ rules, canEdit }: RulesEditorProps) => {
  return (
    <section className="rounded-3xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase text-black">Space guidelines</h2>
        {canEdit ? (
          <span className="rounded-md border-2 border-black bg-[#FFD166] px-3 py-1 text-xs font-extrabold uppercase text-black">
            Editing enabled
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-black/70">
        Keep your space welcoming by outlining expectations, flair metadata, and automation rules. Edits are audited and roll
        out instantly to new members.
      </p>

      <ol className="mt-6 space-y-3">
        {rules.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-black px-4 py-3 text-sm text-black/60">
            No rules configured yet. Add at least one guideline before enabling public discovery.
          </p>
        ) : (
          rules
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((rule, index) => (
              <li key={rule.id} className="rounded-xl border-2 border-black bg-[#F9F9F9] p-4">
                <span className="text-xs font-bold uppercase tracking-wide text-black/50">Rule {index + 1}</span>
                <h3 className="text-lg font-semibold text-black">{rule.title}</h3>
                <p className="text-sm text-black/75">{rule.body}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-black/50">Kind: {rule.kind}</p>
              </li>
            ))
        )}
      </ol>
    </section>
  )
}
