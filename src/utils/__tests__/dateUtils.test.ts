import { describe, it, expect } from 'vitest';
import { formatLocalDate, addDaysLocal } from '../dateUtils';

describe('dateUtils', () => {
  it('formats a Date object using local calendar components', () => {
    const localDate = new Date(2026, 2, 5, 23, 55, 0); // March 5, 2026 23:55 local time
    expect(formatLocalDate(localDate)).toBe('2026-03-05');
  });

  it('returns YYYY-MM-DD strings untouched without UTC day shift', () => {
    expect(formatLocalDate('2026-01-01')).toBe('2026-01-01');
    expect(formatLocalDate('  2026-12-31  ')).toBe('2026-12-31');
  });

  it('adds and subtracts days accurately across month boundaries', () => {
    const feb28 = new Date(2026, 1, 28, 12, 0, 0);
    expect(addDaysLocal(1, feb28)).toBe('2026-03-01');
    expect(addDaysLocal(-1, feb28)).toBe('2026-02-27');
  });
});
