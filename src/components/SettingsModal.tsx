import { useState } from 'react';
import { Alert, Button, Group, Modal, Select, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Info, Trash2 } from 'lucide-react';
import { CURRENCY_OPTIONS, MEMBERS } from '@/config/constants';
import { useApp } from '@/state/appContext';
import { ConfirmModal } from '@/components/ConfirmModal';
import { MemberAvatar } from '@/components/MemberAvatar';

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const { data, updateData, currentUser, resetData } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    setResetting(true);
    try {
      await resetData();
      setConfirmReset(false);
      onClose();
      notifications.show({ color: 'teal', title: 'Listo', message: 'La app empieza de cero.' });
    } catch {
      notifications.show({
        color: 'red',
        title: 'No se pudo borrar',
        message: 'Intenta de nuevo en unos segundos.',
      });
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={onClose} title={<Title order={3}>Ajustes</Title>}>
        <Stack gap="lg">
          <Alert variant="light" color="salvia" icon={<Info size={20} />}>
            Los datos del hogar se sincronizan entre las dos cuentas autorizadas. Las fotos de factura quedan en el dispositivo donde se agregaron.
          </Alert>

          <Select
            label="Moneda"
            description="Se usa en todos los montos de la app"
            data={CURRENCY_OPTIONS}
            value={data.settings.currency}
            allowDeselect={false}
            onChange={(value) => {
              if (!value) return;
              updateData((previous) => ({ ...previous, settings: { ...previous.settings, currency: value } }));
            }}
          />

          <Stack gap="xs">
            <Text fw={600}>Usuario actual</Text>
            {currentUser && (
              <Group gap="sm">
                <MemberAvatar memberId={currentUser} />
                <Text>{MEMBERS[currentUser].name}</Text>
              </Group>
            )}
          </Stack>

          <Stack gap="xs">
            <Text fw={600}>Empezar de cero</Text>
            <Text size="sm">Borra los datos compartidos del hogar. Las fotos de factura de este dispositivo también se eliminan. No se puede deshacer.</Text>
            <Button
              variant="outline"
              color="red"
              leftSection={<Trash2 size={18} />}
              onClick={() => setConfirmReset(true)}
            >
              Empezar de cero
            </Button>
          </Stack>
        </Stack>
      </Modal>

      <ConfirmModal
        opened={confirmReset}
        title="¿Empezar de cero?"
        message="Se borrarán los gastos, saldos, listas y categorías de todo el hogar. También se eliminarán las fotos guardadas en este dispositivo."
        confirmLabel={resetting ? 'Borrando...' : 'Sí, borrar todo'}
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );
}
