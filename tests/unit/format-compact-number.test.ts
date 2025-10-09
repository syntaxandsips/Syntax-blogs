import { describe, expect, it } from 'vitest';
import { formatCompactNumber } from '@/lib/utils';

describe('formatCompactNumber', () => {
  it('formats small values without notation changes', () => {
    expect(formatCompactNumber(42)).toBe('42');
  });

  it('formats large numbers using compact notation', () => {
    expect(formatCompactNumber(1500)).toBe('1.5K');
    expect(formatCompactNumber(2_500_000)).toBe('2.5M');
  });

  it('returns 0 when value is not finite', () => {
    expect(formatCompactNumber(Number.POSITIVE_INFINITY)).toBe('0');
    expect(formatCompactNumber(Number.NaN)).toBe('0');
  });
});
