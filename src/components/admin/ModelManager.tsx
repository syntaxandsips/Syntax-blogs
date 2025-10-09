'use client'

import { useMemo, useState } from 'react'
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  Power,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AdminModelCategory,
  AdminModelSummary,
  CreateAdminModelPayload,
  UpdateAdminModelPayload,
} from '@/utils/types'
import {
  neoInputClass,
  neoSelectClass,
  neoTextareaClass,
  neoBadgeClass,
  neoCardClass,
} from '@/components/ui/neobrutalistFieldStyles'

interface ModelManagerProps {
  categories: AdminModelCategory[]
  models: AdminModelSummary[]
  isLoading: boolean
  isMutating: boolean
  onRefreshModels: () => Promise<boolean>
  onRefreshCategories: () => Promise<boolean>
  onCreateCategory: (payload: {
    name: string
    slug?: string
    description?: string | null
    accentColor?: string | null
  }) => Promise<boolean>
  onUpdateCategory: (
    id: string,
    payload: {
      name?: string
      slug?: string
      description?: string | null
      accentColor?: string | null
    },
  ) => Promise<boolean>
  onDeleteCategory: (id: string) => Promise<boolean>
  onCreateModel: (payload: CreateAdminModelPayload) => Promise<boolean>
  onUpdateModel: (id: string, payload: UpdateAdminModelPayload) => Promise<boolean>
  onDeleteModel: (id: string) => Promise<boolean>
  onToggleModelStatus: (id: string, isActive: boolean) => Promise<boolean>
}

interface ModelFormState {
  name: string
  displayName: string
  categoryId: string
  provider: string
  family: string
  version: string
  description: string
  iconUrl: string
  parametersSchema: string
  isActive: boolean
}

const defaultModelForm: ModelFormState = {
  name: '',
  displayName: '',
  categoryId: '',
  provider: '',
  family: '',
  version: '',
  description: '',
  iconUrl: '',
  parametersSchema: '',
  isActive: true,
}

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const parseParametersSchema = (value: string): { data: Record<string, unknown> | null; error?: string } => {
  const trimmed = value.trim()
  if (!trimmed) {
    return { data: null }
  }

  try {
    const parsed = JSON.parse(trimmed)
    if (typeof parsed !== 'object' || parsed === null) {
      return { data: null }
    }
    return { data: parsed as Record<string, unknown> }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    }
  }
}

