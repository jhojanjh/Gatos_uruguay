export interface ReceiptLine {
  name: string;
  /** Cantidad comprada, extraída del ticket si aparece. */
  quantity: number;
  /** Total pagado por esa línea; se divide por cantidad al registrar el precio unitario. */
  price: number;
  confidence?: number;
}

export interface ReceiptOcrWord {
  text: string;
  confidence: number;
  bbox: { x0: number; x1: number; y0: number; y1: number };
}

export interface ReceiptOcrLine {
  text: string;
  confidence: number;
  bbox: { x0: number; x1: number; y0: number; y1: number };
  words: ReceiptOcrWord[];
}

const NON_ITEM_WORDS = /\b(total|subtotal|iva|impuesto|tarjeta|efectivo|cambio|vuelto|saldo|pago|tarj|rut|suc|caja|ticket|consumo final|detalle)\b/i;
const DISCOUNT_LINE = /\b(descuento|dto)\b/i;
const MONEY_TOKEN = /[-−]?\s*\$?\s*(?:\d{1,3}(?:[.\s]\d{3})+|\d+)(?:,\d{1,2}|\.\d{2})?/g;
const MONEY_AT_END = /([-−]?\s*\$?\s*(?:\d{1,3}(?:[.\s]\d{3})+|\d+)(?:,\d{1,2}|\.\d{2})?)\s*$/;
const QUANTITY = /(?:^|\s)(\d{1,3})\s*[x×](?:\s*([\d.,]+))?/i;

function parseMoney(token: string): number {
  const normalized = token.replace(/[\s$]/g, '').replace('−', '-');
  const negative = normalized.startsWith('-');
  const unsigned = normalized.replace(/^-/, '');
  const lastComma = unsigned.lastIndexOf(',');
  const lastDot = unsigned.lastIndexOf('.');
  const decimalIndex = Math.max(lastComma, lastDot);
  let amount: number;

  if (decimalIndex >= 0 && unsigned.length - decimalIndex - 1 <= 2 && unsigned.length - decimalIndex - 1 > 0) {
    const whole = unsigned.slice(0, decimalIndex).replace(/[.,]/g, '') || '0';
    const fraction = unsigned.slice(decimalIndex + 1);
    amount = Number(`${whole}.${fraction}`);
  } else {
    amount = Number(unsigned.replace(/[.,]/g, ''));
  }
  return negative ? -amount : amount;
}

function moneyTokens(text: string): { raw: string; amount: number; index: number }[] {
  const tokens: { raw: string; amount: number; index: number }[] = [];
  for (const match of text.matchAll(MONEY_TOKEN)) {
    const raw = match[0].trim();
    const amount = parseMoney(raw);
    if (Number.isFinite(amount)) tokens.push({ raw, amount, index: match.index ?? 0 });
  }
  return tokens;
}

