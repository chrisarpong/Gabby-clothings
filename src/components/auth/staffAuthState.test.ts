import { describe, expect, it } from "vitest";
import { getDefaultRouteForRole, getStaffAuthState, sanitizeStaffNext } from "./staffAuthState";

describe("staff auth state", () => {
  it("treats no token as anonymous immediately", () => expect(getStaffAuthState(null, undefined)).toBe("anonymous"));
  it("waits only for a token-backed profile query", () => expect(getStaffAuthState("token", undefined)).toBe("loading"));
  it("recognizes a loaded profile", () => expect(getStaffAuthState("token", { role: "ceo" })).toBe("authenticated"));
  it("treats a null profile as a revoked session", () => expect(getStaffAuthState("token", null)).toBe("anonymous"));
  it("keeps timeout distinct from anonymous while the route shows recovery UI", () => expect(getStaffAuthState("token", undefined, true)).toBe("loading"));
});

describe("staff next-path sanitizing", () => {
  it.each(["//evil.com", "https://evil.com", "javascript:alert(1)", "/checkout"]) ("rejects %s", (value) => {
    expect(sanitizeStaffNext(value)).toBeNull();
  });
  it("allows internal staff destinations", () => expect(sanitizeStaffNext("/designer?tab=tasks")).toBe("/designer?tab=tasks"));
});

describe("staff default role route", () => {
  it("routes designer to /designer", () => expect(getDefaultRouteForRole("designer")).toBe("/designer"));
  it("routes sales to /sales", () => expect(getDefaultRouteForRole("sales")).toBe("/sales"));
  it("routes ceo and admin to /admin", () => {
    expect(getDefaultRouteForRole("ceo")).toBe("/admin");
    expect(getDefaultRouteForRole("admin")).toBe("/admin");
  });
  it("defaults to /admin for unknown or empty role", () => {
    expect(getDefaultRouteForRole(null)).toBe("/admin");
    expect(getDefaultRouteForRole(undefined)).toBe("/admin");
  });
});
