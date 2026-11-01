import { CATEGORY_COLORS, DEFAULT_CURRENCY } from '@/config/constants';
import type { AppData, Category, Expense, FixedExpense } from '@/types';
import { currentMonthKey, dayKey, todayKey } from '@/utils/dates';
import { newId } from '@/utils/ids';

const DEFAULT_CATEGORIES: { name: string; monthlyLimit: number | null }[] = [
  { name: 'Supermercado', monthlyLimit: 16000 },
  { name: 'Verdulería y carnicería', monthlyLimit: 5000 },
  { name: 'Hogar y servicios', monthlyLimit: null },
  { name: 'Transporte', monthlyLimit: 3000 },
  { name: 'Salidas', monthlyLimit: 4000 },
  { name: 'Salud', monthlyLimit: null },
  { name: 'Otros', monthlyLimit: null },
];

function buildCategories(): Category[] {
  return DEFAULT_CATEGORIES.map((category, index) => ({
    id: newId(),
    name: category.name,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    monthlyLimit: category.monthlyLimit,
  }));
}

export function createEmptyData(): AppData {
  return {
    version: 1,
    settings: { currency: DEFAULT_CURRENCY },
    categories: buildCategories(),
    expenses: [],
    fixedExpenses: [],
    products: [],
    purchases: [],
    startingBalances: {},
    generatedFixedKeys: [],
  };
}

/** Datos de ejemplo para probar la app. Las fechas caen dentro del mes actual. */
export function createSampleData(): AppData {
  const base = createEmptyData();
  const monthKey = currentMonthKey();
  const todayDay = Number(todayKey().slice(8, 10));
  const categoryId = (name: string) => base.categories.find((category) => category.name === name)?.id ?? '';
  const now = new Date().toISOString();

  const sampleExpenses: { day: number; amount: number; category: string; description: string }[] = [
    { day: 1, amount: 4350, category: 'Supermercado', description: 'Compra grande del mes' },
    { day: 1, amount: 1250, category: 'Verdulería y carnicería', description: 'Frutas y verduras' },
    { day: 1, amount: 420, category: 'Transporte', description: 'Boletos' },
    { day: 1, amount: 1500, category: 'Salidas', description: 'Cena con amigos' },
    { day: 1, amount: 2780, category: 'Supermercado', description: 'Complementos de la semana' },
  ];

  const expenses: Expense[] = sampleExpenses.map((sample) => ({
    id: newId(),
    amount: sample.amount,
    categoryId: categoryId(sample.category),
    date: dayKey(monthKey, Math.min(sample.day, todayDay)),
    description: sample.description,
    photoIds: [],
    fixedExpenseId: null,
    createdAt: now,
  }));

  const fixedExpenses: FixedExpense[] = [
    {
      id: newId(),
      name: 'Arriendo',
      amount: 18000,
      categoryId: categoryId('Hogar y servicios'),
      dayOfMonth: 1,
      startMonth: monthKey,
    },
    {
      id: newId(),
      name: 'Internet',
      amount: 1800,
      categoryId: categoryId('Hogar y servicios'),
      dayOfMonth: 5,
      startMonth: monthKey,
    },
  ];

  return {
    ...base,
    expenses,
    fixedExpenses,
    startingBalances: { [monthKey]: 45000 },
  };
}
