import { Badge, Card, Group, Stack, Text, Title } from '@mantine/core';
import { Store } from 'lucide-react';
import { useApp } from '@/state/appContext';
import { formatDayLabel } from '@/utils/dates';
import { formatMoney } from '@/utils/money';
import { getStorePrices } from '@/utils/products';

export function PreciosScreen() {
  const { data } = useApp();
  const currency = data.settings.currency;

  const rows = data.products
    .map((product) => ({ product, prices: getStorePrices(data.purchases, product.id) }))
    .filter((row) => row.prices.length > 0)
    .sort(
      (a, b) =>
        Number(a.product.quantity > 0) - Number(b.product.quantity > 0) ||
        a.product.name.localeCompare(b.product.name, 'es'),
    );

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={2}>Precios</Title>
        <Text>Compara en qué tienda sale más barato cada producto, según tus facturas.</Text>
      </Stack>

      {rows.length === 0 ? (
        <Card withBorder radius="xl" padding="xl">
          <Stack align="center" gap="xs" ta="center">
            <Store size={32} />
            <Text fw={800}>Todavía no hay precios para comparar</Text>
            <Text>Escanea una factura en la pestaña Compras y aquí verás los precios por tienda.</Text>
          </Stack>
        </Card>
      ) : (
        <Stack gap="md">
          {rows.map(({ product, prices }) => (
            <Card key={product.id} withBorder radius="lg" padding="md">
              <Stack gap="sm">
                <Group justify="space-between" wrap="nowrap" gap="sm">
                  <Text fw={800} truncate style={{ minWidth: 0 }}>
                    {product.name}
                  </Text>
                  {product.quantity <= 0 && (
                    <Badge color="terracota" variant="light" radius="xl">
                      Faltante
                    </Badge>
                  )}
                </Group>
                <Stack gap={6}>
                  {prices.map((price, index) => (
                    <Group key={price.store} justify="space-between" wrap="nowrap" gap="sm">
                      <Stack gap={0} miw={0}>
                        <Text fw={600} truncate>
                          {price.store}
                        </Text>
                        <Text fz="sm">Último precio: {formatDayLabel(price.date)}</Text>
                      </Stack>
                      <Group gap="xs" wrap="nowrap">
                        {index === 0 && prices.length > 1 && (
                          <Badge color="salvia" variant="light" radius="xl">
                            Mejor precio
                          </Badge>
                        )}
                        <Text fw={800} style={{ whiteSpace: 'nowrap' }}>
                          {formatMoney(price.unitPrice, currency)}
                        </Text>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
