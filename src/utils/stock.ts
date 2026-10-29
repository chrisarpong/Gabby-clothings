export function getAvailableStock(item: any): number {
  const product = item?.product;
  if (!product) return 0;
  if (item.variantSku === "custom") return 99;
  if (product.variants?.length) {
    if (!item.variantSku) return 0;
    const variant = product.variants.find((v: any) => v.sku === item.variantSku);
    return variant ? Math.max(0, Number(variant.stock) || 0) : 0;
  }
  if (item.variantSku === undefined || item.variantSku === product.sku) return Math.max(0, Number(product.stock) || 0);
  return 0;
}
