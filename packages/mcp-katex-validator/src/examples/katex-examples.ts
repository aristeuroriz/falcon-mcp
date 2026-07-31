import { validateKatex } from "../validate.js";

const validKatexFormulas = [
  // Algebra & Basic Equations
  "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
  "a^2 + b^2 = c^2",
  "(a + b)^2 = a^2 + 2ab + b^2",
  "f(x) = ax^2 + bx + c",

  // Differential & Integral Calculus
  "\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}",
  "\\frac{d}{dx}\\left( e^x \\right) = e^x",
  "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
  "\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}",

  // Summations, Products & Series
  "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
  "e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\dots",
  "\\prod_{i=1}^{n} i = n!",

  // Matrices & Linear Algebra
  "A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
  "\\det(A) = ad - bc",
  "\\mathbf{I} = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}",

  // Physics & Relativity
  "E = mc^2",
  "F = G \\frac{m_1 m_2}{r^2}",
  "i\\hbar \\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)",

  // Probability & Statistics
  "P(A \\mid B) = \\frac{P(B \\mid A)P(A)}{P(B)}",
  "f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}",

  // Trigonometric & Complex Identities
  "e^{i\\pi} + 1 = 0",
  "\\sin^2(\\theta) + \\cos^2(\\theta) = 1",
];

const invalidKatexFormulas = [
  // Missing or Unclosed Braces
  "x = \\frac{1}{2", // Unclosed denominator brace
  "f(x) = \\sqrt{x + 1", // Unclosed square root argument brace
  "\\sum_{n=1}^{x^2 \\frac{1}{n}", // Missing closing brace for exponent

  // Non-existent / Typo Commands
  "x = \\farc{1}{2}", // Typo in command '\farc' instead of '\frac'
  "\\integrall_{0}^{\\infty} x dx", // Typo in command '\integrall'
  "\\sqrtt{a^2 + b^2}", // Invalid command '\sqrtt'

  // Mismatched or Broken Environments
  "\\begin{pmatrix} a & b \\\\ c & d", // Missing '\end{pmatrix}'
  "\\begin{matrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}", // Mismatched environment tags
  "\\begin{equation} x = y \\end{something}", // Environment name mismatch

  // Malformed Subscripts, Superscripts, and Delimiters
  "x_{1_2_3}", // Nested raw subscripts without grouping braces
  "\\left( x + y", // Missing matching '\right)' delimiter
  "\\left[ \\frac{a}{b} \\right}", // Mismatched delimiter types (\left[ paired with \right})

  // Invalid Font or Formatting Commands
  "\\textbf{Hello} + \\invalidfont{World}", // Non-existent font command
  "\\mathcolor{red}{x} + \\unkowncmd{y}", // Invalid macro / unknown command
];

console.log("\nValid KaTeX server examples:");
for (const example of validKatexFormulas) {
  const result = validateKatex(example);
  console.log(`${result.valid ? "✅" : "❌"} ${example}`);
  if (!result.valid) {
    console.log(`  Error: ${result.error}`);
  }
}

console.log("\n\nInvalid KaTeX server examples:");
for (const example of invalidKatexFormulas) {
  const result = validateKatex(example);
  console.log(`${result.valid ? "✅" : "❌"} ${example}`);
  if (!result.valid) {
    console.log(`  Error: ${result.error}`);
  }
}
