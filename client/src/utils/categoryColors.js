const GRADIENTS = [
  "linear-gradient(135deg, #7c1f1f, #1a1a1a)",
  "linear-gradient(135deg, #1f2937, #111827)",
  "linear-gradient(135deg, #991b1b, #3f1212)",
  "linear-gradient(135deg, #334155, #0f172a)",
  "linear-gradient(135deg, #b91c1c, #292524)",
  "linear-gradient(135deg, #44403c, #1c1917)",
];

export function getCategoryGradient(index) {
  return GRADIENTS[index % GRADIENTS.length];
}
