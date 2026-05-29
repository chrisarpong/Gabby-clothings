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
import type * as authHelper from "../authHelper.js";
import type * as crons from "../crons.js";
import type * as email from "../email.js";
import type * as googleCalendar from "../googleCalendar.js";
import type * as messages from "../messages.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as promotions from "../promotions.js";
import type * as reviews from "../reviews.js";
import type * as settings from "../settings.js";
import type * as subscribers from "../subscribers.js";
import type * as temp from "../temp.js";
import type * as users from "../users.js";
import type * as wishlists from "../wishlists.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  appointments: typeof appointments;
  authHelper: typeof authHelper;
  crons: typeof crons;
  email: typeof email;
  googleCalendar: typeof googleCalendar;
  messages: typeof messages;
  orders: typeof orders;
  products: typeof products;
  promotions: typeof promotions;
  reviews: typeof reviews;
  settings: typeof settings;
  subscribers: typeof subscribers;
  temp: typeof temp;
  users: typeof users;
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
