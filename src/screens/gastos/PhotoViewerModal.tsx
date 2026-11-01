import { useEffect, useState } from 'react';
import { ActionIcon, Badge, Button, Card, Center, Group, Loader, Modal, Stack, Text, Title, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';
import { PhotoPicker } from '@/components/PhotoPicker';
import { MAX_PHOTOS_PER_EXPENSE } from '@/config/constants';
import { photoService } from '@/services/photoService';
import { useApp } from '@/state/appContext';
import type { Expense } from '@/types';
import { compressImage } from '@/utils/imageCompression';
import classes from './PhotoViewerModal.module.css';

interface PhotoViewerModalProps {
  expenseId: string | null;
  onClose: () => void;
}

export function PhotoViewerModal({ expenseId, onClose }: PhotoViewerModalProps) {
  const { data } = useApp();
  const expense = data.expenses.find((item) => item.id === expenseId) ?? null;
  const isMobile = useMediaQuery('(max-width: 48em)');

  return (
    <Modal
      opened={expense !== null}
      onClose={onClose}
      title={<Title order={3}>Factura</Title>}
      size="lg"
      fullScreen={isMobile}
    >
      {expense && <PhotoViewerContent expense={expense} />}
    </Modal>
  );
}

interface LoadedPhoto {
  id: string;
  url: string | null;
}

function PhotoViewerContent({ expense }: { expense: Expense }) {
  const { updateData } = useApp();
  const [photos, setPhotos] = useState<LoadedPhoto[]>([]);
  const [loading, setLoading] = useState(expense.photoIds.length > 0);
  const [index, setIndex] = useState(0);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [busy, setBusy] = useState(false);

  const photoIdsKey = expense.photoIds.join(',');

  useEffect(() => {
    let active = true;
    let objectUrls: string[] = [];
    const ids = photoIdsKey ? photoIdsKey.split(',') : [];
    setLoading(ids.length > 0);

    Promise.all(
      ids.map(async (id) => {
        const blob = await photoService.getBlob(id);
        return { id, url: blob ? URL.createObjectURL(blob) : null };
      }),
    )
      .then((loaded) => {
        if (!active) {
          loaded.forEach((photo) => photo.url && URL.revokeObjectURL(photo.url));
          return;
        }
        objectUrls = loaded.flatMap((photo) => (photo.url ? [photo.url] : []));
        setPhotos(loaded);
      })
      .catch(() => {
        if (active) {
          notifications.show({
            color: 'red',
            title: 'No se pudieron abrir las fotos',
            message: 'Intenta de nuevo en unos segundos.',
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoIdsKey]);

  const safeIndex = Math.min(index, Math.max(0, photos.length - 1));
  const current = photos[safeIndex];
  const remaining = MAX_PHOTOS_PER_EXPENSE - expense.photoIds.length;

  function setPhotoIds(update: (ids: string[]) => string[]) {
    updateData((previous) => ({
      ...previous,
      expenses: previous.expenses.map((item) =>
        item.id === expense.id ? { ...item, photoIds: update(item.photoIds) } : item,
      ),
    }));
  }

  async function removeCurrent() {
    setConfirmRemove(false);
    if (!current) return;
    setPhotoIds((ids) => ids.filter((id) => id !== current.id));
    setIndex(0);
    try {
      await photoService.remove([current.id]);
    } catch {
      notifications.show({
        color: 'red',
        title: 'No se pudo borrar la foto',
        message: 'Se quitó del gasto, pero quedó guardada en el dispositivo.',
      });
    }
  }

  async function addPhotos(files: File[]) {
    setBusy(true);
    const results = await Promise.allSettled(
      files.map(async (file) => photoService.save(await compressImage(file))),
    );
    const newIds = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
    const failed = results.length - newIds.length;

    if (newIds.length > 0) setPhotoIds((ids) => [...ids, ...newIds]);
    if (failed > 0) {
      notifications.show({
        color: 'red',
        title: 'Foto no guardada',
        message: failed === 1 ? 'Una foto no se pudo guardar.' : `${failed} fotos no se pudieron guardar.`,
      });
    }
    setBusy(false);
  }

  return (
    <Stack gap="md">
      {loading && (
        <Center h={240}>
          <Loader color="terracota" />
        </Center>
      )}

      {!loading && current && (
        <>
          <Card withBorder radius="lg" padding="sm" className={classes.stage}>
            {current.url ? (
              <img src={current.url} alt={`Foto ${safeIndex + 1} de ${photos.length} de la factura`} className={classes.image} />
            ) : (
              <Text ta="center">Esta foto ya no está disponible en este dispositivo.</Text>
            )}
          </Card>

          <Group justify="space-between" wrap="nowrap">
            <ActionIcon
              aria-label="Foto anterior"
              variant="default"
              size="xl"
              disabled={safeIndex === 0}
              onClick={() => setIndex(safeIndex - 1)}
            >
              <ChevronLeft size={22} />
            </ActionIcon>
            <Badge size="lg" variant="light" color="terracota" radius="xl">
              {safeIndex + 1} de {photos.length}
            </Badge>
            <ActionIcon
              aria-label="Foto siguiente"
              variant="default"
              size="xl"
              disabled={safeIndex >= photos.length - 1}
              onClick={() => setIndex(safeIndex + 1)}
            >
              <ChevronRight size={22} />
            </ActionIcon>
          </Group>

          <Button color="red" variant="light" leftSection={<Trash2 size={18} />} onClick={() => setConfirmRemove(true)}>
            Quitar esta foto
          </Button>
        </>
      )}

      {!loading && photos.length === 0 && (
        <Text ta="center">Este gasto no tiene factura guardada.</Text>
      )}

      <Box>
        <Text fw={600} mb="sm">
          {remaining > 0 ? 'Agregar otra foto' : `Este gasto ya tiene ${MAX_PHOTOS_PER_EXPENSE} fotos`}
        </Text>
        <PhotoPicker remaining={remaining} busy={busy} onFiles={addPhotos} />
      </Box>

      <ConfirmModal
        opened={confirmRemove}
        title="¿Quitar esta foto?"
        message="La foto se borrará de este gasto y del dispositivo."
        confirmLabel="Sí, quitar"
        onConfirm={removeCurrent}
        onCancel={() => setConfirmRemove(false)}
      />
    </Stack>
  );
}
