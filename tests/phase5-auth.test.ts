import { describe, expect, it } from "vitest";
import { isAuthorizedAdminUser } from "@/lib/auth/authorized-admin";
import { loginSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("accepts a valid email/password pair", () => {
    const parsed = loginSchema.safeParse({
      email: "admin@example.com",
      password: "securepass1",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects short passwords and invalid emails", () => {
    expect(
      loginSchema.safeParse({
        email: "not-an-email",
        password: "securepass1",
      }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({
        email: "admin@example.com",
        password: "short",
      }).success,
    ).toBe(false);
  });
});

describe("admin gate helper", () => {
  it("only allows identities present in authorized_admins", () => {
    expect(
      isAuthorizedAdminUser(
        { userId: "u1", isAuthenticated: true },
        ["u1"],
      ),
    ).toBe(true);
    expect(
      isAuthorizedAdminUser(
        { userId: "u2", isAuthenticated: true },
        ["u1"],
      ),
    ).toBe(false);
  });
});
