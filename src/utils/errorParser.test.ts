import { describe, it, expect } from 'vitest';
import { parseConvexError } from './errorParser';

describe('parseConvexError', () => {
  it('parses raw ConvexError string with JSON payload and stack trace', () => {
    const raw = `[CONVEX A(staffAuthNode:loginAction)] [Request ID: aaf3d27992b1bbf0] Server Error
Uncaught ConvexError: {"code":"UNAUTHENTICATED","message":"Invalid email or password"}
    at handler (:3000/convex/staffAuthNode.ts:57:15)
Called by client`;

    const parsed = parseConvexError(raw);
    expect(parsed).toBe('Invalid email or password. Please check your credentials and try again.');
  });

  it('parses ConvexError with direct data object', () => {
    const err = {
      data: {
        code: 'UNAUTHENTICATED',
        message: 'Invalid email or password',
      },
    };
    const parsed = parseConvexError(err);
    expect(parsed).toBe('Invalid email or password. Please check your credentials and try again.');
  });

  it('parses ConvexError with direct string in data', () => {
    const err = {
      data: 'Account is deactivated',
    };
    const parsed = parseConvexError(err);
    expect(parsed).toBe('This staff account has been deactivated. Please contact your administrator.');
  });

  it('parses Uncaught Error with stack trace', () => {
    const raw = `[CONVEX M(orders:create)] Server Error
Uncaught Error: Out of stock for item Agbada Deluxe
    at handler (convex/orders.ts:120:10)`;

    const parsed = parseConvexError(raw);
    expect(parsed).toBe('Out of stock for item Agbada Deluxe');
  });

  it('handles null/undefined gracefully with fallback', () => {
    expect(parseConvexError(null)).toBe('An unexpected error occurred.');
    expect(parseConvexError(undefined, 'Custom fallback')).toBe('Custom fallback');
  });

  it('maps known error codes to friendly strings when message is missing', () => {
    expect(parseConvexError({ data: { code: 'TOO_MANY_REQUESTS' } })).toContain('Too many login attempts');
    expect(parseConvexError({ data: { code: 'FORBIDDEN' } })).toContain('You do not have permission');
  });
});
