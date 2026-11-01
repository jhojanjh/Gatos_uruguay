import { useState, type FormEvent } from 'react';
import { ActionIcon, Button, Card, Checkbox, Group, Stack, Text, TextInput } from '@mantine/core';
import { CheckCheck, Plus, Trash2 } from 'lucide-react';
import type { ShoppingListItem } from '@/types';

interface ShoppingListPanelProps {
  items: ShoppingListItem[];
  onAdd: (name: string) => void;
  onToggle: (item: ShoppingListItem) => void;
  onRemove: (item: ShoppingListItem) => void;
  onClearCompleted: () => void;
}

export function ShoppingListPanel({ items, onAdd, onToggle, onRemove, onClearCompleted }: ShoppingListPanelProps) {
  const [name, setName] = useState('');
  const pending = items.filter((item) => !item.checked);
  const completed = items.filter((item) => item.checked);
  const sortedItems = [...pending, ...completed].sort((a, b) => {
    if (a.checked !== b.checked) return Number(a.checked) - Number(b.checked);
    return a.name.localeCompare(b.name, 'es');
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = name.trim();
    if (!value) return;
    onAdd(value);
    setName('');
  }

  return (
    <Stack gap="md">
      <Text c="dimmed" size="sm">
        La lista se comparte con la otra cuenta del hogar.
      </Text>

      <form onSubmit={handleSubmit}>
        <Group align="flex-end" wrap="nowrap">
          <TextInput
            style={{ flex: 1 }}
            label="Producto"
            placeholder="Ej. Leche"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            maxLength={100}
          />
          <Button type="submit" color="terracota" leftSection={<Plus size={18} />} disabled={!name.trim()}>
            Agregar
          </Button>
        </Group>
      </form>

      {completed.length > 0 && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">{completed.length} comprado(s)</Text>
          <Button
            variant="subtle"
            color="terracota"
            size="xs"
            leftSection={<CheckCheck size={16} />}
            onClick={onClearCompleted}
          >
            Limpiar comprados
          </Button>
        </Group>
      )}

      {sortedItems.length === 0 ? (
        <Card withBorder radius="xl" padding="xl">
          <Text ta="center">La lista está vacía. Agrega lo que necesitan comprar.</Text>
        </Card>
      ) : (
        <Stack gap="sm">
          {sortedItems.map((item) => (
            <Card key={item.id} withBorder radius="lg" padding="sm">
              <Group justify="space-between" wrap="nowrap" gap="sm">
                <Checkbox
                  checked={item.checked}
                  onChange={() => onToggle(item)}
                  color="terracota"
                  label={(
                    <Text
                      size="sm"
                      fw={600}
                      style={{ whiteSpace: 'normal', overflowWrap: 'anywhere', textDecoration: item.checked ? 'line-through' : undefined }}
                    >
                      {item.name}
                    </Text>
                  )}
                />
                <ActionIcon
                  size="lg"
                  variant="subtle"
                  color="red"
                  aria-label={'Quitar ' + item.name + ' de la lista'}
                  title="Quitar de la lista"
                  onClick={() => onRemove(item)}
                >
                  <Trash2 size={18} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
