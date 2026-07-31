import katex from "katex";
import type {
  ValidateKatexBatchResult,
  ValidateKatexFailure,
  ValidateKatexResult,
} from "./schemas.js";

export type {
  ValidateKatexBatchResult,
  ValidateKatexFailure,
  ValidateKatexInput,
  ValidateKatexResult,
} from "./schemas.js";

export function validateKatex(expression: string): ValidateKatexResult {
  try {
    katex.renderToString(expression, {
      throwOnError: true,
      strict: "error",
    });
    return { valid: true, expression };
  } catch (error) {
    return {
      valid: false,
      expression,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function validateKatexBatch(
  expressions: string[],
): ValidateKatexBatchResult {
  const failures: ValidateKatexFailure[] = [];

  for (const [index, expression] of expressions.entries()) {
    const result = validateKatex(expression);
    if (!result.valid) {
      failures.push({
        index,
        expression: result.expression,
        error: result.error,
      });
    }
  }

  const invalidCount = failures.length;

  return {
    allValid: invalidCount === 0,
    total: expressions.length,
    invalidCount,
    failures,
  };
}
