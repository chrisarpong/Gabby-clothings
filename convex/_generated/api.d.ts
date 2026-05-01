/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as appointments from "../appointments.js";
import type * as cart from "../cart.js";
import type * as contact from "../contact.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as newsletter from "../newsletter.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as promotions from "../promotions.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as users from "../users.js";
import type * as wishlist from "../wishlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  appointments: typeof appointments;
  cart: typeof cart;
  contact: typeof contact;
  crons: typeof crons;
  files: typeof files;
  http: typeof http;
  newsletter: typeof newsletter;
  orders: typeof orders;
  products: typeof products;
  promotions: typeof promotions;
  reviews: typeof reviews;
  seed: typeof seed;
  settings: typeof settings;
  users: typeof users;
  wishlist: typeof wishlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
