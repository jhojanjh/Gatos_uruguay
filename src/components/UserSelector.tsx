import { Center, SimpleGrid, Stack, Text, ThemeIcon, Title, UnstyledButton } from '@mantine/core';
import { Wallet } from 'lucide-react';
import { MEMBER_LIST } from '@/config/constants';
import { MemberAvatar } from '@/components/MemberAvatar';
import { useApp } from '@/state/appContext';
import classes from './UserSelector.module.css';

export function UserSelector() {
  const { setCurrentUser } = useApp();

  return (
    <Center mih="100dvh" p="lg">
      <Stack align="center" gap="xl" maw={480} w="100%">
        <Stack align="center" gap="xs">
          <ThemeIcon size={56} radius="xl" variant="light" color="terracota">
            <Wallet size={28} />
          </ThemeIcon>
          <Title order={1} ta="center" fz={28}>
            ¿Quién está usando la app?
          </Title>
        </Stack>

        <SimpleGrid cols={2} spacing="md" w="100%">
          {MEMBER_LIST.map((member) => (
            <UnstyledButton key={member.id} className={classes.memberCard} onClick={() => setCurrentUser(member.id)}>
              <MemberAvatar memberId={member.id} size={80} />
              <Text fw={800} fz="lg">
                {member.name}
              </Text>
            </UnstyledButton>
          ))}
        </SimpleGrid>

        <Text ta="center" fz="sm">
          Sin contraseña en esta versión. Los datos se guardan solo en este dispositivo.
        </Text>
      </Stack>
    </Center>
  );
}
