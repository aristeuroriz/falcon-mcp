import { describe, expect, it } from "vitest";
import { validateKatexBatch } from "../src/validate.js";

describe("validateKatexBatch", () => {
  it("returns allValid with empty failures when all expressions are valid", () => {
    const expressions = ["x^2 + y^2 = z^2", "\\frac{\\alpha}{\\beta}", "E = mc^2"];

    expect(validateKatexBatch(expressions)).toEqual({
      allValid: true,
      total: 3,
      invalidCount: 0,
      failures: [],
    });
  });

  it("returns only failed expressions with correct 0-based index", () => {
    const expressions = [
      "x^2",
      "\\frac{1}{",
      "\\alpha",
      "\\unknowncommand{x}",
      "y^2",
    ];

    const result = validateKatexBatch(expressions);

    expect(result.allValid).toBe(false);
    expect(result.total).toBe(5);
    expect(result.invalidCount).toBe(2);
    expect(result.failures).toHaveLength(2);
    expect(result.failures[0]).toMatchObject({
      index: 1,
      expression: "\\frac{1}{",
    });
    expect(result.failures[0]?.error.length).toBeGreaterThan(0);
    expect(result.failures[1]).toMatchObject({
      index: 3,
      expression: "\\unknowncommand{x}",
    });
    expect(result.failures[1]?.error.length).toBeGreaterThan(0);
  });

  it("returns every expression in failures when all are invalid", () => {
    const expressions = ["\\frac{1}{", "\\bad", "\\unknowncommand{x}"];

    const result = validateKatexBatch(expressions);

    expect(result.allValid).toBe(false);
    expect(result.total).toBe(3);
    expect(result.invalidCount).toBe(3);
    expect(result.failures.map((failure) => failure.index)).toEqual([0, 1, 2]);
  });

  it("supports a single-element array", () => {
    expect(validateKatexBatch(["x^2 + y^2 = z^2"])).toEqual({
      allValid: true,
      total: 1,
      invalidCount: 0,
      failures: [],
    });

    const invalid = validateKatexBatch(["\\frac{1}{"]);

    expect(invalid).toMatchObject({
      allValid: false,
      total: 1,
      invalidCount: 1,
    });
    expect(invalid.failures[0]).toMatchObject({
      index: 0,
      expression: "\\frac{1}{",
    });
  });
});
