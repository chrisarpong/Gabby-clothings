import { mutation } from "./_generated/server";

// Run this once to insert 18 luxury sample products for testing.
// Trigger from the Convex dashboard: Functions → seed:seedProducts → Run
export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleProducts = [
      // ── BESPOKE AGBADA (5) ──
      {
        name: "Royal Ivory Agbada",
        slug: "royal-ivory-agbada",
        price: 850.0,
        description:
          "A regal three-piece Agbada set in pristine ivory with intricate gold thread embroidery. The grand outer robe features hand-stitched geometric motifs inspired by Ashanti Adinkra symbols, paired with a fitted Dashiki and flowing Sokoto trousers.",
        productInfo:
          "Material: Premium embroidered cotton-silk blend. Includes: Grand Agbada, Dashiki, and Sokoto. Care: Professional dry clean only. Custom sizing available.",
        returnPolicy:
          "Returns accepted within 14 days for unworn items in original packaging. Custom pieces are final sale. Refunds processed within 5–7 business days.",
        shippingInfo:
          "Standard delivery: 3–5 business days (GH₵ 15). Express: 1–2 days (GH₵ 30). Free shipping on orders above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "custom" as const,
        inStock: true,
        stock: 8,
      },
      {
        name: "Midnight Blue Agbada",
        slug: "midnight-blue-agbada",
        price: 920.0,
        description:
          "A commanding midnight blue Agbada with silver metallic embroidery cascading from the neckline. Designed for grand occasions — weddings, festivals, and state events.",
        productInfo:
          "Material: Cotton-polyester blend with metallic thread detailing. Three-piece set. Care: Dry clean only.",
        returnPolicy:
          "Returns within 14 days for unworn items. Custom orders are final sale.",
        shippingInfo:
          "Standard delivery: 3–5 business days. Free shipping above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "custom" as const,
        inStock: true,
        stock: 6,
      },
      {
        name: "Champagne Grand Agbada",
        slug: "champagne-grand-agbada",
        price: 1100.0,
        description:
          "The pinnacle of ceremonial dressing — a champagne-gold Agbada with hand-embroidered floral motifs across the chest and sleeves. Worn by royalty and dignitaries.",
        productInfo:
          "Material: Luxe guinea brocade with gold lace overlay. Three-piece. Care: Professional dry clean.",
        returnPolicy:
          "Final sale on all bespoke orders. Ready-to-wear returns within 14 days.",
        shippingInfo:
          "Standard: 3–5 days. Express available. Free shipping above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1590330297626-d7aff25a0431?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "custom" as const,
        inStock: true,
        stock: 4,
      },
      {
        name: "Emerald Embroidered Agbada",
        slug: "emerald-embroidered-agbada",
        price: 780.0,
        description:
          "A rich emerald green Agbada with tonal embroidery that catches light naturally. Perfect for evening ceremonies and cultural celebrations.",
        productInfo:
          "Material: Fine cotton with satin-stitch embroidery. Three-piece set. Care: Hand wash cold or dry clean.",
        returnPolicy:
          "Returns within 14 days for unworn items in original packaging.",
        shippingInfo:
          "Standard: 3–5 business days (GH₵ 15). Free shipping above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "custom" as const,
        inStock: true,
        stock: 10,
      },
      {
        name: "Onyx Black Agbada",
        slug: "onyx-black-agbada",
        price: 950.0,
        description:
          "A sleek, all-black Agbada with subtle tonal embroidery for the modern gentleman. Understated luxury that commands attention through craftsmanship.",
        productInfo:
          "Material: Italian cashmere blend. Three-piece set. Care: Dry clean only.",
        returnPolicy:
          "Returns within 14 days. Custom sizing is final sale.",
        shippingInfo:
          "Standard: 3–5 days. Express: 1–2 days. Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1590330297626-d7aff25a0431?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "custom" as const,
        inStock: true,
        stock: 5,
      },

      // ── TAILORED SUITS (4) ──
      {
        name: "Charcoal Pinstripe Suit",
        slug: "charcoal-pinstripe-suit",
        price: 650.0,
        description:
          "A sharply tailored two-piece suit in charcoal with subtle pinstripes. Half-canvas construction for a natural drape that moulds to your frame over time.",
        productInfo:
          "Material: 100% Super 120s merino wool. Half-canvas. Jacket and trousers. Care: Dry clean only.",
        returnPolicy:
          "Returns within 14 days for unaltered items. Bespoke alterations are final sale.",
        shippingInfo:
          "Standard: 3–5 business days. Free on orders above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "ready-to-wear" as const,
        inStock: true,
        stock: 15,
      },
      {
        name: "Navy Double-Breasted Suit",
        slug: "navy-double-breasted-suit",
        price: 720.0,
        description:
          "A classic navy double-breasted suit with peak lapels and gold-tone buttons. Power dressing with a vintage edge for the boardroom or black-tie events.",
        productInfo:
          "Material: Italian wool-mohair blend. Peak lapels. Fully lined. Care: Dry clean only.",
        returnPolicy:
          "Returns within 14 days for unaltered items.",
        shippingInfo:
          "Standard: 3–5 days. Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "ready-to-wear" as const,
        inStock: true,
        stock: 12,
      },
      {
        name: "Tailored Pleated Trousers",
        slug: "tailored-pleated-trousers",
        price: 280.0,
        description:
          "Expertly crafted from premium Italian wool blend, these tailored pleated trousers combine elegance with comfort. High-rise waistband, double forward pleats, tapered leg.",
        productInfo:
          "Material: 80% Virgin Wool, 20% Polyester. Care: Dry clean only. True to size.",
        returnPolicy:
          "Returns within 14 days for unworn items in original packaging.",
        shippingInfo:
          "Standard: 3–5 days (GH₵ 15). Express: 1–2 days (GH₵ 30). Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "ready-to-wear" as const,
        inStock: true,
        stock: 25,
      },
      {
        name: "Ivory Linen Suit",
        slug: "ivory-linen-suit",
        price: 580.0,
        description:
          "A relaxed-fit summer suit in premium Italian linen. Unlined construction keeps you cool, while the structured shoulders maintain a polished silhouette.",
        productInfo:
          "Material: 100% Italian linen. Unlined. Notch lapel. Care: Dry clean recommended.",
        returnPolicy:
          "Returns within 14 days for unworn items.",
        shippingInfo:
          "Standard: 3–5 days. Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "ready-to-wear" as const,
        inStock: true,
        stock: 10,
      },

      // ── PREMIUM KAFTANS (5) ──
      {
        name: "Sahara Gold Kaftan",
        slug: "sahara-gold-kaftan",
        price: 420.0,
        description:
          "A flowing kaftan in rich gold with intricate neckline embroidery. Effortless luxury for Friday prayers, brunch, or relaxed evening gatherings.",
        productInfo:
          "Material: Premium cotton-silk blend. Relaxed fit. Care: Hand wash or dry clean.",
        returnPolicy:
          "Returns within 14 days for unworn items.",
        shippingInfo:
          "Standard: 3–5 business days. Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1590330297626-d7aff25a0431?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "ready-to-wear" as const,
        inStock: true,
        stock: 18,
      },
      {
        name: "Slate Grey Moroccan Kaftan",
        slug: "slate-grey-moroccan-kaftan",
        price: 380.0,
        description:
          "A minimal Moroccan-inspired kaftan in muted slate grey. Clean lines, hidden side pockets, and a collarless neckline with braided trim.",
        productInfo:
          "Material: Linen-cotton blend. Ankle-length. Care: Machine wash cold.",
        returnPolicy:
          "Returns within 14 days for unworn items.",
        shippingInfo:
          "Standard: 3–5 days. Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "ready-to-wear" as const,
        inStock: true,
        stock: 20,
      },
      {
        name: "Terracotta Embroidered Kaftan",
        slug: "terracotta-embroidered-kaftan",
        price: 450.0,
        description:
          "A warm terracotta kaftan with white contrast embroidery running down the front panel. Statement dressing for cultural events and summer celebrations.",
        productInfo:
          "Material: Premium cotton with hand embroidery. Relaxed fit. Care: Dry clean recommended.",
        returnPolicy:
          "Returns within 14 days for unworn items.",
        shippingInfo:
          "Standard: 3–5 days (GH₵ 15). Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1590330297626-d7aff25a0431?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "ready-to-wear" as const,
        inStock: true,
        stock: 14,
      },
      {
        name: "Pearl White Senator Kaftan",
        slug: "pearl-white-senator-kaftan",
        price: 350.0,
        description:
          "A crisp pearl white kaftan in the classic Senator style. Mandarin collar with covered buttons and tailored fit through the torso.",
        productInfo:
          "Material: 100% cotton poplin. Senator collar. Care: Machine wash cold, iron on medium.",
        returnPolicy:
          "Returns within 14 days for unworn items.",
        shippingInfo:
          "Standard: 3–5 days. Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "ready-to-wear" as const,
        inStock: true,
        stock: 22,
      },
      {
        name: "Forest Green Kaftan Set",
        slug: "forest-green-kaftan-set",
        price: 480.0,
        description:
          "A two-piece kaftan set in deep forest green. The long-sleeve top features geometric embroidery and pairs with matching straight-leg trousers.",
        productInfo:
          "Material: Cotton-linen blend. Two-piece set. Care: Hand wash or dry clean.",
        returnPolicy:
          "Returns within 14 days for unworn items.",
        shippingInfo:
          "Standard: 3–5 days. Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?q=80&w=800&auto=format&fit=crop",
        ],
        category: "men",
        type: "ready-to-wear" as const,
        inStock: true,
        stock: 12,
      },

      // ── EVENING GOWNS (4) ──
      {
        name: "Silk Midnight Evening Gown",
        slug: "silk-midnight-evening-gown",
        price: 1200.0,
        description:
          "A breathtaking floor-length gown in midnight blue silk with hand-draped bodice and flowing train. Delicate crystal beading along the neckline catches every flicker of light.",
        productInfo:
          "Material: 100% Mulberry Silk. Fully lined in silk charmeuse. Care: Professional dry clean only.",
        returnPolicy:
          "Returns within 14 days for unworn items. Custom gowns are final sale.",
        shippingInfo:
          "Standard: 3–5 days. International shipping available. Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
        ],
        category: "women",
        type: "custom" as const,
        inStock: true,
        stock: 5,
      },
      {
        name: "Champagne Sequin Gown",
        slug: "champagne-sequin-gown",
        price: 1500.0,
        description:
          "A show-stopping champagne gown encrusted with hand-sewn sequins from bodice to hem. Features a plunging V-back and subtle fishtail silhouette.",
        productInfo:
          "Material: Tulle base with allover sequin embellishment. Boned bodice. Care: Dry clean only.",
        returnPolicy:
          "Final sale on all bespoke gowns. Ready-to-wear returns within 14 days.",
        shippingInfo:
          "Standard: 3–5 days. Express available. Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
        ],
        category: "women",
        type: "custom" as const,
        inStock: true,
        stock: 3,
      },
      {
        name: "Emerald Velvet Evening Dress",
        slug: "emerald-velvet-evening-dress",
        price: 890.0,
        description:
          "A rich emerald velvet evening dress with an asymmetric one-shoulder neckline. The draped skirt falls to the floor with a thigh-high slit for dramatic movement.",
        productInfo:
          "Material: Stretch velvet with silk lining. One-shoulder. Care: Professional dry clean.",
        returnPolicy:
          "Returns within 14 days for unworn items.",
        shippingInfo:
          "Standard: 3–5 days. Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
        ],
        category: "women",
        type: "custom" as const,
        inStock: true,
        stock: 6,
      },
      {
        name: "Blush Pink Tulle Gown",
        slug: "blush-pink-tulle-gown",
        price: 1050.0,
        description:
          "A romantic blush pink gown with layers of soft tulle creating an ethereal, cloud-like silhouette. Embroidered floral appliqués adorn the fitted bodice.",
        productInfo:
          "Material: Tulle over satin with lace appliqué bodice. Boned corset. Care: Professional dry clean.",
        returnPolicy:
          "Returns within 14 days for unworn items. Custom sizing is final sale.",
        shippingInfo:
          "Standard: 3–5 days. Free above GH₵ 500.",
        images: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
        ],
        category: "women",
        type: "custom" as const,
        inStock: true,
        stock: 4,
      },
    ];

    const ids = [];
    for (const product of sampleProducts) {
      const id = await ctx.db.insert("products", product);
      ids.push(id);
    }

    return ids;
  },
});
