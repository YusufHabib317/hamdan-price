import { Box, Container } from '@mantine/core';
import useTranslation from 'next-translate/useTranslation';
import { Header } from './Header';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { lang } = useTranslation();
  const isRtl = lang === 'ar';

  return (
    <Box
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ minHeight: '100vh' }}
    >
      <Header logoSrc="/logo/logo.png" />
      <Container size="xl" py="lg">
        {children}
      </Container>
    </Box>
  );
}

export default AppShell;
