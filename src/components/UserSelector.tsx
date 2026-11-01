import { useState, type FormEvent } from 'react';
import { Alert, Button, Center, PasswordInput, Stack, Text, TextInput, ThemeIcon, Title } from '@mantine/core';
import { Wallet } from 'lucide-react';
import { useApp } from '@/state/appContext';

export function UserSelector() {
  const { signIn, authError, clearAuthError } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    clearAuthError();
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch {
      setError('No pudimos iniciar sesión. Revisa el correo y la contraseña.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Center mih="100dvh" p="lg">
      <Stack align="center" gap="xl" maw={420} w="100%">
        <Stack align="center" gap="xs">
          <ThemeIcon size={56} radius="xl" variant="light" color="terracota">
            <Wallet size={28} />
          </ThemeIcon>
          <Title order={1} ta="center" fz={28}>
            Presupuesto del hogar
          </Title>
          <Text ta="center" c="dimmed">
            Inicia sesión con una de las dos cuentas autorizadas.
          </Text>
        </Stack>

        {(error || authError) && (
          <Alert color="red" w="100%">
            {error || authError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Stack gap="md">
            <TextInput
              label="Correo electrónico"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.currentTarget.value);
                clearAuthError();
              }}
              required
            />
            <PasswordInput
              label="Contraseña"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.currentTarget.value);
                clearAuthError();
              }}
              required
            />
            <Button type="submit" color="terracota" loading={submitting} fullWidth>
              Iniciar sesión
            </Button>
          </Stack>
        </form>

        <Text ta="center" fz="sm" c="dimmed">
          El acceso se habilita desde las cuentas autorizadas del hogar.
        </Text>
      </Stack>
    </Center>
  );
}
