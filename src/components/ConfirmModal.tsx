import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface ConfirmModalProps {
  opened: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ opened, title, message, confirmLabel, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal opened={opened} onClose={onCancel} title={title} size="sm" zIndex={400}>
      <Stack>
        <Text>{message}</Text>
        <Group justify="flex-end" grow>
          <Button variant="default" onClick={onCancel}>
            Cancelar
          </Button>
          <Button color="red" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
