import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  Group, Title, Box, Button, ActionIcon, useMantineColorScheme, useComputedColorScheme, Container,
} from '@mantine/core';
import { IconLanguage, IconSun, IconMoon } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';

export interface HeaderProps {
  logoSrc?: string;
}

export function Header({ logoSrc = '' }: HeaderProps) {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    document.cookie = `locale=${newLang}; path=/; max-age=31536000`;
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: newLang });
  };

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Box
      component="header"
      style={{
        borderBottom: '1px solid var(--mantine-color-gray-3)',
        backgroundColor: 'var(--mantine-color-body)',
      }}
      py="md"
    >
      <Container size="xl">
        <Group justify="space-between" align="center">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group gap="sm">
              {logoSrc && (
                <Image
                  src={logoSrc}
                  alt="Logo"
                  height={32}
                  width={32}
                  style={{ width: 'auto' }}
                />
              )}
              <Title order={3}>{t('header.title')}</Title>
            </Group>
          </Link>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              onClick={toggleColorScheme}
              size="lg"
              aria-label="Toggle color scheme"
            >
              {computedColorScheme === 'dark' ? (
                <IconSun size={18} />
              ) : (
                <IconMoon size={18} />
              )}
            </ActionIcon>
            <Button
              variant="light"
              leftSection={<IconLanguage size={18} />}
              onClick={toggleLanguage}
              size="sm"
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </Button>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}

export default Header;
