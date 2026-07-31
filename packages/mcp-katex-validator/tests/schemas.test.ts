import { describe, expect, it } from "vitest";
import {
  validateKatexBatchResultSchema,
  validateKatexFailureSchema,
  validateKatexInputSchema,
  validateKatexInvalidResultSchema,
  validateKatexResultSchema,
  validateKatexValidResultSchema,
} from "../src/schemas.js";

describe("validateKatexValidResultSchema", () => {
  it("accepts a valid result", () => {
    expect(
      validateKatexValidResultSchema.safeParse({
        valid: true,
        expression: "x^2 + y^2 = z^2",
      }).success,
    ).toBe(true);
  });

  it("rejects when valid is not true", () => {
    expect(
      validateKatexValidResultSchema.safeParse({
        valid: false,
        expression: "x^2",
      }).success,
    ).toBe(false);
  });

  it("rejects when expression is missing", () => {
    expect(
      validateKatexValidResultSchema.safeParse({ valid: true }).success,
    ).toBe(false);
  });
});

describe("validateKatexInvalidResultSchema", () => {
  it("accepts an invalid result with error", () => {
    expect(
      validateKatexInvalidResultSchema.safeParse({
        valid: false,
        expression: "\\frac{1}{",
        error: "Parse error",
      }).success,
    ).toBe(true);
  });

  it("rejects when valid is not false", () => {
    expect(
      validateKatexInvalidResultSchema.safeParse({
        valid: true,
        expression: "x^2",
        error: "Parse error",
      }).success,
    ).toBe(false);
  });

  it("rejects when error is missing", () => {
    expect(
      validateKatexInvalidResultSchema.safeParse({
        valid: false,
        expression: "\\frac{1}{",
      }).success,
    ).toBe(false);
  });
});

describe("validateKatexResultSchema", () => {
  it("accepts a valid discriminated union branch", () => {
    expect(
      validateKatexResultSchema.safeParse({
        valid: true,
        expression: "E = mc^2",
      }).success,
    ).toBe(true);
  });

  it("accepts an invalid discriminated union branch", () => {
    expect(
      validateKatexResultSchema.safeParse({
        valid: false,
        expression: "\\bad",
        error: "Undefined control sequence",
      }).success,
    ).toBe(true);
  });
});

describe("validateKatexFailureSchema", () => {
  it("accepts a failure entry", () => {
    expect(
      validateKatexFailureSchema.safeParse({
        index: 0,
        expression: "\\frac{1}{",
        error: "Parse error",
      }).success,
    ).toBe(true);
  });

  it("rejects negative index", () => {
    expect(
      validateKatexFailureSchema.safeParse({
        index: -1,
        expression: "\\frac{1}{",
        error: "Parse error",
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer index", () => {
    expect(
      validateKatexFailureSchema.safeParse({
        index: 1.5,
        expression: "\\frac{1}{",
        error: "Parse error",
      }).success,
    ).toBe(false);
  });
});

describe("validateKatexBatchResultSchema", () => {
  it("accepts an all-valid batch result", () => {
    expect(
      validateKatexBatchResultSchema.safeParse({
        allValid: true,
        total: 2,
        invalidCount: 0,
        failures: [],
      }).success,
    ).toBe(true);
  });

  it("accepts a batch result with failures", () => {
    expect(
      validateKatexBatchResultSchema.safeParse({
        allValid: false,
        total: 3,
        invalidCount: 1,
        failures: [
          {
            index: 1,
            expression: "\\frac{1}{",
            error: "Parse error",
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects when failures contain invalid entries", () => {
    expect(
      validateKatexBatchResultSchema.safeParse({
        allValid: false,
        total: 1,
        invalidCount: 1,
        failures: [{ index: -1, expression: "x", error: "err" }],
      }).success,
    ).toBe(false);
  });
});

describe("validateKatexInputSchema", () => {
  it("accepts a single expression", () => {
    expect(
      validateKatexInputSchema.safeParse({
        expressions: ["x^2 + y^2 = z^2"],
      }).success,
    ).toBe(true);
  });

  it("accepts multiple expressions", () => {
    expect(
      validateKatexInputSchema.safeParse({
        expressions: ["x^2", "\\alpha", "E = mc^2"],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty expressions array", () => {
    expect(
      validateKatexInputSchema.safeParse({ expressions: [] }).success,
    ).toBe(false);
  });

  it("rejects when expressions is missing", () => {
    expect(validateKatexInputSchema.safeParse({}).success).toBe(false);
  });
});
