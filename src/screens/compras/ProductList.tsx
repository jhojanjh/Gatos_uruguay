import { ActionIcon, Button, Card, Group, Stack, Text } from '@mantine/core';
import { Check, Minus, Plus, Trash2 } from 'lucide-react';
import type { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  emptyText: string;
  onQuantityChange: (product: Product, quantity: number) => void;
  onDelete: (product: Product) => void;
  onMarkPurchased?: (product: Product) => void;
}

export function ProductList({ products, emptyText, onQuantityChange, onDelete, onMarkPurchased }: ProductListProps) {
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
        <Card key={product.id} withBorder radius="lg" padding="md">
          <Stack gap="xs">
            <Text
              fw={700}
              size="sm"
              lh={1.45}
              style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
            >
              {product.name}
            </Text>

            <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
              <Group gap={4} wrap="nowrap">
                <ActionIcon
                  size="lg"
                  variant="light"
                  color="terracota"
                  aria-label={'Quitar una unidad de ' + product.name}
                  title="Quitar una unidad"
                  disabled={product.quantity <= 0}
                  onClick={() => onQuantityChange(product, product.quantity - 1)}
                >
                  <Minus size={16} />
                </ActionIcon>
                <Text fw={800} miw={28} ta="center" aria-live="polite">
                  {product.quantity}
                </Text>
                <ActionIcon
                  size="lg"
                  variant="light"
                  color="terracota"
                  aria-label={'Agregar una unidad de ' + product.name}
                  title="Agregar una unidad"
                  onClick={() => onQuantityChange(product, product.quantity + 1)}
                >
                  <Plus size={16} />
                </ActionIcon>
                <Text size="xs" c="dimmed">unidades</Text>
              </Group>

              <Group gap={4} wrap="nowrap">
                {onMarkPurchased && (
                  <Button
                    size="xs"
                    variant="light"
                    color="teal"
                    leftSection={<Check size={16} />}
                    onClick={() => onMarkPurchased(product)}
                  >
                    Comprado
                  </Button>
                )}
                <ActionIcon
                  size="lg"
                  variant="subtle"
                  color="red"
                  aria-label={'Eliminar ' + product.name}
                  title="Eliminar producto"
                  onClick={() => onDelete(product)}
                >
                  <Trash2 size={18} />
                </ActionIcon>
              </Group>
            </Group>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
