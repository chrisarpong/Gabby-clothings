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
import type * as checkout from "../checkout.js";
import type * as content from "../content.js";
import type * as crons from "../crons.js";
import type * as currency from "../currency.js";
import type * as designer from "../designer.js";
import type * as email from "../email.js";
import type * as googleCalendar from "../googleCalendar.js";
import type * as http from "../http.js";
import type * as inventory from "../inventory.js";
import type * as lib_orderNumber from "../lib/orderNumber.js";
import type * as lib_paymentIssues from "../lib/paymentIssues.js";
import type * as lib_paystack from "../lib/paystack.js";
import type * as lib_pricing from "../lib/pricing.js";
import type * as lib_staffCrypto from "../lib/staffCrypto.js";
import type * as lib_stock from "../lib/stock.js";
import type * as maintenance from "../maintenance.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as orderActivity from "../orderActivity.js";
import type * as orders from "../orders.js";
import type * as paymentIssues from "../paymentIssues.js";
import type * as payments from "../payments.js";
import type * as posts from "../posts.js";
import type * as products from "../products.js";
import type * as promotions from "../promotions.js";
import type * as reviews from "../reviews.js";
import type * as settings from "../settings.js";
import type * as sms from "../sms.js";
import type * as staffAuth from "../staffAuth.js";
import type * as staffAuthNode from "../staffAuthNode.js";
import type * as staffNotifications from "../staffNotifications.js";
import type * as staffPermissions from "../staffPermissions.js";
import type * as subscribers from "../subscribers.js";
import type * as tailors from "../tailors.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";
import type * as wipeData from "../wipeData.js";
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
  checkout: typeof checkout;
  content: typeof content;
  crons: typeof crons;
  currency: typeof currency;
  designer: typeof designer;
  email: typeof email;
  googleCalendar: typeof googleCalendar;
  http: typeof http;
  inventory: typeof inventory;
  "lib/orderNumber": typeof lib_orderNumber;
  "lib/paymentIssues": typeof lib_paymentIssues;
  "lib/paystack": typeof lib_paystack;
  "lib/pricing": typeof lib_pricing;
  "lib/staffCrypto": typeof lib_staffCrypto;
  "lib/stock": typeof lib_stock;
  maintenance: typeof maintenance;
  messages: typeof messages;
  notifications: typeof notifications;
  orderActivity: typeof orderActivity;
  orders: typeof orders;
  paymentIssues: typeof paymentIssues;
  payments: typeof payments;
  posts: typeof posts;
  products: typeof products;
  promotions: typeof promotions;
  reviews: typeof reviews;
  settings: typeof settings;
  sms: typeof sms;
  staffAuth: typeof staffAuth;
  staffAuthNode: typeof staffAuthNode;
  staffNotifications: typeof staffNotifications;
  staffPermissions: typeof staffPermissions;
  subscribers: typeof subscribers;
  tailors: typeof tailors;
  users: typeof users;
  webhooks: typeof webhooks;
  wipeData: typeof wipeData;
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
