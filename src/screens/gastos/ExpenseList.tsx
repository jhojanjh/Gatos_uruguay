import { ActionIcon, Badge, Button, Card, ColorSwatch, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { Eye, ImagePlus, Pencil, Trash2 } from 'lucide-react';
import type { Category, Expense } from '@/types';
import { formatDayLabel } from '@/utils/dates';
import { formatMoney } from '@/utils/money';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  currency: string;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onOpenPhotos: (expense: Expense) => void;
}

export function ExpenseList({ expenses, categories, currency, onEdit, onDelete, onOpenPhotos }: ExpenseListProps) {
  return (
    <Stack gap="sm">
      {expenses.map((expense) => {
        const category = categories.find((item) => item.id === expense.categoryId);
        const photoCount = expense.photoIds.length;
        return (
          <Card key={expense.id} withBorder radius="lg" padding="md">
            <Stack gap="sm">
              <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" verticalSpacing="xs">
                <Group gap="sm" wrap="nowrap" miw={0}>
                  <ColorSwatch color={category?.color ?? 'gray'} size={14} mt={6} withShadow={false} />
                  <Stack gap={2} miw={0} style={{ flex: 1 }}>
                    <Text fw={800} style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                      {expense.description || category?.name || 'Gasto'}
                    </Text>
                    <Text fz="sm" style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                      {formatDayLabel(expense.date)} · {category?.name ?? 'Sin categoría'}
                    </Text>
                    {expense.fixedExpenseId && (
                      <Badge size="sm" variant="light" color="salvia" radius="xl" w="fit-content">
                        Gasto fijo
                      </Badge>
                    )}
                  </Stack>
                </Group>
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={800} fz="lg" style={{ whiteSpace: 'nowrap' }}>
                    {formatMoney(expense.amount, currency)}
                  </Text>
                </Group>
              </SimpleGrid>

              <Group justify="space-between" gap="xs" wrap="wrap">
                {photoCount > 0 ? (
                  <Button
                    variant="light"
                    color="terracota"
                    size="compact-md"
                    leftSection={<Eye size={18} />}
                    onClick={() => onOpenPhotos(expense)}
                  >
                    Ver factura ({photoCount})
                  </Button>
                ) : (
                  <Button
                    variant="subtle"
                    color="terracota"
                    size="compact-md"
                    leftSection={<ImagePlus size={18} />}
                    onClick={() => onOpenPhotos(expense)}
                  >
                    Agregar foto
                  </Button>
                )}
                <Group gap={4} wrap="nowrap">
                  <ActionIcon aria-label="Editar gasto" onClick={() => onEdit(expense)}>
                    <Pencil size={20} />
                  </ActionIcon>
                  <ActionIcon aria-label="Eliminar gasto" color="red" onClick={() => onDelete(expense)}>
                    <Trash2 size={20} />
                  </ActionIcon>
                </Group>
              </Group>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}
