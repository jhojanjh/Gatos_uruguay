import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  emptyText: string;
  onQuantityChange: (product: Product, quantity: number) => void;
  onDelete: (product: Product) => void;
}

export function ProductList({ products, emptyText, onQuantityChange, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <Card withBorder radius="xl" padding="xl">
        <Text ta="center">{emptyText}</Text>
      </Card>
    );
  }

  return (
    <Stack gap="sm">
      {products.map((product) => (
        <Card key={product.id} withBorder radius="lg" padding="sm">
          <Group justify="space-between" wrap="nowrap" gap="sm">
            <Text fw={700} truncate style={{ minWidth: 0 }}>
              {product.name}
            </Text>
            <Group gap={4} wrap="nowrap">
              <ActionIcon
                variant="light"
                color="terracota"
                aria-label={`Quitar una unidad de ${product.name}`}
                disabled={product.quantity <= 0}
                onClick={() => onQuantityChange(product, product.quantity - 1)}
              >
                <Minus size={16} />
              </ActionIcon>
              <Text fw={800} miw={32} ta="center" aria-live="polite">
                {product.quantity}
              </Text>
              <ActionIcon
                variant="light"
                color="terracota"
                aria-label={`Agregar una unidad de ${product.name}`}
                onClick={() => onQuantityChange(product, product.quantity + 1)}
              >
                <Plus size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Eliminar ${product.name}`}
                onClick={() => onDelete(product)}
              >
                <Trash2 size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
