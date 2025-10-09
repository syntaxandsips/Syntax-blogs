import { describe, expect, it } from 'vitest';
import {
  buildReadingHistoryPayload,
  computeScrollProgress,
  isReadingComplete,
  shouldPersistReadingHistory,
} from '@/lib/library/reading-utils';

describe('library reading utils', () => {
  it('computes scroll progress with bounds handling', () => {
    expect(computeScrollProgress(0, 1000, 500)).toBe(0);
    expect(computeScrollProgress(250, 1000, 500)).toBe(50);
    expect(computeScrollProgress(99999, 1000, 500)).toBe(100);
    expect(computeScrollProgress(-10, 1000, 500)).toBe(0);
  });

  it('determines completion with configurable threshold', () => {
    expect(isReadingComplete(94)).toBe(false);
    expect(isReadingComplete(95)).toBe(true);
    expect(isReadingComplete(80, 75)).toBe(true);
  });

  it('decides when to persist reading history for new and existing entries', () => {
    expect(
      shouldPersistReadingHistory(
        { readDurationSeconds: 4, scrollPercentage: 10, lastPosition: 0 },
        false,
      ),
    ).toBe(false);
    expect(
      shouldPersistReadingHistory(
        { readDurationSeconds: 12, scrollPercentage: 10, lastPosition: 0 },
        false,
      ),
    ).toBe(true);
    expect(
      shouldPersistReadingHistory(
        { readDurationSeconds: 3, scrollPercentage: 8, lastPosition: 0 },
        true,
      ),
    ).toBe(true);
  });

  it('builds sanitized reading history payloads', () => {
    const payload = buildReadingHistoryPayload({
      historyId: null,
      postId: 'post-id',
      readDurationSeconds: 12.8,
      scrollPercentage: 103.4,
      lastPosition: -12,
      completionThreshold: 90,
    });

    expect(payload.historyId).toBeUndefined();
    expect(payload.postId).toBe('post-id');
    expect(payload.readDurationSeconds).toBe(13);
    expect(payload.scrollPercentage).toBe(100);
    expect(payload.lastPosition).toBe(0);
    expect(payload.completed).toBe(true);
  });
});
