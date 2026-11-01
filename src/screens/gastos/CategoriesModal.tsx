import { useState } from 'react';
import { ActionIcon, Button, Group, Modal, NumberInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/state/appContext';
import { CATEGORY_COLORS } from '@/config/constants';
import { newId } from '@/utils/ids';

interface CategoriesModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CategoriesModal({ opened, onClose }: CategoriesModalProps) {
  const { data, updateData } = useApp();
  const [newName, setNewName] = useState('');
  const [newLimit, setNewLimit] = useState<number | string>('');
  const [nameError, setNameError] = useState<string | undefined>();

  const usedCategoryIds = new Set([
    ...data.expenses.map((expense) => expense.categoryId),
    ...data.fixedExpenses.map((fixed) => fixed.categoryId),
  ]);

  function updateCategory(id: string, changes: Partial<{ name: string; monthlyLimit: number | null }>) {
    updateData((previous) => ({
      ...previous,
      categories: previous.categories.map((category) => (category.id === id ? { ...category, ...changes } : category)),
    }));
  }

  function deleteCategory(id: string) {
    updateData((previous) => ({
      ...previous,
      categories: previous.categories.filter((category) => category.id !== id),
    }));
  }

  function addCategory() {
    const name = newName.trim();
    if (!name) {
      setNameError('Escribe un nombre para la categoría');
      return;
    }
    updateData((previous) => ({
      ...previous,
      categories: [
        ...previous.categories,
        {
          id: newId(),
          name,
          color: CATEGORY_COLORS[previous.categories.length % CATEGORY_COLORS.length],
          monthlyLimit: typeof newLimit === 'number' && newLimit > 0 ? newLimit : null,
        },
      ],
    }));
    setNewName('');
    setNewLimit('');
    setNameError(undefined);
  }

  return (
    <Modal opened={opened} onClose={onClose} title={<Title order={3}>Categorías</Title>} size="lg">
      <Stack gap="lg">
        <Text fz="sm">
          Pon un límite mensual para recibir alertas al 80 % y al 100 %. Deja el límite vacío si no quieres uno.
        </Text>

        <Stack gap="sm">
          {data.categories.map((category) => {
            const inUse = usedCategoryIds.has(category.id);
            return (
              <Group key={category.id} align="flex-end" wrap="nowrap" gap="sm">
                <TextInput
                  label="Nombre"
                  value={category.name}
                  onChange={(event) => updateCategory(category.id, { name: event.currentTarget.value })}
                  style={{ flex: 1, minWidth: 0 }}
                  aria-label={`Nombre de ${category.name}`}
                />
                <NumberInput
                  label="Límite mensual"
                  placeholder="Sin límite"
                  value={category.monthlyLimit ?? ''}
                  onChange={(value) =>
                    updateCategory(category.id, { monthlyLimit: typeof value === 'number' && value > 0 ? value : null })
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  min={0}
                  allowNegative={false}
                  style={{ width: 150 }}
                />
                <ActionIcon
                  aria-label={`Eliminar categoría ${category.name}`}
                  color="red"
                  variant="subtle"
                  disabled={inUse}
                  title={inUse ? 'Tiene gastos asociados, no se puede eliminar' : 'Eliminar categoría'}
                  onClick={() => deleteCategory(category.id)}
                >
                  <Trash2 size={20} />
                </ActionIcon>
              </Group>
            );
          })}
        </Stack>

        <Stack gap="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
          <Text fw={600}>Nueva categoría</Text>
          <Group align="flex-start" grow>
            <TextInput
              placeholder="Ej. Mascotas"
              value={newName}
              onChange={(event) => {
                setNewName(event.currentTarget.value);
                setNameError(undefined);
              }}
              error={nameError}
            />
            <NumberInput
              placeholder="Límite (opcional)"
              value={newLimit}
              onChange={setNewLimit}
              thousandSeparator="."
              decimalSeparator=","
              min={0}
              allowNegative={false}
            />
          </Group>
          <Button variant="light" color="terracota" leftSection={<Plus size={18} />} onClick={addCategory}>
            Agregar categoría
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
