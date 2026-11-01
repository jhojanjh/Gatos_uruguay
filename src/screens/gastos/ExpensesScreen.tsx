import { useState } from 'react';
import { Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Plus, Repeat, Tags } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';
import { photoService } from '@/services/photoService';
import { useApp } from '@/state/appContext';
import type { Expense } from '@/types';
import { expensesOfMonth, sortNewestFirst, sumAmounts } from '@/utils/budget';
import { weeksOfMonth } from '@/utils/dates';
import { formatMoney } from '@/utils/money';
import { CategoriesModal } from './CategoriesModal';
import { CategoryBudgetsCard } from './CategoryBudgetsCard';
import { ExpenseFilters } from './ExpenseFilters';
import { ExpenseFormModal } from './ExpenseFormModal';
import { ExpenseList } from './ExpenseList';
import { FixedExpensesModal } from './FixedExpensesModal';
import { PhotoViewerModal } from './PhotoViewerModal';

export function ExpensesScreen() {
  const { data, updateData, selectedMonth } = useApp();
  const currency = data.settings.currency;

  const [week, setWeek] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [fixedOpen, setFixedOpen] = useState(false);

  const monthExpenses = expensesOfMonth(data.expenses, selectedMonth);
  const weeks = weeksOfMonth(selectedMonth);
  const selectedWeek = weeks.find((item) => String(item.index) === week);

  const visibleExpenses = sortNewestFirst(
    monthExpenses.filter(
      (expense) =>
        (!selectedWeek || (expense.date >= selectedWeek.startKey && expense.date <= selectedWeek.endKey)) &&
        (categoryFilter === 'all' || expense.categoryId === categoryFilter),
    ),
  );

  const hasFilters = week !== 'all' || categoryFilter !== 'all';

  function clearFilters() {
    setWeek('all');
    setCategoryFilter('all');
  }

  function openNewExpense() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditExpense(expense: Expense) {
    setEditing(expense);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    const expense = deleting;
    setDeleting(null);
    updateData((previous) => ({
      ...previous,
      expenses: previous.expenses.filter((item) => item.id !== expense.id),
    }));
    try {
      await photoService.remove(expense.photoIds);
    } catch {
      notifications.show({
        color: 'yellow',
        title: 'Gasto eliminado',
        message: 'Algunas fotos de la factura no se pudieron borrar del dispositivo.',
      });
    }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
        <Stack gap={4}>
          <Title order={2}>Gastos</Title>
          <Text>Total del mes: {formatMoney(sumAmounts(monthExpenses), currency)}</Text>
        </Stack>
        <Button leftSection={<Plus size={20} />} color="terracota" onClick={openNewExpense}>
          Nuevo gasto
        </Button>
      </Group>

      <Group gap="sm">
        <Button variant="light" color="terracota" leftSection={<Tags size={18} />} onClick={() => setCategoriesOpen(true)}>
          Categorías
        </Button>
        <Button variant="light" color="terracota" leftSection={<Repeat size={18} />} onClick={() => setFixedOpen(true)}>
          Gastos fijos
        </Button>
      </Group>

      <CategoryBudgetsCard expenses={monthExpenses} />

      <ExpenseFilters
        weeks={weeks}
        week={week}
        onWeekChange={setWeek}
        categories={data.categories}
        categoryId={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {monthExpenses.length === 0 ? (
        <Card withBorder radius="xl" padding="xl">
          <Stack align="center" gap="sm" ta="center">
            <Text fw={800} fz="lg">
              Todavía no hay gastos este mes
            </Text>
            <Text>Registra el primero y, si quieres, saca una foto de la factura.</Text>
            <Button color="terracota" leftSection={<Plus size={20} />} onClick={openNewExpense}>
              Registrar gasto
            </Button>
          </Stack>
        </Card>
      ) : visibleExpenses.length === 0 ? (
        <Card withBorder radius="xl" padding="xl">
          <Stack align="center" gap="sm" ta="center">
            <Text>Ningún gasto coincide con los filtros elegidos.</Text>
            {hasFilters && (
              <Button variant="light" color="terracota" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </Stack>
        </Card>
      ) : (
        <>
          <Text fz="sm" fw={600}>
            {visibleExpenses.length} gasto{visibleExpenses.length === 1 ? '' : 's'} · {formatMoney(sumAmounts(visibleExpenses), currency)}
          </Text>
          <ExpenseList
            expenses={visibleExpenses}
            categories={data.categories}
            currency={currency}
            onEdit={openEditExpense}
            onDelete={setDeleting}
            onOpenPhotos={(expense) => setViewerId(expense.id)}
          />
        </>
      )}

      <ExpenseFormModal opened={formOpen} expense={editing} onClose={() => setFormOpen(false)} />
      <PhotoViewerModal expenseId={viewerId} onClose={() => setViewerId(null)} />
      <CategoriesModal opened={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
      <FixedExpensesModal opened={fixedOpen} onClose={() => setFixedOpen(false)} />

      <ConfirmModal
        opened={deleting !== null}
        title="¿Eliminar este gasto?"
        message={`Se borrará el gasto${deleting?.photoIds.length ? ' y sus fotos de factura' : ''}. No se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </Stack>
  );
}
