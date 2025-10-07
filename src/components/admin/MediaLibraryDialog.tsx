"use client"

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react'

export interface MediaAsset {
  id: string
  name: string
  url: string
  createdAt: string
  size: number
}

interface MediaLibraryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (asset: MediaAsset) => void
}

export function MediaLibraryDialog({ open, onOpenChange, onSelect }: MediaLibraryDialogProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const fetchAssets = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/media', { cache: 'no-store' })
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to load media library.')
        }

        setAssets(payload.assets ?? [])
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchAssets()
  }, [open])

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const input = form.elements.namedItem('file') as HTMLInputElement | null
    const file = input?.files?.[0]

    if (!file) {
      setUploadError('Please select an image to upload.')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to upload image.')
      }

      const asset = payload.asset as MediaAsset
      setAssets((prev) => [asset, ...prev])
      form.reset()
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Unable to upload image. Please try again.',
      )
    } finally {
      setIsUploading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (!bytes || Number.isNaN(bytes)) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed inset-0 z-50 m-auto flex h-[90vh] w-[min(960px,95vw)] flex-col overflow-hidden rounded-xl border-4 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between border-b-4 border-black bg-[#2A2A2A] px-6 py-4 text-white">
            <Dialog.Title className="text-lg font-black uppercase tracking-wide">
              Media Library
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-white/20 p-1.5 transition hover:bg-white/10"
                aria-label="Close media library"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[280px_1fr]">
            <form onSubmit={handleUpload} className="space-y-4 rounded-lg border-2 border-dashed border-[#2A2A2A]/40 bg-[#F9FAFB] p-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full border-2 border-[#6C63FF]/20 bg-[#6C63FF]/10 p-3 text-[#6C63FF]">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#2A2A2A]">Upload new image</p>
                  <p className="text-xs text-[#2A2A2A]/70">
                    PNG, JPG, GIF, SVG, or WebP up to 5 MB.
                  </p>
                </div>
              </div>
              <input
                type="file"
                name="file"
                accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                className="w-full text-sm"
              />
              {uploadError && (
                <p className="rounded-md border-2 border-red-500/30 bg-red-50 p-2 text-sm font-semibold text-red-600">
                  {uploadError}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-md bg-black px-4 py-2 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isUploading}
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                  </span>
                ) : (
                  'Upload'
                )}
              </button>
            </form>

            <div className="flex flex-col gap-4 overflow-hidden">
              {isLoading ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#2A2A2A]/30 p-6 text-center text-[#2A2A2A]/70">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Loading media assets...
                </div>
              ) : assets.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#2A2A2A]/30 p-6 text-center text-[#2A2A2A]/70">
                  <ImageIcon className="h-8 w-8" />
                  <p className="max-w-sm text-sm">
                    No images uploaded yet. Use the uploader to add high-quality visuals to your posts.
                  </p>
                </div>
              ) : (
                <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        onSelect(asset)
                        onOpenChange(false)
                      }}
                      className="group flex flex-col overflow-hidden rounded-lg border-2 border-[#2A2A2A]/20 bg-white text-left shadow-sm transition hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-[#F9FAFB]">
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="space-y-1 p-3 text-sm">
                        <p className="line-clamp-2 font-semibold text-[#2A2A2A]">{asset.name}</p>
                        <p className="text-xs uppercase tracking-wide text-[#2A2A2A]/60">
                          {new Date(asset.createdAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-[#2A2A2A]/70">{formatSize(asset.size)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
