import {
  Paper, Text, Stack, Group, Card, Badge, ActionIcon, Tooltip,
} from '@mantine/core';
import { IconTable, IconCurrencyDollar, IconCopy } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';
import type { PricingSnapshot } from '@/components/store/snapshots/types';

export interface SnapshotHistoryListProps {
  snapshots: PricingSnapshot[];
  onSnapshotSelect: (snapshotId: string) => void;
  onSnapshotDuplicate?: (snapshot: PricingSnapshot) => void;
}

export function SnapshotHistoryList({
  snapshots,
  onSnapshotSelect,
  onSnapshotDuplicate = undefined,
}: SnapshotHistoryListProps) {
  const { t } = useTranslation('common');

  if (snapshots.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Text c="dimmed" ta="center">
          {t('tableHistory.noSnapshots') || 'No items saved yet. Create your first item!'}
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {snapshots.map((snapshot) => {
        const tableCount = snapshot.tables.length;
        const totalEntries = snapshot.tables.reduce(
          (sum, table) => sum + table.entries.length,
          0,
        );

        return (
          <Card
            key={snapshot.id}
            shadow="sm"
            padding="md"
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => onSnapshotSelect(snapshot.id)}
          >
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={600} size="lg">
                    {snapshot.title || t('tableHistory.untitled') || 'Untitled Item'}
                  </Text>
                </div>
                <Group gap="xs">
                  <Badge
                    leftSection={<IconCurrencyDollar size={14} />}
                    variant="light"
                    color="blue"
                  >
                    {t('exchangeRate.rate') || 'Rate'}
                    :
                    {snapshot.rate}
                  </Badge>
                  {onSnapshotDuplicate && (
                    <Tooltip label={t('actions.duplicate') || 'Duplicate'}>
                      <ActionIcon
                        variant="light"
                        color="blue"
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSnapshotDuplicate(snapshot);
                        }}
                      >
                        <IconCopy size={18} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Group>

              <Group gap="md">
                <Badge
                  leftSection={<IconTable size={14} />}
                  variant="outline"
                  color="gray"
                >
                  {tableCount}
                  {' '}
                  {tableCount === 1 ? t('pricingTable.table') || 'table' : t('pricingTable.tables') || 'tables'}
                </Badge>
                <Text size="sm" c="dimmed">
                  {totalEntries}
                  {' '}
                  {totalEntries === 1 ? t('pricingTable.entry') || 'entry' : t('pricingTable.entries') || 'entries'}
                </Text>
              </Group>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}

export default SnapshotHistoryList;
