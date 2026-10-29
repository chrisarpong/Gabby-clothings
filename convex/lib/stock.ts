export type StockChange = {
  productId: string;
  variantSku?: string;
  quantity: number;
};

export type StockShortage = {
  productId: string;
  productName: string;
  variantSku: string;
  requested: number;
  available: number;
  shortage: number;
};

function isMadeToMeasure(item: StockChange): boolean {
  return item.variantSku === undefined || item.variantSku === "custom";
}

function mergeTrackedItems(items: StockChange[]): StockChange[] {
  const merged = new Map<string, StockChange>();
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Stock quantity must be a positive integer.");
    }
    if (isMadeToMeasure(item)) continue;
    if (!item.variantSku?.trim()) throw new Error("A real SKU is required for stock-tracked items.");
    const key = `${item.productId}\u0000${item.variantSku}`;
    const current = merged.get(key);
    merged.set(key, current ? { ...current, quantity: current.quantity + item.quantity } : { ...item });
  }
  return [...merged.values()];
}

function getTrackedStock(product: any, variantSku: string): number {
  if (product.variants?.length) {
    const variant = product.variants.find((candidate: any) => candidate.sku === variantSku);
    if (!variant) throw new Error(`SKU ${variantSku} does not exist for ${product.name}.`);
    return variant.stock;
  }
  if (typeof product.sku === "string" && product.sku === variantSku && typeof product.stock === "number") {
    return product.stock;
  }
  throw new Error(`SKU ${variantSku} does not exist for ${product.name}.`);
}

function getStockForItem(product: any, item: StockChange): number {
  if (item.variantSku !== undefined && item.variantSku !== "custom") {
    return getTrackedStock(product, item.variantSku);
  }
  return 0;
}

async function findShortages(ctx: any, items: StockChange[], reservedByOthers = new Map<string, number>()): Promise<StockShortage[]> {
  const shortages: StockShortage[] = [];
  for (const item of mergeTrackedItems(items)) {
    const product = await ctx.db.get(item.productId);
    if (!product) throw new Error(`Product ${item.productId} does not exist.`);
    const stock = getStockForItem(product, item);
    const key = `${item.productId}\u0000${item.variantSku}`;
    const available = Math.max(0, stock - (reservedByOthers.get(key) ?? 0));
    if (item.quantity > available) {
      shortages.push({
        productId: item.productId,
        productName: product.name,
        variantSku: item.variantSku!,
        requested: item.quantity,
        available,
        shortage: item.quantity - available,
      });
    }
  }
  return shortages;
}

export async function checkAvailability(
  ctx: any,
  items: StockChange[],
  options: { excludeUserId?: string } = {},
): Promise<StockShortage[]> {
  const now = Date.now();
  const activeReservations = await ctx.db.query("activeCheckouts")
    .filter((q: any) => q.gt(q.field("expiresAt"), now))
    .collect();
  const reservedByOthers = new Map<string, number>();
  for (const reservation of activeReservations) {
    if (options.excludeUserId && reservation.userId === options.excludeUserId) continue;
    for (const item of reservation.items) {
      if (item.variantSku === undefined || item.variantSku === "custom") continue;
      const key = `${item.productId}\u0000${item.variantSku}`;
      reservedByOthers.set(key, (reservedByOthers.get(key) ?? 0) + item.quantity);
    }
  }
  return await findShortages(ctx, items, reservedByOthers);
}

export async function apply(ctx: any, items: StockChange[]): Promise<StockShortage[]> {
  const trackedItems = mergeTrackedItems(items);
  const shortages = await findShortages(ctx, trackedItems);
  if (shortages.length > 0) return shortages;

  for (const item of trackedItems) {
    const product = await ctx.db.get(item.productId);
    if (!product) throw new Error(`Product ${item.productId} does not exist.`);
    if (product.variants?.length) {
      const variants = product.variants.map((variant: any) => variant.sku === item.variantSku
        ? { ...variant, stock: variant.stock - item.quantity }
        : variant);
      await ctx.db.patch(product._id, { variants });
    } else if (typeof product.stock === "number") {
      await ctx.db.patch(product._id, { stock: product.stock - item.quantity });
    }
  }
  return [];
}
