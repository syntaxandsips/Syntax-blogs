import { describe, expect, it } from 'vitest'
import { parsePromptFilters, serializePromptFilters } from '@/lib/prompt-gallery/search'
import { PromptFilters } from '@/lib/prompt-gallery/types'

describe('prompt gallery search helpers', () => {
  it('parses arrays and primitives from search params', () => {
    const params = {
      media: 'image,video',
      models: 'abc,def',
      monetization: 'free,premium',
      difficulty: 'beginner,advanced',
      language: 'en,fr',
      tags: 'portrait,studio',
      visibility: 'public',
      sort: 'newest',
      q: 'midjourney',
      minDownloads: '50',
      minRating: '4.5',
    }

    const result = parsePromptFilters(params)

    expect(result.mediaTypes).toEqual(['image', 'video'])
    expect(result.modelIds).toEqual(['abc', 'def'])
    expect(result.monetization).toEqual(['free', 'premium'])
    expect(result.difficulties).toEqual(['beginner', 'advanced'])
    expect(result.languages).toEqual(['en', 'fr'])
    expect(result.tags).toEqual(['portrait', 'studio'])
    expect(result.visibility).toEqual(['public'])
    expect(result.sort).toBe('newest')
    expect(result.query).toBe('midjourney')
    expect(result.minDownloads).toBe(50)
    expect(result.minRating).toBe(4.5)
  })

  it('serializes filters into search params', () => {
    const filters: PromptFilters = {
      mediaTypes: ['video'],
      modelIds: ['xyz'],
      monetization: ['premium'],
      difficulties: ['advanced'],
      languages: ['en'],
      tags: ['cinematic'],
      visibility: ['public'],
      query: 'sora',
      sort: 'top-rated',
      minDownloads: 100,
      minRating: 4,
    }

    const params = serializePromptFilters(filters, 2)
    expect(params.get('media')).toBe('video')
    expect(params.get('models')).toBe('xyz')
    expect(params.get('monetization')).toBe('premium')
    expect(params.get('difficulty')).toBe('advanced')
    expect(params.get('language')).toBe('en')
    expect(params.get('tags')).toBe('cinematic')
    expect(params.get('visibility')).toBe('public')
    expect(params.get('q')).toBe('sora')
    expect(params.get('sort')).toBe('top-rated')
    expect(params.get('minDownloads')).toBe('100')
    expect(params.get('minRating')).toBe('4')
    expect(params.get('page')).toBe('2')
  })
})

