import { BUDGET_WARNING_RATIO } from '@/config/constants';
import type { AppData, Expense } from '@/types';
import { daysInMonth } from '@/utils/dates';

export function expensesOfMonth(expenses: Expense[], monthKey: string): Expense[] {
  return expenses.filter((expense) => expense.date.startsWith(monthKey));
}

export function sumAmounts(expenses: Expense[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

export function sortNewestFirst(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) =>
    a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date),
  );
}

export function spentByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce<Record<string, number>>((totals, expense) => {
    totals[expense.categoryId] = (totals[expense.categoryId] ?? 0) + expense.amount;
    return totals;
  }, {});
}

export type BudgetLevel = 'ok' | 'warning' | 'over';

export function budgetLevel(spent: number, limit: number): BudgetLevel {
  if (spent >= limit) return 'over';
  if (spent >= limit * BUDGET_WARNING_RATIO) return 'warning';
  return 'ok';
}

export interface MonthSummary {
  startingBalance: number | null;
  spent: number;
  remaining: number | null;
  elapsedDays: number;
  totalDays: number;
  expectedRemaining: number | null;
  onTrack: boolean;
}

/** Compara el saldo real con un ritmo de gasto parejo (saldo inicial / días del mes). */
export function getMonthSummary(data: AppData, monthKey: string, todayDateKey: string): MonthSummary {
  const spent = sumAmounts(expensesOfMonth(data.expenses, monthKey));
  const startingBalance = data.startingBalances[monthKey] ?? null;
  const totalDays = daysInMonth(monthKey);
  const currentMonth = todayDateKey.slice(0, 7);

  let elapsedDays = 0;
  if (monthKey < currentMonth) elapsedDays = totalDays;
  else if (monthKey === currentMonth) elapsedDays = Number(todayDateKey.slice(8, 10));

  if (startingBalance === null) {
    return { startingBalance, spent, remaining: null, elapsedDays, totalDays, expectedRemaining: null, onTrack: false };
  }

  const pace = startingBalance / totalDays;
  const remaining = startingBalance - spent;
  const expectedRemaining = startingBalance - pace * elapsedDays;

  return {
    startingBalance,
    spent,
    remaining,
    elapsedDays,
    totalDays,
    expectedRemaining,
    onTrack: remaining >= expectedRemaining,
  };
}
