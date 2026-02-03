export function generateId(prefix) {
  return prefix + "-" + Date.now();
}

export function formatCurrency(amount) {
  return "₦" + amount.toLocaleString();
}
