"use client"

import { useEffect, useMemo, useState } from "react"
import { Coins, Info, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTableColumnDef,
  badgeCell,
  createRowActions,
  createSelectableColumn,
  monetaryCell,
} from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createBrowserClient } from "@/lib/supabase/client"

interface PromptMonetizationRow {
  id: string
  title: string
  monetization: string
  visibility: string
  price: number | null
  updatedAt: string
}

const selectionColumn = createSelectableColumn<PromptMonetizationRow>()

const columns: DataTableColumnDef<PromptMonetizationRow>[] = [
  selectionColumn,
  {
    accessorKey: "title",
    header: "Prompt",
    cell: ({ row }) => (
      <div className="max-w-xs">
        <p className="font-black text-[#2A2A2A]">{row.original.title}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-[#2A2A2A]/50">{row.original.id.slice(0, 8)}</p>
      </div>
    ),
  },
  {
    accessorKey: "monetization",
    header: "Monetization",
    cell: ({ row }) => badgeCell(row.original.monetization === "free" ? "active" : row.original.monetization),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      row.original.price && row.original.price > 0 ? (
        monetaryCell(row.original.price)
      ) : (
        <span className="rounded-full border border-dashed border-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
          Coming soon
        </span>
      )
    ),
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
    cell: ({ row }) => (
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60">{row.original.visibility}</span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => (
      <span className="text-xs text-black/60">
        {new Date(row.original.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: createRowActions<PromptMonetizationRow>({
      onCopyId: (row) => {
        void navigator.clipboard.writeText(row.id)
        toast.success("Prompt ID copied")
      },
    }),
  },
]

export function PromptMonetizationPanel() {
  const supabase = useMemo(() => createBrowserClient(), [])
  const [rows, setRows] = useState<PromptMonetizationRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const { data, error } = await supabase
          .from("prompts")
          .select("id, title, monetization_type, price, visibility, updated_at")
          .order("updated_at", { ascending: false })
          .limit(50)

        if (error) {
          throw new Error(error.message)
        }

        const mapped: PromptMonetizationRow[] = (data ?? []).map((item) => ({
          id: item.id,
          title: item.title ?? "Untitled prompt",
          monetization: item.monetization_type ?? "free",
          visibility: item.visibility ?? "public",
          price: typeof item.price === "number" ? item.price : null,
          updatedAt: item.updated_at ?? new Date().toISOString(),
        }))

        setRows(mapped)
      } catch (error) {
        console.error("Unable to load prompt monetization data", error)
        setErrorMessage("Unable to load prompt data. Showing demo entries instead.")
        setRows(getFallbackRows())
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [supabase])

  const caption = "All prompts are currently free. Pricing controls will unlock after the monetization beta ships."

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#2A2A2A]">Prompt monetization</h1>
          <p className="text-sm text-[#2A2A2A]/70">
            Track every prompt that is eligible for pricing. Creators keep 100% of earnings during the beta.
          </p>
          {errorMessage ? (
            <p className="inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-[#FFEE88] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-black">
              <Info className="h-4 w-4" aria-hidden="true" /> {errorMessage}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                Monetization policy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="h-6 w-6 text-[#6C63FF]" aria-hidden="true" />
                  Pricing launch roadmap
                </DialogTitle>
                <DialogDescription className="space-y-3 pt-2 text-left text-sm text-black/70">
                  <p>
                    Creator payouts roll out in phases starting with tipping and community rewards. Until then every prompt must remain free.
                  </p>
                  <ul className="list-disc space-y-2 pl-5 text-left">
                    <li>Q1: enable tipping and track creator revenue shares.</li>
                    <li>Q2: introduce premium bundles with curated collections.</li>
                    <li>Q3: analytics dashboard for creator earnings and engagement.</li>
                  </ul>
                  <p className="font-semibold text-black">
                    Want early access? Email monetization@syntaxandsips.com.
                  </p>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button
            onClick={() => toast.info("Pricing controls unlock after beta launch.")}
            className="rounded-full border-2 border-black bg-[#6C63FF] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white"
          >
            Create pricing rule
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border-4 border-dashed border-black/20 bg-white">
          <div className="flex items-center gap-3 text-sm font-semibold text-black/60">
            <Coins className="h-5 w-5 animate-spin text-[#6C63FF]" aria-hidden="true" />
            Loading prompt entries…
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          caption={caption}
          filterColumnId="title"
          filterPlaceholder="Filter prompts..."
        />
      )}
    </section>
  )
}

function getFallbackRows(): PromptMonetizationRow[] {
  return [
    {
      id: "demo-1",
      title: "Product launch storyboard",
      monetization: "free",
      visibility: "public",
      price: null,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-2",
      title: "Brand voice audit workflow",
      monetization: "free",
      visibility: "public",
      price: null,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-3",
      title: "UX research note synthesizer",
      monetization: "free",
      visibility: "public",
      price: null,
      updatedAt: new Date().toISOString(),
    },
  ]
}
