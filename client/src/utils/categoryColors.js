const GRADIENTS = [
  "linear-gradient(135deg, #e1121f, #1a1a1a)",
  "linear-gradient(135deg, #1f1f1f, #0a0a0a)",
  "linear-gradient(135deg, #a30d17, #1a1a1a)",
  "linear-gradient(135deg, #3f3f3f, #0a0a0a)",
  "linear-gradient(135deg, #e1121f, #292524)",
  "linear-gradient(135deg, #44403c, #1c1917)",
];

export function getCategoryGradient(index) {
  return GRADIENTS[index % GRADIENTS.length];
}
