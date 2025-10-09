import { describe, expect, it } from 'vitest';
import {
  bookmarkIdentifierSchema,
  createBookmarkSchema,
  createHighlightSchema,
  createListSchema,
  recordReadingSchema,
  updateListSchema,
} from '@/lib/library/validation';

describe('library validation schemas', () => {
  it('validates list creation payloads', () => {
    const payload = createListSchema.parse({
      title: 'My List',
      description: 'Curated reads',
      slug: 'my-list',
      isPublic: true,
      coverImageUrl: 'https://example.com/cover.png',
    });

    expect(payload.slug).toBe('my-list');
    expect(() =>
      createListSchema.parse({
        title: '',
        slug: 'invalid slug',
      }),
    ).toThrow();
  });

  it('requires at least one field when updating lists', () => {
    expect(updateListSchema.safeParse({}).success).toBe(false);
    expect(updateListSchema.parse({ title: 'Updated' }).title).toBe('Updated');
  });

  it('ensures highlight ranges are valid', () => {
    const highlight = createHighlightSchema.parse({
      postId: '67a1e997-5a74-492d-9f1b-641ed0524a27',
      highlightedText: 'Inspiring quote',
      positionStart: 10,
      positionEnd: 30,
      color: '#FF69B4',
    });

    expect(highlight.color).toBe('#FF69B4');
    expect(() =>
      createHighlightSchema.parse({
        postId: '67a1e997-5a74-492d-9f1b-641ed0524a27',
        highlightedText: 'Oops',
        positionStart: 40,
        positionEnd: 20,
      }),
    ).toThrow();
  });

  it('sanitizes reading history defaults', () => {
    const reading = recordReadingSchema.parse({
      postId: '67a1e997-5a74-492d-9f1b-641ed0524a27',
    });

    expect(reading.completed).toBe(false);
    expect(reading.lastPosition).toBe(0);
  });

  it('rejects invalid bookmark identifiers', () => {
    expect(() => bookmarkIdentifierSchema.parse({ bookmarkId: '123' })).toThrow();
    const bookmark = createBookmarkSchema.parse({
      postId: '67a1e997-5a74-492d-9f1b-641ed0524a27',
    });
    expect(bookmark.postId).toMatch(/^[0-9a-f-]+$/i);
  });
});
