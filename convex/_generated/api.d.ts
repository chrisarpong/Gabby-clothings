/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminLogs from "../adminLogs.js";
import type * as analytics from "../analytics.js";
import type * as appointments from "../appointments.js";
import type * as authHelper from "../authHelper.js";
import type * as carts from "../carts.js";
import type * as catalogs from "../catalogs.js";
import type * as content from "../content.js";
import type * as crons from "../crons.js";
import type * as currency from "../currency.js";
import type * as email from "../email.js";
import type * as googleCalendar from "../googleCalendar.js";
import type * as http from "../http.js";
import type * as inventory from "../inventory.js";
import type * as messages from "../messages.js";
import type * as orders from "../orders.js";
import type * as posts from "../posts.js";
import type * as products from "../products.js";
import type * as promotions from "../promotions.js";
import type * as reviews from "../reviews.js";
import type * as settings from "../settings.js";
import type * as subscribers from "../subscribers.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";
import type * as wishlists from "../wishlists.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminLogs: typeof adminLogs;
  analytics: typeof analytics;
  appointments: typeof appointments;
  authHelper: typeof authHelper;
  carts: typeof carts;
  catalogs: typeof catalogs;
  content: typeof content;
  crons: typeof crons;
  currency: typeof currency;
  email: typeof email;
  googleCalendar: typeof googleCalendar;
  http: typeof http;
  inventory: typeof inventory;
  messages: typeof messages;
  orders: typeof orders;
  posts: typeof posts;
  products: typeof products;
  promotions: typeof promotions;
  reviews: typeof reviews;
  settings: typeof settings;
  subscribers: typeof subscribers;
  users: typeof users;
  webhooks: typeof webhooks;
  wishlists: typeof wishlists;
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
