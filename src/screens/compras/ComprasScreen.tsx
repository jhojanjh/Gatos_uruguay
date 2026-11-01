import { useState } from 'react';
import { Button, Group, SegmentedControl, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Plus, ScanLine } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useApp } from '@/state/appContext';
import type { Product } from '@/types';
import { newId } from '@/utils/ids';
import { normalizeProductName } from '@/utils/products';
import { ProductList } from './ProductList';
import { ScanReceiptModal } from './ScanReceiptModal';
import { ManualPurchaseModal } from './ManualPurchaseModal';

type ComprasView = 'tenemos' | 'faltantes';

function byName(a: Product, b: Product): number {
  return a.name.localeCompare(b.name, 'es');
}

export function ComprasScreen() {
  const { data, updateData } = useApp();
  const [view, setView] = useState<ComprasView>('tenemos');
  const [scanOpen, setScanOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleting, setDeleting] = useState<Product | null>(null);

  const inStock = data.products.filter((product) => product.quantity > 0).sort(byName);
  const missing = data.products.filter((product) => product.quantity <= 0).sort(byName);

  function setQuantity(product: Product, quantity: number) {
    updateData((previous) => ({
      ...previous,
      products: previous.products.map((item) =>
        item.id === product.id ? { ...item, quantity: Math.max(0, quantity) } : item,
      ),
    }));
  }

  function addMissing() {
    const name = newName.trim();
    if (name === '') return;
    const key = normalizeProductName(name);
    const existing = data.products.find((product) => normalizeProductName(product.name) === key);
    updateData((previous) => ({
      ...previous,
      products: existing
        ? previous.products.map((product) => (product.id === existing.id ? { ...product, quantity: 0 } : product))
        : [...previous.products, { id: newId(), name, quantity: 0 }],
    }));
    setNewName('');
    notifications.show({ color: 'teal', title: 'Agregado a faltantes', message: name });
  }

  function confirmDelete() {
    if (!deleting) return;
    const id = deleting.id;
    setDeleting(null);
    updateData((previous) => ({
      ...previous,
      products: previous.products.filter((product) => product.id !== id),
      purchases: previous.purchases.filter((purchase) => purchase.productId !== id),
    }));
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
        <Stack gap={4}>
          <Title order={2}>Compras</Title>
          <Text>Lo que tenemos en casa y lo que falta por comprar.</Text>
        </Stack>
        <Group gap="xs" wrap="wrap">
          <Button
            variant="light"
            color="terracota"
            leftSection={<Plus size={20} />}
            onClick={() => setManualOpen(true)}
          >
            Agregar compra manual
          </Button>
          <Button leftSection={<ScanLine size={20} />} color="terracota" onClick={() => setScanOpen(true)}>
            Escanear factura
          </Button>
        </Group>
      </Group>

      <SegmentedControl
        fullWidth
        value={view}
        onChange={(value) => setView(value as ComprasView)}
        data={[
          { value: 'tenemos', label: `Tenemos (${inStock.length})` },
          { value: 'faltantes', label: `Faltantes (${missing.length})` },
        ]}
      />

      {view === 'tenemos' ? (
        <ProductList
          products={inStock}
          emptyText="Todavía no tienes productos. Agrega una compra manualmente o escanea una factura."
          onQuantityChange={setQuantity}
          onDelete={setDeleting}
        />
      ) : (
        <Stack gap="md">
          <Group gap="sm" align="flex-end" wrap="nowrap">
            <TextInput
              style={{ flex: 1 }}
              label="Producto que falta"
              placeholder="Ej. Leche"
              value={newName}
              onChange={(event) => setNewName(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addMissing();
              }}
            />
            <Button variant="light" color="terracota" leftSection={<Plus size={18} />} onClick={addMissing}>
              Agregar
            </Button>
          </Group>
          <ProductList
            products={missing}
            emptyText="No hay faltantes. Cuando algo se acabe, aparecerá aquí."
            onQuantityChange={setQuantity}
            onDelete={setDeleting}
          />
        </Stack>
      )}

      <ScanReceiptModal opened={scanOpen} onClose={() => setScanOpen(false)} />
      <ManualPurchaseModal opened={manualOpen} onClose={() => setManualOpen(false)} />

      <ConfirmModal
        opened={deleting !== null}
        title="¿Eliminar este producto?"
        message={`Se borrará “${deleting?.name ?? ''}” junto con su historial de precios. No se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </Stack>
  );
}
