import { Badge, Card, Group, NumberInput, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Gauge, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { useApp } from '@/state/appContext';
import { expensesOfMonth, getMonthSummary, sortNewestFirst, sumAmounts } from '@/utils/budget';
import { formatDayLabel, todayKey } from '@/utils/dates';
import { formatMoney } from '@/utils/money';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  valueColor?: string;
  footer?: ReactNode;
}

function StatCard({ label, value, icon, valueColor, footer }: StatCardProps) {
  return (
    <Card withBorder radius="xl" padding="lg">
      <Stack gap="xs">
        <Group gap="xs" c="terracota.7">
          {icon}
          <Text fz="sm" fw={600} c="inherit">
            {label}
          </Text>
        </Group>
        <Text fw={800} fz={28} lh={1.2} c={valueColor}>
          {value}
        </Text>
        {footer}
      </Stack>
    </Card>
  );
}

export function HomeScreen() {
  const { data, updateData, selectedMonth } = useApp();
  const today = todayKey();
  const currency = data.settings.currency;
  const summary = getMonthSummary(data, selectedMonth, today);
  const monthExpenses = expensesOfMonth(data.expenses, selectedMonth);
  const recentExpenses = sortNewestFirst(monthExpenses).slice(0, 4);

  const spentPercent =
    summary.startingBalance && summary.startingBalance > 0
      ? Math.min(100, (summary.spent / summary.startingBalance) * 100)
      : 0;
  const overspent = summary.remaining !== null && summary.remaining < 0;

  function handleStartingBalance(value: number | string) {
    updateData((previous) => {
      const balances = { ...previous.startingBalances };
      if (typeof value === 'number') balances[selectedMonth] = value;
      else delete balances[selectedMonth];
      return { ...previous, startingBalances: balances };
    });
  }

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={2}>Inicio</Title>
        <Text>Así va el dinero de este mes.</Text>
      </Stack>

      <Card withBorder radius="xl" padding="lg">
        <NumberInput
          label="Dinero disponible al inicio del mes"
          description="Puedes cambiarlo en cualquier momento"
          placeholder="Ej. 45.000"
          value={summary.startingBalance ?? ''}
          onChange={handleStartingBalance}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          min={0}
          allowNegative={false}
          leftSection={<Text fz="sm" fw={600}>{currency}</Text>}
          leftSectionWidth={64}
        />
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <StatCard
          label="Saldo inicial"
          value={summary.startingBalance === null ? '—' : formatMoney(summary.startingBalance, currency)}
          icon={<Wallet size={18} />}
        />
        <StatCard
          label="Total gastado"
          value={formatMoney(summary.spent, currency)}
          icon={<Receipt size={18} />}
          footer={
            <Progress
              value={spentPercent}
              color={overspent || spentPercent >= 100 ? 'red' : spentPercent >= 80 ? 'yellow' : 'salvia'}
              size="md"
              radius="xl"
              aria-label="Porcentaje del saldo gastado"
            />
          }
        />
        <StatCard
          label="Saldo restante"
          value={summary.remaining === null ? '—' : formatMoney(summary.remaining, currency)}
          valueColor={overspent ? 'red' : 'salvia.7'}
          icon={<Gauge size={18} />}
          footer={
            overspent ? (
              <Text fz="sm" c="red" fw={600}>
                Te pasaste por {formatMoney(Math.abs(summary.remaining ?? 0), currency)}
              </Text>
            ) : null
          }
        />
      </SimpleGrid>

      <Card withBorder radius="xl" padding="lg">
        <Stack gap="sm">
          <Group justify="space-between" wrap="wrap" gap="xs">
            <Text fw={800} fz="lg">
              Ritmo de gasto
            </Text>
            {summary.startingBalance !== null && (
              <Badge
                size="lg"
                radius="xl"
                color={summary.onTrack ? 'teal' : 'orange'}
                variant="light"
                leftSection={summary.onTrack ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              >
                {summary.onTrack ? 'Van bien' : 'Van gastando rápido'}
              </Badge>
            )}
          </Group>

          {summary.startingBalance === null || summary.expectedRemaining === null ? (
            <Text>Ingresa el dinero disponible para ver si el gasto va al ritmo ideal.</Text>
          ) : (
            <>
              <Text>
                Día {summary.elapsedDays} de {summary.totalDays}. Con un ritmo parejo hoy deberían quedar{' '}
                <Text component="span" fw={800}>
                  {formatMoney(Math.max(0, summary.expectedRemaining), currency)}
                </Text>
                .
              </Text>
              <Text>
                Realmente quedan{' '}
                <Text component="span" fw={800} c={summary.onTrack ? 'salvia.7' : 'orange.8'}>
                  {formatMoney(summary.remaining ?? 0, currency)}
                </Text>
                {!summary.onTrack &&
                  `, unos ${formatMoney(summary.expectedRemaining - (summary.remaining ?? 0), currency)} por debajo del ritmo ideal.`}
                {summary.onTrack && '.'}
              </Text>
            </>
          )}
        </Stack>
      </Card>

      <Card withBorder radius="xl" padding="lg">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={800} fz="lg">
              Últimos gastos
            </Text>
            <Text fz="sm">Total del mes: {formatMoney(sumAmounts(monthExpenses), currency)}</Text>
          </Group>
          {recentExpenses.length === 0 ? (
            <Text>Todavía no hay gastos en este mes. Regístralos en la pestaña Gastos.</Text>
          ) : (
            <Stack gap="sm">
              {recentExpenses.map((expense) => {
                const categoryName = data.categories.find((category) => category.id === expense.categoryId)?.name;
                return (
                  <Group key={expense.id} justify="space-between" wrap="nowrap" gap="sm">
                    <Stack gap={0} miw={0}>
                      <Text fw={600} truncate>
                        {expense.description || categoryName || 'Gasto'}
                      </Text>
                      <Text fz="sm">
                        {formatDayLabel(expense.date)}
                      </Text>
                    </Stack>
                    <Text fw={800} style={{ whiteSpace: 'nowrap' }}>
                      {formatMoney(expense.amount, currency)}
                    </Text>
                  </Group>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
