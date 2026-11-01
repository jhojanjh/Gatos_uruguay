import { useEffect, useRef, useState } from 'react';
import { ActionIcon, Button, Group, Modal, NumberInput, Select, SimpleGrid, Stack, Text, TextInput, Title, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { X } from 'lucide-react';
import { MAX_PHOTOS_PER_EXPENSE } from '@/config/constants';
import { PhotoPicker } from '@/components/PhotoPicker';
import { photoService } from '@/services/photoService';
import { useApp } from '@/state/appContext';
import type { Expense } from '@/types';
import { currentMonthKey, dayKey, todayKey } from '@/utils/dates';
import { newId } from '@/utils/ids';
import { compressImage } from '@/utils/imageCompression';
import { formatMoney } from '@/utils/money';
import classes from './ExpenseFormModal.module.css';

interface ExpenseFormModalProps {
  opened: boolean;
  expense: Expense | null;
  onClose: () => void;
}

export function ExpenseFormModal({ opened, expense, onClose }: ExpenseFormModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={3}>{expense ? 'Editar gasto' : 'Nuevo gasto'}</Title>}
      size="lg"
    >
      {opened && <ExpenseForm expense={expense} onDone={onClose} />}
    </Modal>
  );
}

interface PendingPhoto {
  key: string;
  blob: Blob;
  url: string;
}

function ExpenseForm({ expense, onDone }: { expense: Expense | null; onDone: () => void }) {
  const { data, updateData, selectedMonth } = useApp();
  const isEdit = expense !== null;
  const currency = data.settings.currency;

  const [amount, setAmount] = useState<number | string>(expense?.amount ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(expense?.categoryId ?? data.categories[0]?.id ?? null);
  const [date, setDate] = useState(
    expense?.date ?? (selectedMonth === currentMonthKey() ? todayKey() : dayKey(selectedMonth, 1)),
  );
  const [description, setDescription] = useState(expense?.description ?? '');
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const pendingRef = useRef<PendingPhoto[]>([]);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);
  useEffect(() => {
    return () => pendingRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
  }, []);

  const amountValue = typeof amount === 'number' ? amount : 0;
  const amountError = attempted && !(amountValue > 0) ? 'Ingresa un monto mayor a cero' : undefined;
  const categoryError = attempted && !categoryId ? 'Elige una categoría' : undefined;
  const isValid = amountValue > 0 && categoryId !== null && date !== '';

  async function addPhotos(files: File[]) {
    setProcessingPhotos(true);
    const results = await Promise.allSettled(files.map((file) => compressImage(file)));
    const added: PendingPhoto[] = [];
    let failed = 0;
    for (const result of results) {
      if (result.status === 'fulfilled') {
        added.push({ key: newId(), blob: result.value, url: URL.createObjectURL(result.value) });
      } else {
        failed += 1;
      }
    }
    setPending((previous) => [...previous, ...added]);
    setProcessingPhotos(false);
    if (failed > 0) {
      notifications.show({
        color: 'red',
        title: 'Foto no válida',
        message: failed === 1 ? 'Una foto no se pudo procesar.' : `${failed} fotos no se pudieron procesar.`,
      });
    }
  }

  function removePending(key: string) {
    const target = pending.find((photo) => photo.key === key);
    if (target) URL.revokeObjectURL(target.url);
    setPending((previous) => previous.filter((photo) => photo.key !== key));
  }

  async function handleSubmit() {
    setAttempted(true);
    if (!isValid || categoryId === null) return;

    setSaving(true);
    const fields = {
      amount: amountValue,
      categoryId,
      date,
      description: description.trim(),
    };

    let photoIds: string[] = [];
    let failedPhotos = 0;
    if (!isEdit && pending.length > 0) {
      const results = await Promise.allSettled(pending.map((photo) => photoService.save(photo.blob)));
      photoIds = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
      failedPhotos = results.length - photoIds.length;
    }

    const editingId = expense?.id;
    updateData((previous) => {
      if (editingId) {
        return {
          ...previous,
          expenses: previous.expenses.map((item) => (item.id === editingId ? { ...item, ...fields } : item)),
        };
      }
      return {
        ...previous,
        expenses: [
          ...previous.expenses,
          {
            id: newId(),
            ...fields,
            photoIds,
            fixedExpenseId: null,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    });

    if (failedPhotos > 0) {
      notifications.show({
        color: 'yellow',
        title: 'Gasto guardado con advertencia',
        message: `${failedPhotos} foto${failedPhotos === 1 ? '' : 's'} no se pudo guardar en este dispositivo.`,
      });
    } else {
      notifications.show({
        color: 'teal',
        title: isEdit ? 'Gasto actualizado' : 'Gasto guardado',
        message: `${formatMoney(amountValue, currency)} registrado.`,
      });
    }
    setSaving(false);
    onDone();
  }

  return (
    <Stack gap="md">
      <NumberInput
        label="Monto"
        placeholder="Ej. 1.250"
        value={amount}
        onChange={setAmount}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        min={0}
        allowNegative={false}
        leftSection={<Text fz="sm" fw={600}>{currency}</Text>}
        leftSectionWidth={64}
        error={amountError}
        autoFocus
      />

      <Select
        label="Categoría"
        data={data.categories.map((category) => ({ value: category.id, label: category.name }))}
        value={categoryId}
        onChange={setCategoryId}
        allowDeselect={false}
        error={categoryError}
        comboboxProps={{ withinPortal: true }}
      />

      <TextInput label="Fecha" type="date" value={date} onChange={(event) => setDate(event.currentTarget.value)} />

      <TextInput
        label="Descripción (opcional)"
        placeholder="Ej. Compra del súper"
        value={description}
        onChange={(event) => setDescription(event.currentTarget.value)}
        maxLength={120}
      />

      {isEdit ? (
        <Text fz="sm">Las facturas de este gasto se administran desde el botón “Ver factura” del listado.</Text>
      ) : (
        <Stack gap="sm">
          <Text fw={600}>
            Fotos de la factura (opcional, hasta {MAX_PHOTOS_PER_EXPENSE})
          </Text>
          {pending.length > 0 && (
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
              {pending.map((photo, index) => (
                <Box key={photo.key} className={classes.thumb}>
                  <img src={photo.url} alt={`Miniatura ${index + 1} de la factura`} />
                  <ActionIcon
                    className={classes.removeThumb}
                    color="dark"
                    variant="filled"
                    size="md"
                    aria-label={`Quitar foto ${index + 1}`}
                    onClick={() => removePending(photo.key)}
                  >
                    <X size={16} />
                  </ActionIcon>
                </Box>
              ))}
            </SimpleGrid>
          )}
          <PhotoPicker
            remaining={MAX_PHOTOS_PER_EXPENSE - pending.length}
            busy={processingPhotos}
            onFiles={addPhotos}
          />
        </Stack>
      )}

      <Group justify="flex-end" grow>
        <Button variant="default" onClick={onDone}>
          Cancelar
        </Button>
        <Button color="terracota" loading={saving} onClick={handleSubmit}>
          {isEdit ? 'Guardar cambios' : 'Guardar gasto'}
        </Button>
      </Group>
    </Stack>
  );
}
