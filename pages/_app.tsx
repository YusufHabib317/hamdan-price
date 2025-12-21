import '@mantine/core/styles.css';
import Head from 'next/head';
import {
  DirectionProvider, MantineProvider, Center, Loader,
} from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useEffect } from 'react';
import { theme } from '../theme';
import { queryClient } from '@/libs/query-client';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { useSession } from '@/libs/auth-client';

const RTL_LOCALES = ['ar'];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/auth/signin', '/auth/signup'];

// Routes that should skip auth check (static assets, API routes)
const SKIP_AUTH_CHECK = ['/_next', '/favicon', '/api', '/public'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const isPublicRoute = PUBLIC_ROUTES.some((route) => router.pathname.startsWith(route));
  const shouldSkipAuth = SKIP_AUTH_CHECK.some((route) => router.pathname.startsWith(route));

  useEffect(() => {
    // Skip auth check for public routes and static assets
    if (isPublicRoute || shouldSkipAuth) {
      return;
    }

    // Wait for session check to complete
    if (isPending) {
      return;
    }

    // Redirect to signin if no session
    if (!session) {
      const signInUrl = `/auth/signin?callbackUrl=${encodeURIComponent(router.asPath)}`;
      router.replace(signInUrl);
    }
  }, [session, isPending, router, isPublicRoute, shouldSkipAuth]);

  if (!isPublicRoute && !shouldSkipAuth && isPending) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!isPublicRoute && !shouldSkipAuth && !session) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return children;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation('common');
  const dir = RTL_LOCALES.includes(locale || 'en') ? 'rtl' : 'ltr';

  // Get system color scheme preference
  const systemColorScheme = useColorScheme();

  // Store color scheme in localStorage with system preference as default
  const [colorScheme] = useLocalStorage<'light' | 'dark'>({
    key: 'mantine-color-scheme',
    defaultValue: systemColorScheme,
    getInitialValueInEffect: true,
  });

  // Restore saved locale from cookie
  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const localeCookie = cookies.find((c) => c.startsWith('locale='));
    const savedLocale = localeCookie?.split('=')[1];

    if (savedLocale && savedLocale !== locale) {
      router.push(router.pathname, router.asPath, { locale: savedLocale });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DirectionProvider initialDirection={dir}>
        <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
          <Head>
            <title>{t('meta.title')}</title>
            <meta
              name="viewport"
              content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
            />
            <link rel="shortcut icon" href="/favicon.svg" />
          </Head>
          <AuthGuard>
            <Component {...pageProps} />
          </AuthGuard>
        </MantineProvider>
      </DirectionProvider>
    </QueryClientProvider>
  );
}
