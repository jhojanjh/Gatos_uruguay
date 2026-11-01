export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
