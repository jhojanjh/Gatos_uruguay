import { Stack, Text, ThemeIcon, Title } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';

interface PlaceholderScreenProps {
  title: string;
  icon: LucideIcon;
}

export function PlaceholderScreen({ title, icon: Icon }: PlaceholderScreenProps) {
  return (
    <Stack align="center" gap="md" py={64} ta="center">
      <ThemeIcon size={64} radius="xl" variant="light" color="terracota">
        <Icon size={32} />
      </ThemeIcon>
      <Title order={2}>{title}</Title>
      <Text maw={360}>Esta sección llegará en la próxima entrega.</Text>
    </Stack>
  );
}
