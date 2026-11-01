import { useState } from 'react';
import { ActionIcon, Button, Card, Checkbox, Group, Modal, NumberInput, Stack, Text, TextInput, Title, SimpleGrid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Plus, Trash2 } from 'lucide-react';
import { PhotoPicker } from '@/components/PhotoPicker';
import { receiptOcrService } from '@/services/receiptOcrService';
import { useApp } from '@/state/appContext';
import { todayKey } from '@/utils/dates';
import { newId } from '@/utils/ids';
import { formatMoney } from '@/utils/money';
import { applyReceiptToData } from '@/utils/products';
import { parseReceiptText, type ReceiptLine } from '@/utils/receiptParser';

interface ScanReceiptModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ScanReceiptModal({ opened, onClose }: ScanReceiptModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={<Title order={3}>Escanear factura</Title>} size="lg">
      {opened && <ScanReceiptForm onDone={onClose} />}
    </Modal>
  );
}

interface ReviewRow {
  key: string;
  include: boolean;
  name: string;
  quantity: number | string;
  price: number | string;
}

function toRows(lines: ReceiptLine[]): ReviewRow[] {
  return lines.map((line) => ({
    key: newId(),
    include: true,
    name: line.name,
    quantity: line.quantity,
    price: line.price,
  }));
}

function isRowValid(row: ReviewRow): boolean {
  return row.name.trim() !== '' && Number(row.quantity) > 0 && Number(row.price) > 0;
}

function ScanReceiptForm({ onDone }: { onDone: () => void }) {
  const { data, updateData } = useApp();
  const currency = data.settings.currency;

  const [reading, setReading] = useState(false);
  const [rows, setRows] = useState<ReviewRow[] | null>(null);
  const [store, setStore] = useState('');
  const [date, setDate] = useState(todayKey());
  const [attempted, setAttempted] = useState(false);

  const included = (rows ?? []).filter((row) => row.include);
  const validIncluded = included.filter(isRowValid);
  const total = validIncluded.reduce((sum, row) => sum + Number(row.price), 0);
  const storeError = attempted && store.trim() === '' ? 'Escribe en qué tienda compraste' : undefined;

  async function handlePhoto(files: File[]) {
    const [photo] = files;
    if (!photo) return;
    setReading(true);
    try {
      const lines = parseReceiptText(await receiptOcrService.readText(photo));
      if (lines.length === 0) {
        notifications.show({
          color: 'yellow',
          title: 'No encontramos artículos',
          message: 'Puedes escribirlos a mano en la lista.',
        });
      }
      setRows(toRows(lines));
    } catch {
      notifications.show({
        color: 'red',
        title: 'No se pudo leer la factura',
        message: 'Prueba con una foto más clara o escribe los artículos a mano.',
      });
      setRows([]);
    } finally {
      setReading(false);
    }
  }

  function updateRow(key: string, changes: Partial<ReviewRow>) {
    setRows((previous) => previous?.map((row) => (row.key === key ? { ...row, ...changes } : row)) ?? null);
  }

  function removeRow(key: string) {
    setRows((previous) => previous?.filter((row) => row.key !== key) ?? null);
  }

  function addRow() {
    setRows((previous) => [
      ...(previous ?? []),
      { key: newId(), include: true, name: '', quantity: 1, price: '' },
    ]);
  }

  function handleSave() {
    setAttempted(true);
    if (store.trim() === '' || validIncluded.length === 0 || validIncluded.length !== included.length) return;

    const items = validIncluded.map((row) => ({
      name: row.name.trim(),
      quantity: Number(row.quantity),
      price: Number(row.price),
    }));
    updateData((previous) => applyReceiptToData(previous, { store, date, items }));
    notifications.show({
      color: 'teal',
      title: 'Factura guardada',
      message: `${items.length} artículo${items.length === 1 ? '' : 's'} agregados a lo que tenemos.`,
    });
    onDone();
  }

  if (rows === null) {
    return (
      <Stack gap="md" align="center" py="md">
        <Text ta="center">
          Saca una foto clara de la factura. Los artículos se leen en este dispositivo y puedes revisarlos antes de guardar.
        </Text>
        <PhotoPicker remaining={1} busy={reading} onFiles={handlePhoto} />
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput
          label="Tienda"
          placeholder="Ej. Disco, Tienda Inglesa"
          value={store}
          onChange={(event) => setStore(event.currentTarget.value)}
          error={storeError}
        />
        <TextInput label="Fecha" type="date" value={date} onChange={(event) => setDate(event.currentTarget.value)} />
      </SimpleGrid>

      <Stack gap="sm">
        <Text fw={600}>Artículos ({included.length})</Text>
        {rows.length === 0 && <Text fz="sm">Escribe los artículos de la factura con el botón de abajo.</Text>}
        {rows.map((row) => (
          <Card key={row.key} withBorder radius="lg" padding="sm">
            <Group wrap="nowrap" align="flex-start" gap="sm">
              <Checkbox
                mt={8}
                checked={row.include}
                aria-label={`Incluir ${row.name || 'artículo'}`}
                onChange={(event) => updateRow(row.key, { include: event.currentTarget.checked })}
              />
              <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                <TextInput
                  placeholder="Nombre del artículo"
                  value={row.name}
                  onChange={(event) => updateRow(row.key, { name: event.currentTarget.value })}
                  error={row.include && row.name.trim() === '' ? 'Escribe el nombre' : undefined}
                />
                <SimpleGrid cols={2} spacing="xs">
                  <NumberInput
                    aria-label="Cantidad"
                    placeholder="Cantidad"
                    value={row.quantity}
                    onChange={(value) => updateRow(row.key, { quantity: value })}
                    min={1}
                    allowDecimal={false}
                    allowNegative={false}
                  />
                  <NumberInput
                    aria-label="Precio pagado"
                    placeholder="Precio"
                    value={row.price}
                    onChange={(value) => updateRow(row.key, { price: value })}
                    thousandSeparator="."
                    decimalSeparator=","
                    min={0}
                    allowNegative={false}
                    error={row.include && Number(row.price) <= 0 ? 'Pon el precio' : undefined}
                  />
                </SimpleGrid>
              </Stack>
              <ActionIcon aria-label="Quitar artículo" color="red" variant="subtle" mt={4} onClick={() => removeRow(row.key)}>
                <Trash2 size={18} />
              </ActionIcon>
            </Group>
          </Card>
        ))}
        <Button variant="subtle" color="terracota" leftSection={<Plus size={18} />} onClick={addRow} w="fit-content">
          Agregar artículo
        </Button>
      </Stack>

      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Text fw={800}>Total: {formatMoney(total, currency)}</Text>
        <Group gap="sm">
          <Button variant="default" onClick={() => setRows(null)}>
            Otra foto
          </Button>
          <Button
            color="terracota"
            disabled={validIncluded.length === 0}
            onClick={handleSave}
          >
            Guardar {validIncluded.length} artículo{validIncluded.length === 1 ? '' : 's'}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
