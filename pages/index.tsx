import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Stack, Loader, Center, Alert, Button, Group, Title, Text,
} from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import useTranslation from 'next-translate/useTranslation';
import { AppShell } from '@/components/layout';
import { SnapshotHistoryList } from '@/components/pricing';
import { getSnapshotsQuery, PricingSnapshot } from '@/components/store/snapshots';

const PAGE_SIZE = 10;

export default function IndexPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [allSnapshots, setAllSnapshots] = useState<PricingSnapshot[]>([]);

  // Fetch all snapshots with pagination
  const {
    data: snapshotsData,
    isLoading,
    error,
    isFetching,
  } = useQuery(getSnapshotsQuery({
    pagination: {
      page,
      pageSize: PAGE_SIZE,
    },
  }));

  // Accumulate snapshots as we load more pages
  useEffect(() => {
    if (snapshotsData?.data) {
      if (page === 1) {
        setAllSnapshots(snapshotsData.data);
      } else {
        setAllSnapshots((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const newSnapshots = snapshotsData.data.filter((s) => !existingIds.has(s.id));
          return [...prev, ...newSnapshots];
        });
      }
    }
  }, [snapshotsData, page]);

  const handleSnapshotSelect = useCallback(
    (snapshotId: string) => {
      router.push(`/snapshot/${snapshotId}`);
    },
    [router],
  );

  const handleAddNew = useCallback(() => {
    router.push('/add');
  }, [router]);

  const handleLoadMore = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);

  const handleSnapshotDuplicate = useCallback(
    (snapshot: PricingSnapshot) => {
      // Navigate to /add page with snapshot data as query parameter
      const snapshotData = encodeURIComponent(JSON.stringify(snapshot));
      router.push(`/add?duplicate=${snapshotData}`);
    },
    [router],
  );

  const pagination = snapshotsData?.pagination;
  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  if (isLoading && page === 1) {
    return (
      <AppShell>
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {t('errors.loadFailed')}
        </Alert>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>{t('tableHistory.title') || 'History'}</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddNew}
            variant="filled"
          >
            {t('actions.addNewItem') || 'Add New Item'}
          </Button>
        </Group>

        <SnapshotHistoryList
          snapshots={allSnapshots}
          onSnapshotSelect={handleSnapshotSelect}
          onSnapshotDuplicate={handleSnapshotDuplicate}
        />

        {pagination && (
          <Group justify="center" mt="md">
            <Text size="sm" c="dimmed">
              {t('tableHistory.showingItems', {
                showing: allSnapshots.length,
                total: pagination.total,
              }) || `Showing ${allSnapshots.length} of ${pagination.total} items`}
            </Text>
          </Group>
        )}

        {hasMore && (
          <Center mt="md">
            <Button
              onClick={handleLoadMore}
              loading={isFetching}
              variant="outline"
              size="md"
            >
              {t('actions.loadMore') || 'Load More'}
            </Button>
          </Center>
        )}
      </Stack>
    </AppShell>
  );
}