function cleanName(value: string): string {
  return value
    .replace(/\b\d{1,3}\s*[x×]\s*[\d.,]*\s*$/i, '')
    .replace(/(?:^|\s)\d{1,3}\s*[x×](?:\s+[\d.,]+)?\s*/i, ' ')
    .replace(/[^\p{L}\p{N}\s%./-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isItemName(value: string): boolean {
  const name = cleanName(value);
  return name.length >= 2 && /\p{L}/u.test(name) && !NON_ITEM_WORDS.test(name);
}

function median(values: number[]): number {
  if (values.length === 0) return 32;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] || 32;
}

/**
 * Empareja nombres y precios usando las cajas de Tesseract. Esto tolera que la
 * descripción y el importe estén en columnas distintas o en líneas cercanas.
 */
export function parseReceiptLines(ocrLines: ReceiptOcrLine[], imageWidth: number): ReceiptLine[] {
  const sortedLines = [...ocrLines].sort((a, b) => (a.bbox.y0 + a.bbox.y1) / 2 - (b.bbox.y0 + b.bbox.y1) / 2);
  const typicalHeight = median(sortedLines.map((line) => line.bbox.y1 - line.bbox.y0).filter((height) => height > 0));
  const amountColumnStart = imageWidth * 0.55;
  const names: { name: string; quantity: number; y: number; confidence: number; price?: number }[] = [];
  const loosePrices: { amount: number; y: number; quantity?: number }[] = [];
  const discounts: { amount: number; y: number }[] = [];

  for (const line of sortedLines) {
    const text = line.text.replace(/\s+/g, ' ').trim();
    if (!text || NON_ITEM_WORDS.test(text)) continue;

    const quantityMatch = QUANTITY.exec(text);
    const quantity = quantityMatch ? Math.max(1, Number(quantityMatch[1])) : 1;
    const words = line.words.length > 0 ? line.words : [{
      text,
      confidence: line.confidence,
      bbox: line.bbox,
    }];

    const locatedPrices = words.flatMap((word) => moneyTokens(word.text)
      .filter((token) => token.amount !== 0 && word.bbox.x1 >= amountColumnStart)
      .map((token) => ({ ...token, x: word.bbox.x0 })));
    const selectedPrice = locatedPrices.sort((a, b) => b.x - a.x || b.index - a.index)[0];

    if (DISCOUNT_LINE.test(text)) {
      if (selectedPrice) discounts.push({ amount: Math.abs(selectedPrice.amount), y: (line.bbox.y0 + line.bbox.y1) / 2 });
      continue;
    }

    let nameText = '';
    if (selectedPrice) {
      nameText = words
        .filter((word) => word.bbox.x0 < selectedPrice.x && moneyTokens(word.text).length === 0)
        .map((word) => word.text)
        .join(' ');
    } else {
      const tail = MONEY_AT_END.exec(text);
      nameText = tail ? text.slice(0, tail.index) : text;
    }

    const name = cleanName(nameText);
    const y = (line.bbox.y0 + line.bbox.y1) / 2;
    if (isItemName(name)) {
      names.push({
        name,
        quantity,
        y,
        confidence: Math.round(line.confidence),
        ...(selectedPrice ? { price: selectedPrice.amount } : {}),
      });
    } else if (selectedPrice) {
      // Cantidad y precio unitario suelen aparecer en una línea bajo el artículo;
      // el importe total queda en la columna derecha.
      loosePrices.push({ amount: selectedPrice.amount, y, ...(quantityMatch ? { quantity } : {}) });
    }
  }

  for (const candidate of loosePrices) {
    const nearest = names
      .filter((item) => item.price === undefined && Math.abs(item.y - candidate.y) <= typicalHeight * 2.5)
      .sort((a, b) => Math.abs(a.y - candidate.y) - Math.abs(b.y - candidate.y))[0];
    if (nearest) {
      nearest.price = candidate.amount;
      if (candidate.quantity) nearest.quantity = candidate.quantity;
    }
  }

  for (const discount of discounts) {
    const nearest = names
      .filter((item) => item.price !== undefined && item.y <= discount.y && discount.y - item.y <= typicalHeight * 2.5)
      .sort((a, b) => b.y - a.y)[0];
    if (nearest?.price !== undefined) nearest.price = Math.max(0, nearest.price - discount.amount);
  }

  return names.flatMap((item) =>
    item.price !== undefined && item.price > 0
      ? [{ name: item.name, quantity: item.quantity, price: item.price, confidence: item.confidence }]
      : [],
  );
}

/** Respaldo para texto OCR sin coordenadas, útil para formatos de ticket sencillos. */
export function parseReceiptText(text: string): ReceiptLine[] {
  return text.split('\n').flatMap((raw) => {
    const line = raw.replace(/\s+/g, ' ').trim();
    if (!line || NON_ITEM_WORDS.test(line)) return [];
    const priceMatch = MONEY_AT_END.exec(line);
    if (!priceMatch) return [];

    const price = parseMoney(priceMatch[1]);
    const name = cleanName(line.slice(0, priceMatch.index));
    const quantityMatch = QUANTITY.exec(line);
    const quantity = quantityMatch ? Math.max(1, Number(quantityMatch[1])) : 1;
    if (price <= 0 || !isItemName(name)) return [];
    return [{ name, quantity, price }];
  });
}

