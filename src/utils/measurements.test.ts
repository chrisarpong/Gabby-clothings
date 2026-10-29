import { describe, expect, it } from 'vitest';
import { flattenMeasurements, nestMeasurements, parseMeasurement, missingMeasurements } from './measurements';

describe('measurements mapping', () => {
  it('flattens canonical fields and supports legacy flat data', () => {
    expect(flattenMeasurements({ top: { chest: '40', shoulder: '18', sleeveLength: '25', topLength: '30' }, bottom: { trouserWaist: '34', hips: '42', inseam: '32' } })).toEqual({ chest: 40, waist: 34, hips: 42, shoulder: 18, sleeve: 25, inseam: 32, length: 30 });
    expect(flattenMeasurements({ chest: '40', waist: '34', hips: '42', shoulder: '18', sleeve: '25', inseam: '32', length: '30' }).length).toBe(30);
  });
  it('nests flat fields into the canonical shape', () => {
    const nested = nestMeasurements({ chest: '40', waist: '34', hips: '42', shoulder: '18', sleeve: '25', inseam: '32', length: '30' });
    expect(nested.top.chest).toBe(40); expect(nested.bottom.trouserWaist).toBe(34); expect(nested.top.sleeveLength).toBe(25); expect(nested.bottom.inseam).toBe(32);
  });
  it('rejects values outside the documented 1..300 range', () => { expect(flattenMeasurements({ chest: '0', waist: '301' }).chest).toBe(''); expect(flattenMeasurements({ chest: '0', waist: '301' }).waist).toBe(''); });
  it('accepts quoted, unit-suffixed, and decimal values without erasing them', () => {
    expect(parseMeasurement('42"')).toBe(42); expect(parseMeasurement('42 in')).toBe(42); expect(parseMeasurement('42in')).toBe(42); expect(parseMeasurement(42.5)).toBe(42.5); expect(parseMeasurement('abc')).toBe('');
  });
  it('does not treat trouser length as inseam and reports missing fields', () => {
    expect(flattenMeasurements({ bottom: { trouserLength: '40', trouserWaist: '34', hips: '42' } }).inseam).toBe('');
    expect(missingMeasurements({ top: { chest: '40' } })).toContain('inseam');
  });
});
