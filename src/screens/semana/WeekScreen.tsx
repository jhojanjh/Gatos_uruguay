import { useMemo, useState } from 'react';
import { ActionIcon, Badge, Card, ColorSwatch, Group, Select, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Pencil } from 'lucide-react';
import { useApp } from '@/state/appContext';
import type { Expense } from '@/types';
import { expensesOfMonth, sortNewestFirst, sumAmounts } from '@/utils/budget';
import { dayKey, formatDayLabel, weeksOfMonth } from '@/utils/dates';
import { formatMoney } from '@/utils/money';
import { ExpenseFormModal } from '@/screens/gastos/ExpenseFormModal';

export function WeekScreen() {
  const { data, selectedMonth } = useApp();
  const weeks = useMemo(() => weeksOfMonth(selectedMonth), [selectedMonth]);
  const [weekIndex, setWeekIndex] = useState(weeks[0]?.index ?? 1);
  const week = weeks.find((item) => item.index === weekIndex) ?? weeks[0];
  const activeWeekIndex = week?.index ?? 1;
  const monthExpenses = expensesOfMonth(data.expenses, selectedMonth);
  const weekExpenses = week
    ? sortNewestFirst(monthExpenses.filter((expense) => expense.date >= week.startKey && expense.date <= week.endKey))
    : [];
  const previousWeek = weeks.find((item) => item.index === activeWeekIndex - 1);
  const previousTotal = previousWeek
    ? sumAmounts(monthExpenses.filter((expense) => expense.date >= previousWeek.startKey && expense.date <= previousWeek.endKey))
    : null;
  const [editing, setEditing] = useState<Expense | null>(null);
  const currency = data.settings.currency;
  const days = week ? Array.from({ length: Number(week.endKey.slice(-2)) - Number(week.startKey.slice(-2)) + 1 }, (_, index) => {
    const date = dayKey(selectedMonth, Number(week.startKey.slice(-2)) + index);
    return { date, total: sumAmounts(weekExpenses.filter((expense) => expense.date === date)) };
  }) : [];

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={2}>Semana</Title>
        <Text>Revisa los gastos por semana y por día.</Text>
      </Stack>
      <Select
        label="Semana del mes"
        value={String(activeWeekIndex)}
        onChange={(value) => value && setWeekIndex(Number(value))}
        data={weeks.map((item) => ({
          value: String(item.index),
          label: `Semana ${item.index} · ${formatDayLabel(item.startKey)} – ${formatDayLabel(item.endKey)}`,
        }))}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Card withBorder radius="xl" padding="lg">
          <Text fz="sm" fw={600}>Total de esta semana</Text>
          <Text fz={28} fw={800}>{formatMoney(sumAmounts(weekExpenses), currency)}</Text>
          <Text fz="sm">{weekExpenses.length} gasto{weekExpenses.length === 1 ? '' : 's'}</Text>
        </Card>
        <Card withBorder radius="xl" padding="lg">
          <Text fz="sm" fw={600}>Semana anterior</Text>
          <Text fz={28} fw={800}>{previousTotal === null ? '—' : formatMoney(previousTotal, currency)}</Text>
          <Text fz="sm">{previousTotal === null ? 'No hay una semana anterior en este mes.' : `Diferencia: ${formatMoney(sumAmounts(weekExpenses) - previousTotal, currency)}`}</Text>
        </Card>
      </SimpleGrid>
      <Card withBorder radius="xl" padding="lg">
        <Stack gap="sm">
          <Text fw={800} fz="lg">Gastos por día</Text>
          {days.map(({ date, total }) => (
            <Group key={date} justify="space-between">
              <Text>{formatDayLabel(date)}</Text>
              <Text fw={700}>{formatMoney(total, currency)}</Text>
            </Group>
          ))}
        </Stack>
      </Card>
      <Stack gap="sm">
        <Text fw={800} fz="lg">Gastos de la semana</Text>
        {weekExpenses.length === 0 ? <Card withBorder radius="lg" padding="md"><Text>No hay gastos registrados en esta semana.</Text></Card> : weekExpenses.map((expense) => {
          const category = data.categories.find((item) => item.id === expense.categoryId);
          return (
            <Card key={expense.id} withBorder radius="lg" padding="md">
              <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" verticalSpacing="xs">
                <Group gap="sm" wrap="nowrap" miw={0}>
                  <ColorSwatch color={category?.color ?? 'gray'} size={14} />
                  <Stack gap={2} miw={0} style={{ flex: 1 }}>
                    <Text fw={700} style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                      {expense.description || category?.name || 'Gasto'}
                    </Text>
                    <Text fz="sm" style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                      {formatDayLabel(expense.date)} · {category?.name ?? 'Sin categoría'}
                    </Text>
                    {expense.fixedExpenseId && <Badge size="sm" variant="light" w="fit-content">Gasto fijo</Badge>}
                  </Stack>
                </Group>
                <Group gap="xs" justify="space-between" wrap="nowrap">
                  <Text fw={800} style={{ whiteSpace: 'nowrap' }}>{formatMoney(expense.amount, currency)}</Text>
                  <ActionIcon aria-label={`Editar ${expense.description || 'gasto'}`} onClick={() => setEditing(expense)}>
                    <Pencil size={18} />
                  </ActionIcon>
                </Group>
              </SimpleGrid>
            </Card>
          );
        })}
      </Stack>
      <ExpenseFormModal opened={editing !== null} expense={editing} onClose={() => setEditing(null)} />
    </Stack>
  );
}
