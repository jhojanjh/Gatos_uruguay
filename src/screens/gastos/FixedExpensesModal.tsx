import { useState } from 'react';
import { ActionIcon, Button, Card, Group, Modal, NumberInput, Select, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { Plus, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useApp } from '@/state/appContext';
import type { FixedExpense } from '@/types';
import { formatMonthLabel } from '@/utils/dates';
import { newId } from '@/utils/ids';
import { formatMoney } from '@/utils/money';

interface FixedExpensesModalProps {
  opened: boolean;
  onClose: () => void;
}

export function FixedExpensesModal({ opened, onClose }: FixedExpensesModalProps) {
  const { data, updateData, selectedMonth } = useApp();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [day, setDay] = useState<number | string>(1);
  const [attempted, setAttempted] = useState(false);
  const [deleting, setDeleting] = useState<FixedExpense | null>(null);

  const amountValue = typeof amount === 'number' ? amount : 0;
  const dayValue = typeof day === 'number' ? day : 0;
  const trimmedName = name.trim();
  const isValid = trimmedName !== '' && amountValue > 0 && categoryId !== null && dayValue >= 1 && dayValue <= 31;

  function addFixed() {
    setAttempted(true);
    if (!isValid || categoryId === null) return;
    updateData((previous) => ({
      ...previous,
      fixedExpenses: [
        ...previous.fixedExpenses,
        {
          id: newId(),
          name: trimmedName,
          amount: amountValue,
          categoryId,
          dayOfMonth: Math.round(dayValue),
          startMonth: selectedMonth,
        },
      ],
    }));
    setName('');
    setAmount('');
    setDay(1);
    setAttempted(false);
  }

  function removeFixed(id: string) {
    setDeleting(null);
    updateData((previous) => ({
      ...previous,
      fixedExpenses: previous.fixedExpenses.filter((fixed) => fixed.id !== id),
    }));
  }

  const currency = data.settings.currency;

  return (
    <>
      <Modal opened={opened} onClose={onClose} title={<Title order={3}>Gastos fijos</Title>} size="lg">
        <Stack gap="lg">
          <Text fz="sm">
            Se cargan solos cada mes desde {formatMonthLabel(selectedMonth).toLowerCase()}. Los gastos ya cargados no se
            borran al quitar un fijo.
          </Text>

          {data.fixedExpenses.length === 0 ? (
            <Text>Todavía no hay gastos fijos. Agrega el arriendo, la luz o internet.</Text>
          ) : (
            <Stack gap="sm">
              {data.fixedExpenses.map((fixed) => {
                const category = data.categories.find((item) => item.id === fixed.categoryId);
                return (
                  <Card key={fixed.id} withBorder radius="lg" padding="md">
                    <Group justify="space-between" wrap="nowrap" gap="sm">
                      <Stack gap={2} miw={0}>
                        <Text fw={800} truncate>
                          {fixed.name}
                        </Text>
                        <Text fz="sm">
                          {formatMoney(fixed.amount, currency)} · día {fixed.dayOfMonth} · {category?.name ?? 'Sin categoría'}
                        </Text>
                      </Stack>
                      <ActionIcon
                        aria-label={`Eliminar gasto fijo ${fixed.name}`}
                        color="red"
                        variant="subtle"
                        onClick={() => setDeleting(fixed)}
                      >
                        <Trash2 size={20} />
                      </ActionIcon>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          )}

          <Stack gap="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
            <Text fw={600}>Nuevo gasto fijo</Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label="Nombre"
                placeholder="Ej. Arriendo"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                error={attempted && trimmedName === '' ? 'Escribe un nombre' : undefined}
              />
              <NumberInput
                label="Monto"
                value={amount}
                onChange={setAmount}
                thousandSeparator="."
                decimalSeparator=","
                min={0}
                allowNegative={false}
                error={attempted && amountValue <= 0 ? 'Ingresa un monto' : undefined}
              />
              <Select
                label="Categoría"
                data={data.categories.map((category) => ({ value: category.id, label: category.name }))}
                value={categoryId}
                onChange={setCategoryId}
                placeholder="Elige una"
                error={attempted && categoryId === null ? 'Elige una categoría' : undefined}
              />
              <NumberInput
                label="Día de pago"
                value={day}
                onChange={setDay}
                min={1}
                max={31}
                allowDecimal={false}
                error={attempted && (dayValue < 1 || dayValue > 31) ? 'Entre 1 y 31' : undefined}
              />
            </SimpleGrid>
            <Button variant="light" color="terracota" leftSection={<Plus size={18} />} onClick={addFixed}>
              Agregar gasto fijo
            </Button>
          </Stack>
        </Stack>
      </Modal>

      <ConfirmModal
        opened={deleting !== null}
        title="¿Quitar este gasto fijo?"
        message={`“${deleting?.name ?? ''}” dejará de cargarse cada mes. Los gastos ya cargados se mantienen.`}
        confirmLabel="Sí, quitar"
        onConfirm={() => deleting && removeFixed(deleting.id)}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
