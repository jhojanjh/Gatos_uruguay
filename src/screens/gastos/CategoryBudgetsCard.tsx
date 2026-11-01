import { Badge, Card, Group, Progress, Stack, Text } from '@mantine/core';
import { useApp } from '@/state/appContext';
import type { Expense } from '@/types';
import { budgetLevel, spentByCategory, type BudgetLevel } from '@/utils/budget';
import { formatMoney } from '@/utils/money';

const LEVEL_COLOR: Record<BudgetLevel, string> = {
  ok: 'salvia',
  warning: 'yellow',
  over: 'red',
};

export function CategoryBudgetsCard({ expenses }: { expenses: Expense[] }) {
  const { data } = useApp();
  const currency = data.settings.currency;
  const spent = spentByCategory(expenses);
  const limited = data.categories.filter((category) => category.monthlyLimit !== null && category.monthlyLimit > 0);

  return (
    <Card withBorder radius="xl" padding="lg">
      <Stack gap="md">
        <Text fw={800} fz="lg">
          Presupuesto por categoría
        </Text>
        {limited.length === 0 ? (
          <Text fz="sm">Define un límite mensual en Categorías para ver aquí cuánto llevas gastado.</Text>
        ) : (
          limited.map((category) => {
            const limit = category.monthlyLimit ?? 0;
            const amountSpent = spent[category.id] ?? 0;
            const percent = (amountSpent / limit) * 100;
            const level = budgetLevel(amountSpent, limit);
            return (
              <Stack key={category.id} gap={6}>
                <Group justify="space-between" wrap="nowrap" gap="xs">
                  <Text fw={600} truncate>
                    {category.name}
                  </Text>
                  {level === 'over' && (
                    <Badge color="red" variant="light" radius="xl">
                      Límite superado
                    </Badge>
                  )}
                  {level === 'warning' && (
                    <Badge color="yellow" variant="light" radius="xl">
                      Al {Math.round(percent)} %
                    </Badge>
                  )}
                </Group>
                <Progress value={Math.min(100, percent)} color={LEVEL_COLOR[level]} radius="xl" size="md" />
                <Text fz="sm">
                  {formatMoney(amountSpent, currency)} de {formatMoney(limit, currency)} ({Math.round(percent)} %)
                </Text>
              </Stack>
            );
          })
        )}
      </Stack>
    </Card>
  );
}
