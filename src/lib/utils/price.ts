export function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return "0.00 UAH";
  return `${amount.toFixed(2)} UAH`;
}
