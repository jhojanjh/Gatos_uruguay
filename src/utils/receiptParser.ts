export interface ReceiptLine {
  name: string;
  quantity: number;
  price: number;
}

const NON_ITEM_WORDS = /\b(total|subtotal|iva|tarjeta|efectivo|cambio|vuelto|descuento|saldo|pago|tarj)\b/i;
const PRICE_AT_END = /^(.*?)\s+(\d[\d.,]*)\s*$/;
const QUANTITY_PREFIX = /^(\d+)\s*[x×]?\s+(?=\S)/i;

/** Convierte "1.250", "1,250" o "12,50" a número. Los centavos solo cuentan si van con coma o punto de dos cifras. */
function parsePrice(token: string): number {
  const cents = /[.,](\d{2})$/.exec(token);
  if (cents) return Number(`${token.slice(0, -3).replace(/[.,]/g, '')}.${cents[1]}`);
  return Number(token.replace(/[.,]/g, ''));
}

/** Extrae artículos con precio de un texto leído de una factura. Las líneas que no parecen artículos se descartan. */
export function parseReceiptText(text: string): ReceiptLine[] {
  const lines: ReceiptLine[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+/g, ' ').trim();
    const match = PRICE_AT_END.exec(line);
    if (!match) continue;

    let name = match[1].trim();
    const price = parsePrice(match[2]);
    if (!Number.isFinite(price) || price <= 0) continue;

    let quantity = 1;
    const quantityMatch = QUANTITY_PREFIX.exec(name);
    if (quantityMatch) {
      quantity = Number(quantityMatch[1]);
      name = name.slice(quantityMatch[0].length);
    }

    name = name.replace(/[^\p{L}\p{N}\s%./-]/gu, '').trim();
    if (name.length < 2 || !/\p{L}/u.test(name) || NON_ITEM_WORDS.test(name)) continue;
    if (quantity <= 0) continue;

    lines.push({ name, quantity, price });
  }
  return lines;
}
