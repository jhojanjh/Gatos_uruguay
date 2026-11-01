import type { AppData, Product, Purchase } from '@/types';
import { newId } from '@/utils/ids';

export function normalizeProductName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');
}

export interface StorePrice {
  store: string;
  unitPrice: number;
  date: string;
}

/** Último precio registrado de un producto en cada tienda, del más barato al más caro. */
export function getStorePrices(purchases: Purchase[], productId: string): StorePrice[] {
  const latest = new Map<string, StorePrice>();
  for (const purchase of purchases) {
    if (purchase.productId !== productId) continue;
    const key = normalizeProductName(purchase.store);
    const current = latest.get(key);
    if (!current || purchase.date >= current.date) {
      latest.set(key, { store: purchase.store, unitPrice: purchase.unitPrice, date: purchase.date });
    }
  }
  return [...latest.values()].sort((a, b) => a.unitPrice - b.unitPrice);
}

export interface ReceiptItemInput {
  name: string;
  quantity: number;
  price: number;
}

/** Suma los artículos de una factura al inventario y registra cada compra por tienda. */
export function applyReceiptToData(
  data: AppData,
  receipt: { store: string; date: string; items: ReceiptItemInput[] },
): AppData {
  const products: Product[] = [...data.products];
  const purchases: Purchase[] = [...data.purchases];

  for (const item of receipt.items) {
    const key = normalizeProductName(item.name);
    let index = products.findIndex((product) => normalizeProductName(product.name) === key);
    if (index === -1) {
      products.push({ id: newId(), name: item.name.trim(), quantity: 0 });
      index = products.length - 1;
    }
    const product = products[index];
    products[index] = { ...product, quantity: product.quantity + item.quantity, needsPurchase: false };
    purchases.push({
      id: newId(),
      productId: product.id,
      store: receipt.store.trim(),
      date: receipt.date,
      quantity: item.quantity,
      unitPrice: Math.round((item.price / item.quantity) * 100) / 100,
    });
  }

  return { ...data, products, purchases };
}
