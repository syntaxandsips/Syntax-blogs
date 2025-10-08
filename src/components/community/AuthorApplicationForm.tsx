'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { cn } from '@/lib/utils'
import { AuthorApplicationInput } from '@/lib/validation/community'

interface ApplicationPitchSnapshot {
  focus?: string | null
  audience?: string | null
  cadence?: string | null
  availability?: string | null
}

interface ApplicationPayloadSnapshot {
  focusAreas?: string[] | null
  publishedLinks?: string[] | null
  socialHandles?: Record<string, string | null> | null
  pitch?: ApplicationPitchSnapshot | null
  newsletterOptIn?: boolean | null
}

interface ExistingAuthorApplication {
  id?: string | null
  focus_areas?: string[] | null
  experience_level?: string | null
  current_role?: string | null
  community_participation?: string | null
  published_links?: string[] | null
  social_handles?: Record<string, string | null> | null
  writing_sample_url?: string | null
  pitch_focus?: string | null
  pitch?: ApplicationPitchSnapshot | null
  newsletter_opt_in?: boolean | null
  application_payload?: ApplicationPayloadSnapshot | null
}

interface AuthorApplicationFormProps {
  profile: {
    fullName: string
    email: string
    pronouns?: string | null
  }
  existingApplication: ExistingAuthorApplication | null
  hcaptchaSiteKey: string | null
}

interface FormState extends Omit<AuthorApplicationInput, 'captchaToken'> {
  captchaToken: string | null
}

const focusAreaOptions = [
  'Machine Learning',
  'Data Science',
  'Quantum Computing',
  'Coding Tutorials',
  'Product Reviews',
  'Video Content',
  'Indie & AAA Gaming',
]

const experienceOptions = ['Aspiring', 'Early Career', 'Mid-Level', 'Senior', 'Principal']

const defaultState: FormState = {
  fullName: '',
  email: '',
  pronouns: undefined,
  focusAreas: [],
  experienceLevel: 'Aspiring',
  currentRole: '',
  communityParticipation: '',
  publishedLinks: [],
  socialHandles: {},
  writingSampleUrl: undefined,
  pitchFocus: '',
  pitchAudience: '',
  pitchCadence: '',
  availability: '',
  consent: true,
  editorialPolicyAcknowledged: true,
  newsletterOptIn: false,
  captchaToken: null,
  existingApplicationId: undefined,
}

const toArray = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string')
  }
  return []
}

const toRecord = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object') {
    return {}
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (acc, [key, entry]) => {
      if (typeof entry === 'string' && entry.length > 0) {
        acc[key] = entry
      }
      return acc
    },
    {},
  )
}

