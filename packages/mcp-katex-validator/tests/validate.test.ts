import { describe, expect, it } from "vitest";
import { validateKatex } from "../src/validate.js";

describe("validateKatex", () => {
  it("accepts a simple valid expression", () => {
    expect(validateKatex("x^2 + y^2 = z^2")).toEqual({
      valid: true,
      expression: "x^2 + y^2 = z^2",
    });
  });

  it("accepts nested fractions and greek letters", () => {
    expect(validateKatex("\\frac{\\alpha}{\\beta}")).toMatchObject({
      valid: true,
    });
  });

  it("rejects unmatched braces", () => {
    const result = validateKatex("\\frac{1}{2");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.length).toBeGreaterThan(0);
      expect(result.expression).toBe("\\frac{1}{2");
    }
  });

  it("rejects unknown commands in strict mode", () => {
    const result = validateKatex("\\unknowncommand{x}");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toMatch(/undefined|unknown|KaTeX/i);
    }
  });

  it("accepts an empty expression", () => {
    expect(validateKatex("")).toEqual({ valid: true, expression: "" });
  });
});
