import { useState } from 'react';
import { ActionIcon, Button, Card, Group, Modal, NumberInput, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Plus, Trash2 } from 'lucide-react';
import { CATEGORY_COLORS } from '@/config/constants';
import { useApp } from '@/state/appContext';
import { todayKey } from '@/utils/dates';
import { newId } from '@/utils/ids';
import { formatMoney } from '@/utils/money';
import { applyReceiptToData } from '@/utils/products';

interface ManualPurchaseModalProps {
  opened: boolean;
  onClose: () => void;
}

interface ManualPurchaseRow {
  key: string;
  name: string;
  quantity: number | string;
  price: number | string;
}

function newRow(): ManualPurchaseRow {
  return { key: newId(), name: '', quantity: 1, price: '' };
}

export function ManualPurchaseModal({ opened, onClose }: ManualPurchaseModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={<Title order={3}>Ingresar compra manualmente</Title>} size="lg">
      {opened && <ManualPurchaseForm onDone={onClose} />}
    </Modal>
  );
}

function ManualPurchaseForm({ onDone }: { onDone: () => void }) {
  const { data, updateData } = useApp();
  const currency = data.settings.currency;
  const [store, setStore] = useState('');
  const [date, setDate] = useState(todayKey());
  const [rows, setRows] = useState<ManualPurchaseRow[]>([newRow()]);
  const [paidTotal, setPaidTotal] = useState<number | string>('');
  const [attempted, setAttempted] = useState(false);

  const validRows = rows.filter(
    (row) => row.name.trim() !== '' && Number(row.quantity) > 0 && Number(row.price) > 0,
  );
  const itemsTotal = Math.round(validRows.reduce((sum, row) => sum + Number(row.price), 0) * 100) / 100;
  const totalPaid = paidTotal === '' ? itemsTotal : Number(paidTotal);
  const storeError = attempted && store.trim() === '' ? 'Escribe la tienda' : undefined;
  const totalError = attempted && !(totalPaid > 0) ? 'Ingresa el total pagado' : undefined;

  function updateRow(key: string, changes: Partial<ManualPurchaseRow>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...changes } : row)));
  }

  function savePurchase() {
    setAttempted(true);
    if (
      store.trim() === '' ||
      date === '' ||
      !(totalPaid > 0) ||
      validRows.length === 0 ||
      validRows.length !== rows.length
    ) {
      return;
    }

    const items = validRows.map((row) => ({
      name: row.name.trim(),
      quantity: Number(row.quantity),
      price: Number(row.price),
    }));
    const amountPaid = Math.round(totalPaid * 100) / 100;
    const createdAt = new Date().toISOString();

    updateData((previous) => {
      const next = applyReceiptToData(previous, { store: store.trim(), date, items });
      const supermarketCategory = next.categories.find(
        (category) => category.name.trim().toLocaleLowerCase('es') === 'supermercado',
      ) ?? {
        id: newId(),
        name: 'Supermercado',
        color: CATEGORY_COLORS[0],
        monthlyLimit: null,
      };

      return {
        ...next,
        categories: next.categories.some((category) => category.id === supermarketCategory.id)
          ? next.categories
          : [...next.categories, supermarketCategory],
        expenses: [
          ...next.expenses,
          {
            id: newId(),
            amount: amountPaid,
            categoryId: supermarketCategory.id,
            date,
            description: `Compra en ${store.trim()}`,
            photoIds: [],
            fixedExpenseId: null,
            createdAt,
          },
        ],
      };
    });

    notifications.show({
      color: 'teal',
      title: 'Compra y gasto guardados',
      message: `${items.length} artículos y ${formatMoney(amountPaid, currency)} en Supermercado.`,
    });
    onDone();
  }

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Anota los artículos, las cantidades y lo que pagaste. El total se registra como gasto de supermercado.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput
          label="Tienda"
          placeholder="Ej. Super Costo"
          value={store}
          onChange={(event) => setStore(event.currentTarget.value)}
          error={storeError}
        />
        <TextInput
          label="Fecha"
          type="date"
          value={date}
          onChange={(event) => setDate(event.currentTarget.value)}
        />
      </SimpleGrid>

      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text fw={600}>Artículos ({rows.length})</Text>
          <Button
            variant="subtle"
            color="terracota"
            leftSection={<Plus size={18} />}
            onClick={() => setRows((current) => [...current, newRow()])}
          >
            Agregar artículo
          </Button>
        </Group>

        {rows.map((row, index) => (
          <Card key={row.key} withBorder radius="lg" padding="sm">
            <Stack gap="xs">
              <Group justify="space-between" align="center" wrap="nowrap">
                <Text size="sm" fw={600}>Artículo {index + 1}</Text>
                <ActionIcon
                  aria-label={`Quitar artículo ${index + 1}`}
                  title="Quitar artículo"
                  color="red"
                  variant="subtle"
                  onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
                >
                  <Trash2 size={18} />
                </ActionIcon>
              </Group>
              <TextInput
                label="Nombre del producto"
                placeholder="Ej. Leche entera 1 L"
                value={row.name}
                onChange={(event) => updateRow(row.key, { name: event.currentTarget.value })}
                error={attempted && row.name.trim() === '' ? 'Escribe el nombre' : undefined}
              />
              <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
                <NumberInput
                  label="Cantidad"
                  value={row.quantity}
                  onChange={(value) => updateRow(row.key, { quantity: value })}
                  min={1}
                  allowDecimal={false}
                  allowNegative={false}
                  error={attempted && !(Number(row.quantity) > 0) ? 'Ingresa una cantidad válida' : undefined}
                />
                <NumberInput
                  label="Precio pagado por esta línea"
                  value={row.price}
                  onChange={(value) => updateRow(row.key, { price: value })}
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  min={0}
                  allowNegative={false}
                  error={attempted && !(Number(row.price) > 0) ? 'Ingresa el precio' : undefined}
                />
              </SimpleGrid>
            </Stack>
          </Card>
        ))}
      </Stack>

      <Stack gap="xs">
        <Text size="sm" c="dimmed">Suma de artículos: {formatMoney(itemsTotal, currency)}</Text>
        <NumberInput
          label="Total pagado"
          description="Puedes ajustarlo si el ticket tiene descuentos."
          value={paidTotal === '' ? itemsTotal : paidTotal}
          onChange={setPaidTotal}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          min={0}
          allowNegative={false}
          error={totalError}
        />
      </Stack>

      <Group justify="flex-end" grow>
        <Button variant="default" onClick={onDone}>Cancelar</Button>
        <Button color="terracota" onClick={savePurchase}>Guardar compra</Button>
      </Group>
    </Stack>
  );
}