export function ModelManager({
  categories,
  models,
  isLoading,
  isMutating,
  onRefreshCategories,
  onRefreshModels,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateModel,
  onUpdateModel,
  onDeleteModel,
  onToggleModelStatus,
}: ModelManagerProps) {
  const [categoryName, setCategoryName] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [categoryAccent, setCategoryAccent] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryDrafts, setCategoryDrafts] = useState<
    Record<string, { name: string; slug: string; description: string; accentColor: string }>
  >({})

  const [modelForm, setModelForm] = useState<ModelFormState>(defaultModelForm)
  const [editingModelId, setEditingModelId] = useState<string | null>(null)
  const [modelDrafts, setModelDrafts] = useState<Record<string, ModelFormState>>({})
  const [createParametersError, setCreateParametersError] = useState<string | null>(null)
  const [editParameterErrors, setEditParameterErrors] = useState<Record<string, string | null>>({})

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  )

  const sortedModels = useMemo(
    () => [...models].sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [models],
  )

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = categoryName.trim()
    const slug = (categorySlug.trim() || normalizeSlug(categoryName)).trim()

    if (!name) {
      return
    }

    const success = await onCreateCategory({
      name,
      slug,
      description: categoryDescription.trim() || null,
      accentColor: categoryAccent.trim() || null,
    })

    if (success) {
      setCategoryName('')
      setCategorySlug('')
      setCategoryDescription('')
      setCategoryAccent('')
    }
  }

  const handleStartEditCategory = (category: AdminModelCategory) => {
    setEditingCategoryId(category.id)
    setCategoryDrafts((prev) => ({
      ...prev,
      [category.id]: {
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        accentColor: category.accentColor ?? '',
      },
    }))
  }

  const handleCategoryDraftChange = (
    id: string,
    field: 'name' | 'slug' | 'description' | 'accentColor',
    value: string,
  ) => {
    setCategoryDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { name: '', slug: '', description: '', accentColor: '' }),
        [field]: field === 'slug' ? normalizeSlug(value) : value,
      },
    }))
  }

  const handleSaveCategory = async (id: string) => {
    const draft = categoryDrafts[id]
    if (!draft) return

    const success = await onUpdateCategory(id, {
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      description: draft.description.trim() || null,
      accentColor: draft.accentColor.trim() || null,
    })

    if (success) {
      setEditingCategoryId(null)
      setCategoryDrafts((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const handleCreateModel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = modelForm.name.trim() || modelForm.displayName
    const displayName = modelForm.displayName.trim()

    if (!displayName) {
      return
    }

    const { data, error } = parseParametersSchema(modelForm.parametersSchema)
    if (error) {
      setCreateParametersError(error)
      return
    }

    setCreateParametersError(null)

    const success = await onCreateModel({
      name,
      displayName,
      categoryId: modelForm.categoryId || undefined,
      provider: modelForm.provider.trim() || undefined,
      family: modelForm.family.trim() || undefined,
      version: modelForm.version.trim() || undefined,
      description: modelForm.description.trim() || undefined,
      iconUrl: modelForm.iconUrl.trim() || undefined,
      parametersSchema: data,
      isActive: modelForm.isActive,
    })

    if (success) {
      setModelForm(defaultModelForm)
    }
  }

  const handleStartEditModel = (model: AdminModelSummary) => {
    setEditingModelId(model.id)
    setEditParameterErrors((prev) => ({
      ...prev,
      [model.id]: null,
    }))
    setModelDrafts((prev) => ({
      ...prev,
      [model.id]: {
        name: model.name,
        displayName: model.displayName,
        categoryId: model.categoryId ?? '',
        provider: model.provider ?? '',
        family: model.family ?? '',
        version: model.version ?? '',
        description: model.description ?? '',
        iconUrl: model.iconUrl ?? '',
        parametersSchema: model.parametersSchema
          ? JSON.stringify(model.parametersSchema, null, 2)
          : '',
        isActive: model.isActive,
      },
    }))
  }

  const handleModelDraftChange = <Key extends keyof ModelFormState>(
    id: string,
    key: Key,
    value: ModelFormState[Key],
  ) => {
    setModelDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? defaultModelForm),
        [key]: value,
      },
    }))
  }

  const handleSaveModel = async (id: string) => {
    const draft = modelDrafts[id]
    if (!draft) return

    const name = draft.name.trim() || draft.displayName
    const displayName = draft.displayName.trim()

    if (!displayName) {
      return
    }

    const { data, error } = parseParametersSchema(draft.parametersSchema)
    if (error) {
      setEditParameterErrors((prev) => ({
        ...prev,
        [id]: error,
      }))
      return
    }

    const success = await onUpdateModel(id, {
      name,
      displayName,
      categoryId: draft.categoryId || undefined,
      provider: draft.provider.trim() || undefined,
      family: draft.family.trim() || undefined,
      version: draft.version.trim() || undefined,
      description: draft.description.trim() || undefined,
      iconUrl: draft.iconUrl.trim() || undefined,
      parametersSchema: data,
      isActive: draft.isActive,
    })

    if (success) {
      setEditParameterErrors((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setEditingModelId(null)
      setModelDrafts((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-black/60">AI Model Directory</p>
        <h2 className="text-3xl font-black text-black">Curate families, providers, and deployment targets</h2>
        <p className="max-w-3xl text-sm text-black/70">
          Keep the prompt gallery grounded in real tooling by mapping every workflow to a provider, model family, and curated
          category. Administrators can add new models, organize them into themed collections, and toggle availability without
          touching code.
        </p>
      </header>

      <div
        className={`${neoCardClass} bg-[#FFF5D6] text-sm font-semibold text-black shadow-[12px_12px_0_rgba(0,0,0,0.08)]`}
      >
        <p>
          Add a category for each modality, then register the models that power your prompts. Capture the provider and family so
          creators can confidently pick the right stack in the upload wizard.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            void onRefreshModels()
          }}
          className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#B9FBC0] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[5px_5px_0_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_rgba(0,0,0,0.18)]"
          disabled={isMutating}
        >
          <RefreshCcw className="h-4 w-4" /> Refresh models
        </button>
        <button
          type="button"
          onClick={() => {
            void onRefreshCategories()
          }}
          className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFE066] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[5px_5px_0_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_rgba(0,0,0,0.18)]"
          disabled={isMutating}
        >
          <RefreshCcw className="h-4 w-4" /> Refresh categories
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-3xl border-2 border-dashed border-black/20 bg-white/70 px-4 py-3 text-sm font-semibold text-black/70 shadow-[6px_6px_0_rgba(0,0,0,0.08)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading the latest model catalog…
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
        <section className="space-y-6">
          <form onSubmit={handleCreateCategory} className={`${neoCardClass} space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-black">Create category</h3>
              <Plus className="h-5 w-5 text-[#6C63FF]" />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Name</label>
              <input
                value={categoryName}
                onChange={(event) => {
                  setCategoryName(event.target.value)
                  if (!categorySlug.trim()) {
                    setCategorySlug(normalizeSlug(event.target.value))
                  }
                }}
                className={`mt-2 ${neoInputClass}`}
                placeholder="Image generation"
                disabled={isMutating}
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Slug</label>
              <input
                value={categorySlug}
                onChange={(event) => setCategorySlug(normalizeSlug(event.target.value))}
                className={`mt-2 ${neoInputClass}`}
                placeholder="image-generation"
                disabled={isMutating}
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Description</label>
              <textarea
                value={categoryDescription}
                onChange={(event) => setCategoryDescription(event.target.value)}
                className={`mt-2 ${neoTextareaClass} min-h-[120px]`}
                placeholder="Short blurb to explain when to use this category."
                disabled={isMutating}
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Accent color</label>
              <input
                value={categoryAccent}
                onChange={(event) => setCategoryAccent(event.target.value)}
                className={`mt-2 ${neoInputClass}`}
                placeholder="#6C63FF"
                disabled={isMutating}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-black bg-[#6C63FF] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[5px_5px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isMutating || !categoryName.trim()}
            >
              <Plus className="h-4 w-4" /> Save category
            </button>
          </form>

          <div className="space-y-4">
            {sortedCategories.length === 0 ? (
              <div className={`${neoCardClass} text-sm font-semibold text-black/70`}>
                No categories yet. Create one to cluster related models.
              </div>
            ) : (
              sortedCategories.map((category) => {
                const draft = categoryDrafts[category.id]
                const isEditing = editingCategoryId === category.id

                return (
                  <div key={category.id} className={`${neoCardClass} space-y-3`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="text-lg font-black text-black">{category.name}</h4>
                        <p className="text-xs uppercase tracking-[0.2em] text-black/50">/{category.slug}</p>
                        {category.description ? (
                          <p className="text-sm text-black/70">{category.description}</p>
                        ) : null}
                        {category.accentColor ? (
                          <span className={`${neoBadgeClass} mt-1 bg-white/80`}>Accent {category.accentColor}</span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => (isEditing ? handleSaveCategory(category.id) : handleStartEditCategory(category))}
                          className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isMutating}
                        >
                          {isEditing ? (
                            <>
                              <Save className="mr-1 h-4 w-4" /> Save
                            </>
                          ) : (
                            <>
                              <Pencil className="mr-1 h-4 w-4" /> Edit
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void onDeleteCategory(category.id)
                          }}
                          className="inline-flex items-center justify-center rounded-full border-2 border-black bg-[#FFADAD] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isMutating}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="grid gap-3">
                        <div>
                          <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Name</label>
                          <input
                            value={draft?.name ?? ''}
                            onChange={(event) => handleCategoryDraftChange(category.id, 'name', event.target.value)}
                            className={`mt-2 ${neoInputClass}`}
                            disabled={isMutating}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Slug</label>
                          <input
                            value={draft?.slug ?? ''}
                            onChange={(event) => handleCategoryDraftChange(category.id, 'slug', event.target.value)}
                            className={`mt-2 ${neoInputClass}`}
                            disabled={isMutating}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Description</label>
                          <textarea
                            value={draft?.description ?? ''}
                            onChange={(event) => handleCategoryDraftChange(category.id, 'description', event.target.value)}
                            className={`mt-2 ${neoTextareaClass} min-h-[100px]`}
                            disabled={isMutating}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Accent color</label>
                          <input
                            value={draft?.accentColor ?? ''}
                            onChange={(event) => handleCategoryDraftChange(category.id, 'accentColor', event.target.value)}
                            className={`mt-2 ${neoInputClass}`}
                            disabled={isMutating}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>
        </section>

        <section className="space-y-6">
          <form onSubmit={handleCreateModel} className={`${neoCardClass} space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-black">Register model</h3>
              <Plus className="h-5 w-5 text-[#FF5252]" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Display name</label>
                <input
                  value={modelForm.displayName}
                  onChange={(event) =>
                    setModelForm((prev) => ({ ...prev, displayName: event.target.value }))
                  }
                  className={`mt-2 ${neoInputClass}`}
                  placeholder="Stable Diffusion XL"
                  disabled={isMutating}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">System name</label>
                <input
                  value={modelForm.name}
                  onChange={(event) =>
                    setModelForm((prev) => ({ ...prev, name: normalizeSlug(event.target.value) }))
                  }
                  className={`mt-2 ${neoInputClass}`}
                  placeholder="stable-diffusion-xl"
                  disabled={isMutating}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Provider</label>
                <input
                  value={modelForm.provider}
                  onChange={(event) =>
                    setModelForm((prev) => ({ ...prev, provider: event.target.value }))
                  }
                  className={`mt-2 ${neoInputClass}`}
                  placeholder="Stability AI"
                  disabled={isMutating}
                />
                <p className="mt-2 text-xs text-black/60">Name the vendor or API powering this model.</p>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Family</label>
                <input
                  value={modelForm.family}
                  onChange={(event) =>
                    setModelForm((prev) => ({ ...prev, family: event.target.value }))
                  }
                  className={`mt-2 ${neoInputClass}`}
                  placeholder="diffusion"
                  disabled={isMutating}
                />
                <p className="mt-2 text-xs text-black/60">Group related deployments (LLM, diffusion, audio, etc.).</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Version</label>
                <input
                  value={modelForm.version}
                  onChange={(event) =>
                    setModelForm((prev) => ({ ...prev, version: event.target.value }))
                  }
                  className={`mt-2 ${neoInputClass}`}
                  placeholder="1.0"
                  disabled={isMutating}
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Category</label>
                <select
                  value={modelForm.categoryId}
                  onChange={(event) =>
                    setModelForm((prev) => ({ ...prev, categoryId: event.target.value }))
                  }
                  className={`mt-2 ${neoSelectClass}`}
                  disabled={isMutating}
                >
                  <option value="">Uncategorized</option>
                  {sortedCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {sortedCategories.length === 0 ? (
                  <p className="mt-2 text-xs text-black/60">
                    Create a category on the left to group similar providers; new models stay uncategorized until then.
                  </p>
                ) : null}
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Description</label>
              <textarea
                value={modelForm.description}
                onChange={(event) =>
                  setModelForm((prev) => ({ ...prev, description: event.target.value }))
                }
                className={`mt-2 ${neoTextareaClass} min-h-[120px]`}
                placeholder="Where does this model shine? Include typical prompts or guidance."
                disabled={isMutating}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Icon URL</label>
                <input
                  value={modelForm.iconUrl}
                  onChange={(event) =>
                    setModelForm((prev) => ({ ...prev, iconUrl: event.target.value }))
                  }
                  className={`mt-2 ${neoInputClass}`}
                  placeholder="https://..."
                  disabled={isMutating}
                />
              </div>
              <div className="flex items-end justify-between">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Active</label>
                <button
                  type="button"
                  onClick={() =>
                    setModelForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                  }
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-[0.2em] shadow-[5px_5px_0_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_rgba(0,0,0,0.2)]',
                    modelForm.isActive ? 'bg-[#B9FBC0] text-black' : 'bg-[#FFADAD] text-black',
                  )}
                  disabled={isMutating}
                >
                  <Power className="h-4 w-4" /> {modelForm.isActive ? 'Enabled' : 'Paused'}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Parameters schema (JSON)</label>
              <textarea
                value={modelForm.parametersSchema}
                onChange={(event) => setModelForm((prev) => ({ ...prev, parametersSchema: event.target.value }))}
                className={`mt-2 ${neoTextareaClass} min-h-[140px] font-mono`}
                placeholder='{ "cfg_scale": 7 }'
                disabled={isMutating}
              />
            </div>
            {createParametersError ? (
              <p className="text-sm font-semibold text-[#FF5252]">{createParametersError}</p>
            ) : null}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-black bg-[#6C63FF] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[5px_5px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isMutating || !modelForm.displayName.trim()}
            >
              <Plus className="h-4 w-4" /> Publish model
            </button>
          </form>

          <div className="space-y-5">
            {sortedModels.length === 0 ? (
              <div className={`${neoCardClass} text-sm font-semibold text-black/70`}>
                No models registered. Add your first provider above to unlock the prompt submission wizard.
              </div>
            ) : (
              sortedModels.map((model) => {
                const draft = modelDrafts[model.id]
                const isEditing = editingModelId === model.id

                return (
                  <div key={model.id} className={`${neoCardClass} space-y-4`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xl font-black text-black">{model.displayName}</h4>
                          <span
                            className={cn(
                              neoBadgeClass,
                              model.isActive ? 'bg-[#B9FBC0]' : 'bg-[#FFADAD]',
                              'text-black',
                            )}
                          >
                            {model.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
                          {model.provider ? <span>{model.provider}</span> : null}
                          {model.family ? <span>{model.family}</span> : null}
                          {model.version ? <span>v{model.version}</span> : null}
                          {model.categoryName ? <span>#{model.categoryName}</span> : null}
                        </div>
                        {model.description ? (
                          <p className="text-sm text-black/70">{model.description}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void onToggleModelStatus(model.id, !model.isActive)
                          }}
                          className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isMutating}
                        >
                          <Power className="mr-1 h-4 w-4" /> {model.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => (isEditing ? handleSaveModel(model.id) : handleStartEditModel(model))}
                          className="inline-flex items-center justify-center rounded-full border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isMutating}
                        >
                          {isEditing ? (
                            <>
                              <Save className="mr-1 h-4 w-4" /> Save
                            </>
                          ) : (
                            <>
                              <Pencil className="mr-1 h-4 w-4" /> Edit
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void onDeleteModel(model.id)
                          }}
                          className="inline-flex items-center justify-center rounded-full border-2 border-black bg-[#FFADAD] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isMutating}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Display name</label>
                            <input
                              value={draft?.displayName ?? ''}
                              onChange={(event) =>
                                handleModelDraftChange(model.id, 'displayName', event.target.value)
                              }
                              className={`mt-2 ${neoInputClass}`}
                              disabled={isMutating}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">System name</label>
                            <input
                              value={draft?.name ?? ''}
                              onChange={(event) =>
                                handleModelDraftChange(model.id, 'name', normalizeSlug(event.target.value))
                              }
                              className={`mt-2 ${neoInputClass}`}
                              disabled={isMutating}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Provider</label>
                            <input
                              value={draft?.provider ?? ''}
                              onChange={(event) =>
                                handleModelDraftChange(model.id, 'provider', event.target.value)
                              }
                              className={`mt-2 ${neoInputClass}`}
                              disabled={isMutating}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Family</label>
                            <input
                              value={draft?.family ?? ''}
                              onChange={(event) =>
                                handleModelDraftChange(model.id, 'family', event.target.value)
                              }
                              className={`mt-2 ${neoInputClass}`}
                              disabled={isMutating}
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Version</label>
                            <input
                              value={draft?.version ?? ''}
                              onChange={(event) =>
                                handleModelDraftChange(model.id, 'version', event.target.value)
                              }
                              className={`mt-2 ${neoInputClass}`}
                              disabled={isMutating}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Category</label>
                            <select
                              value={draft?.categoryId ?? ''}
                              onChange={(event) =>
                                handleModelDraftChange(model.id, 'categoryId', event.target.value)
                              }
                              className={`mt-2 ${neoSelectClass}`}
                              disabled={isMutating}
                            >
                              <option value="">Uncategorized</option>
                              {sortedCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Description</label>
                          <textarea
                            value={draft?.description ?? ''}
                            onChange={(event) =>
                              handleModelDraftChange(model.id, 'description', event.target.value)
                            }
                            className={`mt-2 ${neoTextareaClass} min-h-[120px]`}
                            disabled={isMutating}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Icon URL</label>
                            <input
                              value={draft?.iconUrl ?? ''}
                              onChange={(event) =>
                                handleModelDraftChange(model.id, 'iconUrl', event.target.value)
                              }
                              className={`mt-2 ${neoInputClass}`}
                              disabled={isMutating}
                            />
                          </div>
                          <div className="flex items-end justify-between">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Active</label>
                            <button
                              type="button"
                              onClick={() =>
                                handleModelDraftChange(model.id, 'isActive', !(draft?.isActive ?? false))
                              }
                              className={cn(
                                'inline-flex items-center gap-2 rounded-full border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-[0.2em] shadow-[5px_5px_0_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_rgba(0,0,0,0.2)]',
                                draft?.isActive ? 'bg-[#B9FBC0] text-black' : 'bg-[#FFADAD] text-black',
                              )}
                              disabled={isMutating}
                            >
                              <Power className="h-4 w-4" /> {draft?.isActive ? 'Enabled' : 'Paused'}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Parameters schema (JSON)</label>
                          <textarea
                            value={draft?.parametersSchema ?? ''}
                            onChange={(event) =>
                              handleModelDraftChange(model.id, 'parametersSchema', event.target.value)
                            }
                            className={`mt-2 ${neoTextareaClass} min-h-[140px] font-mono`}
                            disabled={isMutating}
                          />
                        </div>
                        {editParameterErrors[model.id] ? (
                          <p className="text-sm font-semibold text-[#FF5252]">{editParameterErrors[model.id]}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
