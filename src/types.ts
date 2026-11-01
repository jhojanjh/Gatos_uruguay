export type MemberId = 'jhojan' | 'luisa';

export interface Category {
  id: string;
  name: string;
  color: string;
  monthlyLimit: number | null;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  /** Fecha en formato YYYY-MM-DD */
  date: string;
  description: string;
  photoIds: string[];
  fixedExpenseId: string | null;
  createdAt: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  dayOfMonth: number;
  /** Primer mes (YYYY-MM) en el que se carga automáticamente */
  startMonth: string;
}

export interface Product {
  id: string;
  name: string;
  /** Unidades que tenemos; 0 significa que es faltante */
  quantity: number;
  /** Se muestra en Faltantes aunque todavía queden unidades en casa */
  needsPurchase?: boolean;
}

export interface Purchase {
  id: string;
  productId: string;
  store: string;
  /** Fecha en formato YYYY-MM-DD */
  date: string;
  quantity: number;
  unitPrice: number;
}

export interface AppSettings {
  currency: string;
}

export interface AppData {
  version: 1;
  settings: AppSettings;
  categories: Category[];
  expenses: Expense[];
  fixedExpenses: FixedExpense[];
  products: Product[];
  purchases: Purchase[];
  /** Saldo disponible al inicio de cada mes, por clave YYYY-MM */
  startingBalances: Record<string, number>;
  /** Pares "idGastoFijo|YYYY-MM" ya generados, para no volver a crearlos si se borran */
  generatedFixedKeys: string[];
}
