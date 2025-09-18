import { describe, it, expect } from 'vitest';
import { hasCapacity } from '../lib/capacity';

describe('hasCapacity', () => {
  it('returns true when enough capacity', () => {
    expect(hasCapacity(3, 2, 6)).toBe(true);
  });
  it('returns false when exceeding capacity', () => {
    expect(hasCapacity(5, 2, 6)).toBe(false);
  });
  it('allows exactly full capacity', () => {
    expect(hasCapacity(4, 2, 6)).toBe(true);
  });
});
