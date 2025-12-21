/* eslint-disable complexity */
import { useRouter } from 'next/router';
import {
  Stack,
  Loader,
  Center,
  Alert,
  Button,
  Group,
  Title,
  Paper,
  Text,
  Badge,
  Menu,
} from '@mantine/core';
import {
  IconAlertCircle, IconArrowLeft, IconCurrencyDollar, IconDownload, IconChevronDown, IconCoins,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import useTranslation from 'next-translate/useTranslation';
import { AppShell } from '@/components/layout';
import { PricingTableReadOnly } from '@/components/pricing';
import { getSnapshotQuery } from '@/components/store/snapshots';
import { downloadAllTablesAsImage } from '@/utils/downloadTableImage';
import { usdToSyr } from '@/utils/currency';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SnapshotViewPage() {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  const isRTL = lang === 'ar';

  const {
    data: snapshot,
    isLoading,
    error,
  } = useQuery(getSnapshotQuery({ id: id as string }));

  const handleBack = () => {
    router.push('/');
  };

  const handleDownloadAllTables = async (currency: 'USD' | 'SYP') => {
    if (!snapshot) return;

    const tables = snapshot.tables.map((table) => ({
      title: table.title,
      entries: table.entries.map((entry) => ({
        name: entry.name,
        priceUsd: entry.priceUsd,
        priceSyr: usdToSyr(entry.priceUsd, snapshot.rate),
      })),
    }));

    await downloadAllTablesAsImage({
      tables,
      date: formatDate(snapshot.createdAt),
      isRTL,
      snapshotTitle: snapshot.title || 'price-snapshot',
      currency,
    });
  };

  if (isLoading) {
    return (
      <AppShell>
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </AppShell>
    );
  }

  if (error || !snapshot) {
    return (
      <AppShell>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {t('errors.loadFailed') || 'Failed to load snapshot'}
        </Alert>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            {t('actions.backToHistory') || 'Back to History'}
          </Button>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                leftSection={<IconDownload size={16} />}
                rightSection={<IconChevronDown size={16} />}
                variant="filled"
              >
                {t('actions.downloadImage') || 'Download as Image'}
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{t('actions.downloadCurrency') || 'Select Currency'}</Menu.Label>
              <Menu.Item
                leftSection={<IconCurrencyDollar size={16} />}
                onClick={() => handleDownloadAllTables('USD')}
              >
                {t('actions.downloadUSD') || 'Download in USD'}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconCoins size={16} />}
                onClick={() => handleDownloadAllTables('SYP')}
              >
                {t('actions.downloadSYP') || 'Download in SYP (ل.س)'}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Paper shadow="xs" p="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <Title order={2}>
                {snapshot.title || t('tableHistory.untitled') || 'Untitled Item'}
              </Title>
              <Badge
                leftSection={<IconCurrencyDollar size={14} />}
                variant="light"
                color="blue"
                size="lg"
              >
                {t('exchangeRate.rate') || 'Rate'}
                :
                {' '}
                {snapshot.rate}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              {t('tableHistory.createdAt') || 'Created'}
              :
              {' '}
              {formatDate(snapshot.createdAt)}
            </Text>
            {snapshot.createdAt !== snapshot.updatedAt && (
              <Text size="sm" c="dimmed">
                {t('tableHistory.updatedAt') || 'Updated'}
                :
                {' '}
                {formatDate(snapshot.updatedAt)}
              </Text>
            )}
          </Stack>
        </Paper>

        <Title order={3}>{t('pricingTable.tables') || 'Tables'}</Title>

        <Stack gap="md">
          {snapshot.tables.map((table) => (
            <PricingTableReadOnly
              key={table.id}
              table={{
                id: table.id,
                title: table.title,
                entries: table.entries,
              }}
              exchangeRate={snapshot.rate}
            />
          ))}
        </Stack>
      </Stack>
    </AppShell>
  );
}
