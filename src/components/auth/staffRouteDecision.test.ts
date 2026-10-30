import { describe, expect, it } from "vitest";
import { getStaffRouteStep } from "./staffRouteDecision";

describe("getStaffRouteStep", () => {
  it("does not redirect while the profile is loading or there is no session", () => {
    expect(getStaffRouteStep("token", undefined)).toBeNull();
    expect(getStaffRouteStep(null, null)).toBeNull();
  });

  it("requires the password change before 2FA", () => {
    expect(getStaffRouteStep("token", { role: "ceo", mustChangePassword: true, totpEnabled: false }, "/admin"))
      .toBe("change-password");
  });

  it("requires setup for a CEO without 2FA", () => {
    expect(getStaffRouteStep("token", { role: "ceo", mustChangePassword: false, totpEnabled: false }, "/admin"))
      .toBe("setup-2fa");
  });

  it("allows a CEO with 2FA", () => {
    expect(getStaffRouteStep("token", { role: "ceo", mustChangePassword: false, totpEnabled: true }, "/admin"))
      .toBe("ok");
  });

  it("does not require 2FA for sales or designers", () => {
    expect(getStaffRouteStep("token", { role: "sales" }, "/sales")).toBe("ok");
    expect(getStaffRouteStep("token", { role: "designer" }, "/designer")).toBe("ok");
  });

  it("never redirects to the page already being displayed", () => {
    expect(getStaffRouteStep("token", { role: "ceo", mustChangePassword: true }, "/staff/change-password")).toBeNull();
    expect(getStaffRouteStep("token", { role: "ceo", totpEnabled: false }, "/staff/setup-2fa")).toBeNull();
  });
});
