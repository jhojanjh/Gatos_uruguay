import type { AppData, Expense } from '@/types';
import { dayKey, daysInMonth } from '@/utils/dates';
import { newId } from '@/utils/ids';

/** Crea los gastos fijos del mes que aún no existen. Devuelve el mismo objeto si no hay cambios. */
export function applyFixedExpenses(data: AppData, monthKey: string): AppData {
  const generated = new Set(data.generatedFixedKeys);
  const createdAt = new Date().toISOString();
  const newExpenses: Expense[] = [];
  const newKeys: string[] = [];

  for (const fixed of data.fixedExpenses) {
    const key = `${fixed.id}|${monthKey}`;
    if (fixed.startMonth > monthKey || generated.has(key)) continue;

    newExpenses.push({
      id: newId(),
      amount: fixed.amount,
      categoryId: fixed.categoryId,
      date: dayKey(monthKey, Math.min(fixed.dayOfMonth, daysInMonth(monthKey))),
      description: fixed.name,
      photoIds: [],
      fixedExpenseId: fixed.id,
      createdAt,
    });
    newKeys.push(key);
  }

  if (newExpenses.length === 0) return data;

  return {
    ...data,
    expenses: [...data.expenses, ...newExpenses],
    generatedFixedKeys: [...data.generatedFixedKeys, ...newKeys],
  };
}