export const AuthorApplicationForm = ({
  profile,
  existingApplication,
  hcaptchaSiteKey,
}: AuthorApplicationFormProps) => {
  const [formState, setFormState] = useState<FormState>(() => ({
    ...defaultState,
    fullName: profile.fullName,
    email: profile.email,
    pronouns: profile.pronouns ?? undefined,
  }))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [linkDraft, setLinkDraft] = useState('')
  const [socialDraftKey, setSocialDraftKey] = useState('')
  const [socialDraftUrl, setSocialDraftUrl] = useState('')
  const captchaRef = useRef<HCaptcha>(null)

  useEffect(() => {
    if (!existingApplication) return

    setFormState((previous) => ({
      ...previous,
      existingApplicationId: existingApplication.id as string | undefined,
      focusAreas: toArray(existingApplication.focus_areas ?? existingApplication.application_payload?.focusAreas),
      experienceLevel:
        (existingApplication.experience_level as string | undefined) ?? previous.experienceLevel,
      currentRole:
        (existingApplication.current_role as string | undefined) ?? previous.currentRole,
      communityParticipation:
        (existingApplication.community_participation as string | undefined) ?? previous.communityParticipation,
      publishedLinks:
        toArray(existingApplication.published_links ?? existingApplication.application_payload?.publishedLinks) ??
        previous.publishedLinks,
      socialHandles: toRecord(
        existingApplication.social_handles ?? existingApplication.application_payload?.socialHandles,
      ),
      writingSampleUrl:
        (existingApplication.writing_sample_url as string | undefined) ?? previous.writingSampleUrl,
      pitchFocus:
        (existingApplication.pitch?.focus as string | undefined) ??
        (existingApplication.application_payload?.pitch?.focus as string | undefined) ??
        previous.pitchFocus,
      pitchAudience:
        (existingApplication.pitch?.audience as string | undefined) ??
        (existingApplication.application_payload?.pitch?.audience as string | undefined) ??
        previous.pitchAudience,
      pitchCadence:
        (existingApplication.pitch?.cadence as string | undefined) ??
        (existingApplication.application_payload?.pitch?.cadence as string | undefined) ??
        previous.pitchCadence,
      availability:
        (existingApplication.pitch?.availability as string | undefined) ??
        (existingApplication.application_payload?.pitch?.availability as string | undefined) ??
        previous.availability,
      newsletterOptIn:
        Boolean(existingApplication.newsletter_opt_in ?? existingApplication.application_payload?.newsletterOptIn),
    }))
  }, [existingApplication])

  const toggleFocusArea = (area: string) => {
    setFormState((previous) => ({
      ...previous,
      focusAreas: previous.focusAreas.includes(area)
        ? previous.focusAreas.filter((entry) => entry !== area)
        : [...previous.focusAreas, area],
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!formState.captchaToken) {
      setError('Please complete the captcha challenge to continue.')
      captchaRef.current?.execute?.()
      return
    }

    setIsSubmitting(true)

    const payload: AuthorApplicationInput = {
      ...formState,
      captchaToken: formState.captchaToken,
    }

    try {
      const response = await fetch('/api/community/author-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const body = await response.json()

      if (!response.ok) {
        setError(body.error ?? 'Unable to submit your application. Please try again.')
        return
      }

      setSuccessMessage(body.message ?? 'Application submitted!')
      setFormState((previous) => ({
        ...previous,
        existingApplicationId: body.application?.id ?? previous.existingApplicationId,
        captchaToken: null,
      }))
      captchaRef.current?.resetCaptcha?.()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const disableSubmit = useMemo(() => {
    if (!formState.fullName || !formState.currentRole || !formState.pitchFocus) return true
    if (formState.focusAreas.length === 0) return true
    if (!formState.captchaToken) return true
    return isSubmitting
  }, [formState, isSubmitting])

  const addLinkDraft = () => {
    const trimmed = linkDraft.trim()
    if (!trimmed) return
    setFormState((previous) => ({
      ...previous,
      publishedLinks: Array.from(new Set([...(previous.publishedLinks ?? []), trimmed])).slice(0, 6),
    }))
    setLinkDraft('')
  }

  const addSocialDraft = () => {
    const key = socialDraftKey.trim()
    const value = socialDraftUrl.trim()
    if (!key || !value) return
    setFormState((previous) => ({
      ...previous,
      socialHandles: {
        ...(previous.socialHandles ?? {}),
        [key]: value,
      },
    }))
    setSocialDraftKey('')
    setSocialDraftUrl('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-12 grid gap-8 rounded-3xl border-4 border-[#121212] bg-[#F7F4F0] p-8 shadow-[6px_6px_0px_#121212]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="font-black uppercase tracking-wide text-[#121212]">Full name</span>
          <input
            value={formState.fullName}
            onChange={(event) => setFormState((previous) => ({ ...previous, fullName: event.target.value }))}
            className="w-full rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FF8A65]"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="font-black uppercase tracking-wide text-[#121212]">Email</span>
          <input
            value={formState.email}
            readOnly
            className="w-full cursor-not-allowed rounded-xl border-4 border-[#121212]/60 bg-[#E0DED9] px-4 py-3 text-lg font-semibold text-[#4B4B4B]"
          />
        </label>
        <label className="space-y-2">
          <span className="font-black uppercase tracking-wide text-[#121212]">Pronouns (optional)</span>
          <input
            value={formState.pronouns ?? ''}
            onChange={(event) =>
              setFormState((previous) => ({ ...previous, pronouns: event.target.value || undefined }))
            }
            className="w-full rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]"
            placeholder="they/them"
          />
        </label>
        <label className="space-y-2">
          <span className="font-black uppercase tracking-wide text-[#121212]">Experience level</span>
          <select
            value={formState.experienceLevel}
            onChange={(event) =>
              setFormState((previous) => ({ ...previous, experienceLevel: event.target.value }))
            }
            className="w-full rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]"
          >
            {experienceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="font-black uppercase tracking-wide text-[#121212]">Current role</span>
          <input
            value={formState.currentRole}
            onChange={(event) =>
              setFormState((previous) => ({ ...previous, currentRole: event.target.value }))
            }
            className="w-full rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FF5252]"
            placeholder="Senior ML engineer at Brewed AI"
            required
          />
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="font-black uppercase tracking-wide text-[#121212]">Community participation</span>
          <textarea
            value={formState.communityParticipation ?? ''}
            onChange={(event) =>
              setFormState((previous) => ({ ...previous, communityParticipation: event.target.value }))
            }
            rows={3}
            className="w-full rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FF8A65]"
            placeholder="Tell us how you engage with dev, data, or gaming communities."
          />
        </label>
      </div>

      <div className="space-y-4">
        <p className="font-black uppercase tracking-wide text-[#121212]">Focus areas</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {focusAreaOptions.map((area) => {
            const active = formState.focusAreas.includes(area)
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleFocusArea(area)}
                className={cn(
                  'rounded-xl border-4 px-4 py-3 text-left text-lg font-bold shadow-[4px_4px_0px_#121212] transition-all duration-150',
                  active
                    ? 'border-[#6C63FF] bg-[#6C63FF] text-white hover:bg-[#4F47D8]'
                    : 'border-[#121212] bg-white text-[#121212] hover:-translate-y-0.5',
                )}
              >
                {area}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="font-black uppercase tracking-wide text-[#121212]">
            Published links (add up to 6)
          </span>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={linkDraft}
              onChange={(event) => setLinkDraft(event.target.value)}
              className="flex-1 rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]"
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={addLinkDraft}
              className="rounded-xl border-4 border-[#121212] bg-[#6C63FF] px-6 py-3 text-lg font-black text-white shadow-[4px_4px_0px_#121212] transition hover:bg-[#4F47D8]"
            >
              Add link
            </button>
          </div>
          {formState.publishedLinks?.length ? (
            <ul className="space-y-2 text-sm">
              {formState.publishedLinks.map((link) => (
                <li key={link} className="flex items-center justify-between rounded-lg border border-dashed border-[#121212]/40 px-3 py-2">
                  <span className="truncate font-semibold text-[#121212]">{link}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((previous) => ({
                        ...previous,
                        publishedLinks: previous.publishedLinks.filter((entry) => entry !== link),
                      }))
                    }
                    className="text-sm font-bold uppercase text-[#FF5252] hover:text-[#C62828]"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </label>

        <div className="space-y-2">
          <span className="font-black uppercase tracking-wide text-[#121212]">
            Social handles (platform + URL)
          </span>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={socialDraftKey}
              onChange={(event) => setSocialDraftKey(event.target.value)}
              className="rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FF5252]"
              placeholder="Platform"
            />
            <input
              value={socialDraftUrl}
              onChange={(event) => setSocialDraftUrl(event.target.value)}
              className="rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FF5252]"
              placeholder="https://"
            />
            <button
              type="button"
              onClick={addSocialDraft}
              className="rounded-xl border-4 border-[#121212] bg-[#FFCF56] px-4 py-3 text-lg font-black text-[#121212] shadow-[4px_4px_0px_#121212] transition hover:bg-[#E0AE23]"
            >
              Add
            </button>
          </div>
          {Object.keys(formState.socialHandles ?? {}).length ? (
            <ul className="space-y-2 text-sm">
              {Object.entries(formState.socialHandles ?? {}).map(([platform, url]) => {
                if (typeof url !== 'string') return null

                return (
                  <li
                    key={platform}
                    className="flex items-center justify-between rounded-lg border border-dashed border-[#121212]/40 px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-[#121212]">{platform}</p>
                      <p className="text-xs text-[#4B4B4B]">{url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((previous) => {
                          const next = { ...(previous.socialHandles ?? {}) }
                          delete next[platform]
                          return { ...previous, socialHandles: next }
                        })
                      }
                      className="text-sm font-bold uppercase text-[#FF5252] hover:text-[#C62828]"
                    >
                      Remove
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>

        <label className="space-y-2">
          <span className="font-black uppercase tracking-wide text-[#121212]">Writing sample URL</span>
          <input
            value={formState.writingSampleUrl ?? ''}
            onChange={(event) =>
              setFormState((previous) => ({
                ...previous,
                writingSampleUrl: event.target.value ? event.target.value : undefined,
              }))
            }
            className="w-full rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]"
            placeholder="https://..."
          />
        </label>
      </div>

      <div className="space-y-4">
        <p className="font-black uppercase tracking-wide text-[#121212]">Your pitch</p>
        <textarea
          value={formState.pitchFocus}
          onChange={(event) =>
            setFormState((previous) => ({ ...previous, pitchFocus: event.target.value }))
          }
          rows={4}
          className="w-full rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]"
          placeholder="What themes or series do you want to brew for the Syntax & Sips community?"
          required
        />
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="font-black uppercase tracking-wide text-[#121212]">Target audience</span>
            <input
              value={formState.pitchAudience}
              onChange={(event) =>
                setFormState((previous) => ({ ...previous, pitchAudience: event.target.value }))
              }
              className="w-full rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FF8A65]"
              placeholder="e.g., early-career ML engineers"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="font-black uppercase tracking-wide text-[#121212]">Publishing cadence</span>
            <input
              value={formState.pitchCadence}
              onChange={(event) =>
                setFormState((previous) => ({ ...previous, pitchCadence: event.target.value }))
              }
              className="w-full rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FF8A65]"
              placeholder="Monthly, every other week, etc."
              required
            />
          </label>
          <label className="space-y-2">
            <span className="font-black uppercase tracking-wide text-[#121212]">Availability</span>
            <input
              value={formState.availability}
              onChange={(event) =>
                setFormState((previous) => ({ ...previous, availability: event.target.value }))
              }
              className="w-full rounded-xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FF8A65]"
              placeholder="Time commitment, deadlines, timezone"
              required
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 rounded-xl border-4 border-[#121212] bg-white px-4 py-3 shadow-[4px_4px_0px_#121212]">
          <input
            type="checkbox"
            checked={formState.consent}
            onChange={(event) =>
              setFormState((previous) => ({
                ...previous,
                consent: event.target.checked ? true : previous.consent,
              }))
            }
            required
            className="mt-1 h-5 w-5 accent-[#FF5252]"
          />
          <span className="text-sm font-semibold text-[#121212]">
            I consent to Syntax & Sips storing my application details and contacting me about the community author program.
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border-4 border-[#121212] bg-white px-4 py-3 shadow-[4px_4px_0px_#121212]">
          <input
            type="checkbox"
            checked={formState.editorialPolicyAcknowledged}
            onChange={(event) =>
              setFormState((previous) => ({
                ...previous,
                editorialPolicyAcknowledged: event.target.checked ? true : previous.editorialPolicyAcknowledged,
              }))
            }
            required
            className="mt-1 h-5 w-5 accent-[#6C63FF]"
          />
          <span className="text-sm font-semibold text-[#121212]">
            I have read and agree to follow the Syntax & Sips editorial guidelines.
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border-4 border-[#121212] bg-white px-4 py-3 shadow-[4px_4px_0px_#121212]">
          <input
            type="checkbox"
            checked={formState.newsletterOptIn}
            onChange={(event) =>
              setFormState((previous) => ({
                ...previous,
                newsletterOptIn: event.target.checked,
              }))
            }
            className="mt-1 h-5 w-5 accent-[#FFCF56]"
          />
          <span className="text-sm font-semibold text-[#121212]">
            Add me to contributor newsletters with calls for pitches, livestream invites, and publishing tips.
          </span>
        </label>
      </div>

      {hcaptchaSiteKey ? (
        <div className="flex justify-center">
          <HCaptcha
            sitekey={hcaptchaSiteKey}
            onVerify={(token) => setFormState((previous) => ({ ...previous, captchaToken: token }))}
            ref={captchaRef}
          />
        </div>
      ) : (
        <p className="rounded-xl border-4 border-dashed border-[#FF5252] bg-white px-4 py-3 text-center text-sm font-semibold text-[#FF5252]">
          hCaptcha is not configured. Add NEXT_PUBLIC_HCAPTCHA_SITE_KEY and HCAPTCHA_SECRET_KEY to enable submissions.
        </p>
      )}

      {error ? <p className="rounded-xl border-4 border-[#FF5252] bg-[#FFE6E0] px-4 py-3 font-bold text-[#C62828]">{error}</p> : null}
      {successMessage ? (
        <p className="rounded-xl border-4 border-[#4CAF50] bg-[#E8F5E9] px-4 py-3 font-bold text-[#1B5E20]">
          {successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disableSubmit}
        className={cn(
          'rounded-2xl border-4 border-[#121212] bg-[#121212] px-8 py-4 text-xl font-black uppercase tracking-wide text-white shadow-[6px_6px_0px_#FFCF56] transition-transform duration-150',
          disableSubmit ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-1 hover:shadow-[8px_8px_0px_#FFCF56]'
        )}
      >
        {isSubmitting ? 'Sending...' : 'Submit application'}
      </button>
    </form>
  )
}
