import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Stack,
  Alert,
  Center,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';
import { signIn } from '@/libs/auth-client';

export default function SignInPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(t('auth.invalidCredentials'));
      } else {
        // Redirect to callback URL if provided, otherwise to home page
        const callbackUrl = router.query.callbackUrl as string || '/';
        router.push(callbackUrl);
      }
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Center mb="xl">
        <Title order={1}>{t('header.title')}</Title>
      </Center>

      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} ta="center" mb="xs">
          {t('auth.welcomeBack')}
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          {t('auth.enterCredentials')}
        </Text>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb="md"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label={t('auth.email')}
              placeholder="email@example.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              disabled={isLoading}
            />

            <PasswordInput
              label={t('auth.password')}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              disabled={isLoading}
            />

            <Button type="submit" fullWidth loading={isLoading}>
              {isLoading ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
