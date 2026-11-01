import { Badge, Card, Group, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useApp } from '@/state/appContext';
import { expensesOfMonth, getMonthSummary, spentByCategory, sumAmounts } from '@/utils/budget';
import { shiftMonth } from '@/utils/dates';
import { formatMoney } from '@/utils/money';

export function SummaryScreen() {
  const { data, selectedMonth } = useApp();
  const currency = data.settings.currency;
  const currentExpenses = expensesOfMonth(data.expenses, selectedMonth);
  const previousExpenses = expensesOfMonth(data.expenses, shiftMonth(selectedMonth, -1));
  const currentTotal = sumAmounts(currentExpenses);
  const previousTotal = sumAmounts(previousExpenses);
  const categoryTotals = spentByCategory(currentExpenses);
  const categories = data.categories
    .map((category) => ({ ...category, spent: categoryTotals[category.id] ?? 0 }))
    .sort((a, b) => b.spent - a.spent);
  const fixedTotal = sumAmounts(currentExpenses.filter((expense) => expense.fixedExpenseId !== null));
  const variableTotal = currentTotal - fixedTotal;
  const monthSummary = getMonthSummary(data, selectedMonth, `${selectedMonth}-01`);
  const difference = currentTotal - previousTotal;
  const differencePercent = previousTotal > 0 ? Math.round((difference / previousTotal) * 100) : null;

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={2}>Resumen</Title>
        <Text>Vista general de los gastos del mes seleccionado.</Text>
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card withBorder radius="xl" padding="lg">
          <Text fz="sm" fw={600}>Gastos del mes</Text>
          <Text fz={26} fw={800}>{formatMoney(currentTotal, currency)}</Text>
          <Text fz="sm">{currentExpenses.length} gasto{currentExpenses.length === 1 ? '' : 's'}</Text>
        </Card>
        <Card withBorder radius="xl" padding="lg">
          <Text fz="sm" fw={600}>Gastos fijos</Text>
          <Text fz={26} fw={800}>{formatMoney(fixedTotal, currency)}</Text>
          <Text fz="sm">{formatMoney(variableTotal, currency)} en otros gastos</Text>
        </Card>
        <Card withBorder radius="xl" padding="lg">
          <Text fz="sm" fw={600}>Saldo restante</Text>
          <Text fz={26} fw={800}>{monthSummary.remaining === null ? '—' : formatMoney(monthSummary.remaining, currency)}</Text>
          <Text fz="sm">{monthSummary.startingBalance === null ? 'Agrega el saldo inicial en Inicio.' : `Saldo inicial: ${formatMoney(monthSummary.startingBalance, currency)}`}</Text>
        </Card>
      </SimpleGrid>
      <Card withBorder radius="xl" padding="lg">
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap">
            <Text fw={800} fz="lg">Comparación con el mes anterior</Text>
            {differencePercent !== null && <Badge color={difference > 0 ? 'red' : 'teal'} variant="light">{difference > 0 ? '+' : ''}{differencePercent}%</Badge>}
          </Group>
          <Group justify="space-between"><Text>Mes anterior</Text><Text fw={700}>{formatMoney(previousTotal, currency)}</Text></Group>
          <Group justify="space-between"><Text>Mes seleccionado</Text><Text fw={700}>{formatMoney(currentTotal, currency)}</Text></Group>
          <Text fz="sm">{previousTotal === 0 ? 'No hay gastos registrados el mes anterior para comparar.' : `${difference > 0 ? 'Gastaste' : difference < 0 ? 'Gastaste menos' : 'Gastaste lo mismo'} ${formatMoney(Math.abs(difference), currency)} frente al mes anterior.`}</Text>
        </Stack>
      </Card>
      <Card withBorder radius="xl" padding="lg">
        <Stack gap="md">
          <Text fw={800} fz="lg">Gastos por categoría</Text>
          {categories.length === 0 ? <Text>No hay categorías configuradas.</Text> : categories.map((category) => {
            const limit = category.monthlyLimit;
            const percent = limit && limit > 0 ? (category.spent / limit) * 100 : currentTotal > 0 ? (category.spent / currentTotal) * 100 : 0;
            return (
              <Stack key={category.id} gap={6}>
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600} truncate>{category.name}</Text>
                  <Text fw={700} style={{ whiteSpace: 'nowrap' }}>{formatMoney(category.spent, currency)}{limit ? ` / ${formatMoney(limit, currency)}` : ''}</Text>
                </Group>
                <Progress value={Math.min(100, percent)} color={limit && category.spent > limit ? 'red' : category.color} radius="xl" />
              </Stack>
            );
          })}
        </Stack>
      </Card>
    </Stack>
  );
}
