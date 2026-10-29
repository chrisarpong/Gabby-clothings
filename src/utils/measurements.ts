export type MeasurementValue = string | number;
export type CanonicalMeasurements = {
  top: { neck: MeasurementValue; chest: MeasurementValue; shoulder: MeasurementValue; sleeveLength: MeasurementValue; armhole: MeasurementValue; stomach: MeasurementValue; topLength: MeasurementValue };
  bottom: { trouserWaist: MeasurementValue; hips: MeasurementValue; thigh: MeasurementValue; kneeAnkle: MeasurementValue; trouserLength: MeasurementValue; crotch: MeasurementValue };
  outerwear: { agbadaLength: MeasurementValue; agbadaWidth: MeasurementValue };
};
export type FlatMeasurements = { chest: MeasurementValue; waist: MeasurementValue; hips: MeasurementValue; shoulder: MeasurementValue; sleeve: MeasurementValue; inseam: MeasurementValue; length: MeasurementValue };

const blank = (value: unknown): MeasurementValue => {
  if (value === undefined || value === null || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 300 ? value as MeasurementValue : '';
};

export function flattenMeasurements(value: unknown): FlatMeasurements {
  const source: any = value && typeof value === 'object' ? value : {};
  const nested = source.top || source.bottom || source.outerwear;
  if (!nested) return { chest: blank(source.chest), waist: blank(source.waist), hips: blank(source.hips), shoulder: blank(source.shoulder), sleeve: blank(source.sleeve), inseam: blank(source.inseam), length: blank(source.length) };
  return { chest: blank(source.top?.chest), waist: blank(source.bottom?.trouserWaist), hips: blank(source.bottom?.hips), shoulder: blank(source.top?.shoulder), sleeve: blank(source.top?.sleeveLength), inseam: blank(source.bottom?.trouserLength), length: blank(source.top?.topLength || source.outerwear?.agbadaLength) };
}

export function nestMeasurements(value: unknown): CanonicalMeasurements {
  const source: any = value && typeof value === 'object' ? value : {};
  const flat = flattenMeasurements(source);
  const existing = source.top || source.bottom || source.outerwear ? source : {};
  return {
    top: { neck: blank(existing.top?.neck), chest: flat.chest, shoulder: flat.shoulder, sleeveLength: flat.sleeve, armhole: blank(existing.top?.armhole), stomach: blank(existing.top?.stomach), topLength: flat.length },
    bottom: { trouserWaist: flat.waist, hips: flat.hips, thigh: blank(existing.bottom?.thigh), kneeAnkle: blank(existing.bottom?.kneeAnkle), trouserLength: flat.inseam, crotch: blank(existing.bottom?.crotch) },
    outerwear: { agbadaLength: blank(existing.outerwear?.agbadaLength), agbadaWidth: blank(existing.outerwear?.agbadaWidth) },
  };
}

