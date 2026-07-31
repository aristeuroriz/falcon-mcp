import katex from "katex";

export type ValidateKatexResult =
  | { valid: true; expression: string }
  | { valid: false; expression: string; error: string };

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
