import { z } from "zod";

export const validateKatexValidResultSchema = z.object({
  valid: z.literal(true).describe("Always true when the expression is valid"),
  expression: z.string().describe("The LaTeX expression that was validated"),
});

export const validateKatexInvalidResultSchema = z.object({
  valid: z
    .literal(false)
    .describe("Always false when the expression is invalid"),
  expression: z
    .string()
    .describe("The LaTeX expression that failed validation"),
  error: z.string().describe("KaTeX parse/render error message"),
});

export const validateKatexResultSchema = z.discriminatedUnion("valid", [
  validateKatexValidResultSchema,
  validateKatexInvalidResultSchema,
]);

export type ValidateKatexResult = z.infer<typeof validateKatexResultSchema>;

export const validateKatexFailureSchema = z.object({
  index: z
    .number()
    .int()
    .nonnegative()
    .describe("0-based index of the failed expression in the input array"),
  expression: z
    .string()
    .describe("The LaTeX expression that failed validation"),
  error: z.string().describe("KaTeX parse/render error message"),
});

export type ValidateKatexFailure = z.infer<typeof validateKatexFailureSchema>;

export const validateKatexBatchResultSchema = z.object({
  allValid: z
    .boolean()
    .describe("True when every expression in the batch is valid"),
  total: z
    .number()
    .int()
    .nonnegative()
    .describe("Total number of expressions submitted"),
  invalidCount: z
    .number()
    .int()
    .nonnegative()
    .describe("Number of expressions that failed validation"),
  failures: z
    .array(validateKatexFailureSchema)
    .describe("Only the failed expressions; empty when allValid is true"),
});

export type ValidateKatexBatchResult = z.infer<
  typeof validateKatexBatchResultSchema
>;

export const validateKatexInputSchema = z.object({
  expressions: z
    .array(z.string().describe("A single LaTeX formula string"))
    .min(1)
    .describe("One or more LaTeX formulas to validate in a single call"),
});

export type ValidateKatexInput = z.infer<typeof validateKatexInputSchema>;
