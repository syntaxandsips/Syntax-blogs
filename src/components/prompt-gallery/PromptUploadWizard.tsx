'use client'

import { useMemo, useState, useTransition } from 'react'
import { PromptModel } from '@/lib/prompt-gallery/types'
import { CreatePromptInput } from '@/lib/prompt-gallery/validation'

interface PromptUploadWizardProps {
  models: PromptModel[]
}

const mediaOptions: CreatePromptInput['mediaType'][] = ['text', 'image', 'video', 'audio', '3d', 'workflow']
const monetizationOptions: CreatePromptInput['monetizationType'][] = ['free', 'tip-enabled', 'premium']
const difficultyOptions: CreatePromptInput['difficulty'][] = ['beginner', 'intermediate', 'advanced']
const visibilityOptions: CreatePromptInput['visibility'][] = ['public', 'unlisted', 'draft']

export function PromptUploadWizard({ models }: PromptUploadWizardProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, startTransition] = useTransition()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const initialState: CreatePromptInput = {
    title: '',
    description: '',
    promptText: '',
    negativePrompt: '',
    parameters: {},
    mediaType: 'text',
    monetizationType: 'free',
    difficulty: 'beginner',
    language: 'en',
    license: 'CC0',
    visibility: 'public',
    price: null,
    primaryModelId: models[0]?.id ?? '',
    secondaryModelIds: [],
    tags: [],
    assets: [],
  }

  const [formData, setFormData] = useState<CreatePromptInput>(initialState)

  const canContinue = useMemo(() => {
    if (step === 1) {
      return formData.title.trim().length >= 4 && Boolean(formData.primaryModelId)
    }

    if (step === 2) {
      return formData.promptText.trim().length >= 10
    }

    if (step === 3) {
      return true
    }

    if (step === 4) {
      return formData.primaryModelId.length > 0
    }

    return true
  }, [formData, step])

  const updateField = <Key extends keyof CreatePromptInput>(key: Key, value: CreatePromptInput[Key]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const addAsset = () => {
    updateField('assets', [
      ...(formData.assets ?? []),
      {
        file_url: '',
        asset_type: 'image' as const,
        display_order: (formData.assets?.length ?? 0) + 1,
      },
    ])
  }

  const updateAsset = (index: number, key: 'file_url' | 'thumbnail_url' | 'asset_type', value: string) => {
    const nextAssets = [...(formData.assets ?? [])]
    const target = nextAssets[index] ?? {
      file_url: '',
      asset_type: 'image' as const,
      display_order: index,
    }
    nextAssets[index] = {
      ...target,
      [key]: value,
      display_order: target.display_order ?? index,
    }
    updateField('assets', nextAssets)
  }

  const removeAsset = (index: number) => {
    const nextAssets = [...(formData.assets ?? [])]
    nextAssets.splice(index, 1)
    updateField('assets', nextAssets)
  }

  const toggleSecondaryModel = (id: string) => {
    const next = new Set(formData.secondaryModelIds ?? [])
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    updateField('secondaryModelIds', Array.from(next))
  }

  const submitPrompt = async () => {
    setErrorMessage(null)
    setStatusMessage(null)

    startTransition(async () => {
      try {
        const payload = {
          ...formData,
          assets: (formData.assets ?? [])
            .filter((asset) => asset.file_url && asset.file_url.trim().length > 0)
            .map((asset, index) => ({
              ...asset,
              display_order: index,
            })),
          tags: (formData.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
        }

        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.error ?? 'Unable to publish prompt.')
        }

        setStatusMessage('Prompt submitted for review! We will publish it once moderation is complete.')
        setStep(1)
        setFormData({
          ...initialState,
          primaryModelId: payload.primaryModelId,
        })
      } catch (error) {
        console.error(error)
        setErrorMessage(error instanceof Error ? error.message : 'Unable to publish prompt right now.')
      }
    })
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Title</label>
              <input
                value={formData.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Give your prompt a name"
                className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Description</label>
              <textarea
                value={formData.description ?? ''}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Describe what makes this prompt special"
                className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Media type</label>
                <select
                  value={formData.mediaType}
                  onChange={(event) => updateField('mediaType', event.target.value as CreatePromptInput['mediaType'])}
                  className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
                >
                  {mediaOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(event) => updateField('difficulty', event.target.value as CreatePromptInput['difficulty'])}
                  className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
                >
                  {difficultyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Language</label>
                <input
                  value={formData.language}
                  onChange={(event) => updateField('language', event.target.value)}
                  className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Monetization</label>
                <select
                  value={formData.monetizationType}
                  onChange={(event) => updateField('monetizationType', event.target.value as CreatePromptInput['monetizationType'])}
                  className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
                >
                  {monetizationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(event) => updateField('visibility', event.target.value as CreatePromptInput['visibility'])}
                  className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
                >
                  {visibilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Price (optional)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.price ?? ''}
                  onChange={(event) => updateField('price', event.target.value ? Number(event.target.value) : null)}
                  className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Prompt text</label>
              <textarea
                value={formData.promptText}
                onChange={(event) => updateField('promptText', event.target.value)}
                className="mt-2 w-full min-h-[160px] rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Negative prompt (optional)</label>
              <textarea
                value={formData.negativePrompt ?? ''}
                onChange={(event) => updateField('negativePrompt', event.target.value)}
                className="mt-2 w-full min-h-[120px] rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Parameters (JSON)</label>
              <textarea
                value={JSON.stringify(formData.parameters ?? {}, null, 2)}
                onChange={(event) => {
                  try {
                    const parsed = JSON.parse(event.target.value || '{}')
                    updateField('parameters', parsed)
                    setErrorMessage(null)
                  } catch {
                    setErrorMessage('Parameters must be valid JSON.')
                  }
                }}
                className="mt-2 w-full min-h-[140px] rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black/70">Reference media</h3>
              <button
                type="button"
                onClick={addAsset}
                className="rounded-full border-2 border-black bg-[#FFCA3A] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[3px_3px_0_rgba(0,0,0,0.15)]"
              >
                Add asset
              </button>
            </div>
            {(formData.assets ?? []).map((asset, index) => (
              <div key={index} className="rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_rgba(0,0,0,0.12)]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">File URL</label>
                    <input
                      value={asset.file_url}
                      onChange={(event) => updateAsset(index, 'file_url', event.target.value)}
                      className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Thumbnail URL</label>
                    <input
                      value={asset.thumbnail_url ?? ''}
                      onChange={(event) => updateAsset(index, 'thumbnail_url', event.target.value)}
                      className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => removeAsset(index)}
                    className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-black"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {!formData.assets?.length ? (
              <p className="text-sm text-black/60">Add reference URLs to showcase the results of your prompt.</p>
            ) : null}
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Primary model</label>
              <select
                value={formData.primaryModelId}
                onChange={(event) => updateField('primaryModelId', event.target.value)}
                className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.display_name} ({model.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Secondary models</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {models.map((model) => (
                  <label key={model.id} className="flex items-center gap-2 rounded-2xl border-2 border-black bg-white px-3 py-2 text-sm shadow-[3px_3px_0_rgba(0,0,0,0.12)]">
                    <input
                      type="checkbox"
                      checked={formData.secondaryModelIds?.includes(model.id) ?? false}
                      onChange={() => toggleSecondaryModel(model.id)}
                      className="h-4 w-4"
                    />
                    <span>{model.display_name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Tags</label>
              <input
                value={(formData.tags ?? []).join(', ')}
                onChange={(event) => updateField('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))}
                placeholder="marketing, cinematic, launch, ..."
                className="mt-2 w-full rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm shadow-[4px_4px_0_rgba(0,0,0,0.12)] focus:outline-none"
              />
              <p className="mt-2 text-xs text-black/60">Separate tags with commas. Max 12 tags.</p>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black/70">Review</h3>
            <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_rgba(0,0,0,0.12)]">
              <p className="text-base font-black text-black">{formData.title}</p>
              <p className="mt-1 text-sm text-black/70">{formData.description}</p>
              <ul className="mt-3 space-y-1 text-sm text-black/80">
                <li>Primary model: {models.find((model) => model.id === formData.primaryModelId)?.display_name ?? 'Not selected'}</li>
                <li>Secondary models: {(formData.secondaryModelIds ?? []).length || 'None'}</li>
                <li>Tags: {(formData.tags ?? []).join(', ') || 'None'}</li>
                <li>Visibility: {formData.visibility}</li>
                <li>Monetization: {formData.monetizationType}</li>
              </ul>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border-4 border-black bg-[#F9F7FF] p-6 shadow-[12px_12px_0_rgba(0,0,0,0.08)]">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-black/60">Upload wizard</p>
        <h2 className="text-2xl font-black text-black">Share a new prompt</h2>
        <p className="text-sm text-black/70">
          Walk through the guided flow to add media context, parameters, and tags so the community can remix your ideas.
        </p>
      </header>

      {!models.length ? (
        <div className="rounded-2xl border-2 border-black bg-[#FFADAD] px-4 py-3 text-sm font-semibold text-black">
          No active AI models are configured yet. Ask an admin to add models before submitting prompts.
        </div>
      ) : null}

      {statusMessage ? (
        <div className="rounded-2xl border-2 border-black bg-[#B9FBC0] px-4 py-3 text-sm font-semibold text-black">
          {statusMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border-2 border-black bg-[#FFADAD] px-4 py-3 text-sm font-semibold text-black">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-black/60">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full ${index + 1 <= step ? 'bg-[#6C63FF]' : 'bg-black/10'}`}
          />
        ))}
      </div>

      {renderStep()}

      <footer className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(1, current - 1))}
          disabled={step === 1 || isSubmitting}
          className="rounded-2xl border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep((current) => Math.min(5, current + 1))}
            disabled={!canContinue}
            className="rounded-2xl border-2 border-black bg-[#6C63FF] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={submitPrompt}
            disabled={isSubmitting}
            className="rounded-2xl border-2 border-black bg-[#6C63FF] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? 'Publishing…' : 'Submit for review'}
          </button>
        )}
      </footer>
    </div>
  )
}

