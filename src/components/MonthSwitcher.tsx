import { ActionIcon, Button, Group, Stack, Text } from '@mantine/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/state/appContext';
import { currentMonthKey, formatMonthLabel, shiftMonth } from '@/utils/dates';

export function MonthSwitcher() {
  const { selectedMonth, setSelectedMonth } = useApp();
  const isCurrentMonth = selectedMonth === currentMonthKey();

  return (
    <Group justify="space-between" wrap="nowrap" gap="xs">
      <ActionIcon aria-label="Mes anterior" onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}>
        <ChevronLeft size={22} />
      </ActionIcon>
      <Stack gap={0} align="center">
        <Text fw={800} fz="lg" lh={1.2}>
          {formatMonthLabel(selectedMonth)}
        </Text>
        {!isCurrentMonth && (
          <Button variant="subtle" size="compact-sm" onClick={() => setSelectedMonth(currentMonthKey())}>
            Ir al mes actual
          </Button>
        )}
      </Stack>
      <ActionIcon aria-label="Mes siguiente" onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}>
        <ChevronRight size={22} />
      </ActionIcon>
    </Group>
  );
}
