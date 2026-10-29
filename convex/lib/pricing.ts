export type PricedLine = { unitPesewas: number; quantity: number };

export type CartLineQuantity = {
  productId: string;
  variantSku?: string;
  quantity: number;
  [key: string]: unknown;
};

export type PricingPromo = {
  discountType: string;
  /** Fixed discounts are in GHS; percentages are percentage points. */
  discountValue: number;
  minOrderAmountPesewas?: number;
};

export function toPesewas(amountGhs: number): number {
  if (!Number.isFinite(amountGhs)) throw new Error("Money amount must be finite.");
  const pesewas = Math.round(amountGhs * 100);
  if (!Number.isSafeInteger(pesewas)) throw new Error("Money amount is outside the supported range.");
  return pesewas;
}

export function fromPesewas(amountPesewas: number): number {
  if (!Number.isSafeInteger(amountPesewas)) throw new Error("Pesewas amount must be a safe integer.");
  return amountPesewas / 100;
}

export function lineUnitPrice(product: { basePrice?: number; variants?: Array<{ sku: string; priceTotal?: number }> }, _variantSku?: string): number {
  if (typeof product.basePrice !== "number" || !Number.isFinite(product.basePrice) || product.basePrice < 0) {
    throw new Error("Product base price must be a finite, non-negative GHS amount.");
  }
  // Storefront product detail, cart, and checkout all show basePrice today.
  // Variant priceTotal exists in the model but is not displayed or charged.
  return toPesewas(product.basePrice);
}

export function validateQuantity(quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    throw new Error("Quantity must be an integer from 1 to 20.");
  }
  return quantity;
}

export function mergeAndValidateCartLines<T extends CartLineQuantity>(lines: T[]): T[] {
  const merged = new Map<string, T>();
  for (const line of lines) {
    const key = `${line.productId}\u0000${line.variantSku ?? ""}`;
    const current = merged.get(key);
    if (current) merged.set(key, { ...current, quantity: current.quantity + line.quantity });
    else merged.set(key, { ...line });
  }
  const result = [...merged.values()];
  if (result.length > 30) throw new Error("A cart may contain at most 30 distinct items.");
  for (const line of result) validateQuantity(line.quantity);
  return result;
}

function assertPesewas(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${name} must be a non-negative safe integer in pesewas.`);
}

export function computeTotals(input: {
  lines: PricedLine[];
  shippingRatePesewas: number;
  freeShippingThresholdPesewas?: number;
  promo?: PricingPromo;
}): { subtotal: number; discount: number; shipping: number; total: number } {
  if (input.lines.length > 30) throw new Error("A cart may contain at most 30 lines.");
  assertPesewas(input.shippingRatePesewas, "Shipping rate");

  let subtotal = 0;
  for (const line of input.lines) {
    assertPesewas(line.unitPesewas, "Unit price");
    validateQuantity(line.quantity);
    subtotal += line.unitPesewas * line.quantity;
    if (!Number.isSafeInteger(subtotal)) throw new Error("Cart subtotal exceeds the supported range.");
  }

  let discount = 0;
  const promo = input.promo;
  if (promo) {
    if (!Number.isFinite(promo.discountValue) || promo.discountValue < 0) {
      throw new Error("Promo discount must be finite and non-negative.");
    }
    if (promo.minOrderAmountPesewas !== undefined) {
      assertPesewas(promo.minOrderAmountPesewas, "Promo minimum order amount");
    }
    if (promo.minOrderAmountPesewas !== undefined && subtotal < promo.minOrderAmountPesewas) {
      throw new Error("Cart does not meet the promo minimum order amount.");
    }
    if (promo.discountType === "percentage") {
      if (promo.discountValue > 100) throw new Error("Percentage discount must be between 0 and 100.");
      discount = Math.round(subtotal * promo.discountValue / 100);
    } else if (promo.discountType === "fixed") {
      discount = toPesewas(promo.discountValue);
    } else {
      throw new Error("Unsupported promo discount type.");
    }
    discount = Math.min(subtotal, discount);
  }

  let shipping = input.shippingRatePesewas;
  const freeThreshold = input.freeShippingThresholdPesewas;
  if (freeThreshold !== undefined) {
    assertPesewas(freeThreshold, "Free shipping threshold");
    if (freeThreshold > 0 && subtotal >= freeThreshold) shipping = 0;
  }

  return { subtotal, discount, shipping, total: Math.max(0, subtotal - discount + shipping) };
}
