import { useRef, type ChangeEvent } from 'react';
import { Button, SimpleGrid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Camera, ImagePlus } from 'lucide-react';

interface PhotoPickerProps {
  remaining: number;
  busy?: boolean;
  onFiles: (files: File[]) => void;
}

export function PhotoPicker({ remaining, busy = false, onFiles }: PhotoPickerProps) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const disabled = busy || remaining <= 0;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    if (files.length > remaining) {
      notifications.show({
        color: 'yellow',
        title: 'Demasiadas fotos',
        message: `Solo puedes agregar ${remaining} foto${remaining === 1 ? '' : 's'} más.`,
      });
    }
    onFiles(files.slice(0, remaining));
  }

  return (
    <>
      <SimpleGrid cols={2} spacing="sm">
        <Button
          variant="light"
          color="terracota"
          leftSection={<Camera size={20} />}
          disabled={disabled}
          loading={busy}
          onClick={() => cameraInput.current?.click()}
        >
          Sacar foto
        </Button>
        <Button
          variant="light"
          color="terracota"
          leftSection={<ImagePlus size={20} />}
          disabled={disabled}
          onClick={() => galleryInput.current?.click()}
        >
          Elegir de la galería
        </Button>
      </SimpleGrid>
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleChange}
      />
      <input ref={galleryInput} type="file" accept="image/*" multiple hidden onChange={handleChange} />
    </>
  );
}
