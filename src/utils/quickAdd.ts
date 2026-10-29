export type QuickAddAction = { kind: "add"; variantSku: string } | { kind: "navigate" };
export function getQuickAddAction(product: any): QuickAddAction {
  if (product?.variants?.length || product?.type === "showcase_template") return { kind: "navigate" };
  if (product?.type === "ready_to_wear" && product?.sku) return { kind: "add", variantSku: product.sku };
  return { kind: "navigate" };
}
