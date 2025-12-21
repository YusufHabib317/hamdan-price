/* eslint-disable sonarjs/no-duplicate-string */
import { useCallback, useState, useEffect } from 'react';
import {
  Paper,
  TextInput,
  Button,
  Group,
  Table,
  ActionIcon,
  Stack,
  Box,
  Text,
  useMatches,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';
import { DeviceEntryRow } from './DeviceEntryRow';

export interface DeviceEntry {
  name: string;
  priceUsd: number;
  order: number;
}

export interface PricingTableData {
  id: string;
  title: string;
  entries: DeviceEntry[];
}

export interface PricingTableProps {
  table: PricingTableData;
  exchangeRate: number;
  onTitleChange: (title: string) => void;
  onAddRow: () => void;
  onDeleteRow: (entryIndex: number) => void;
  onEntryChange: (entryIndex: number, field: 'name' | 'priceUsd', value: string | number) => void;
  onDeleteTable: () => void;
}

export function PricingTable(props: PricingTableProps) {
  const {
    table,
    exchangeRate,
    onTitleChange,
    onAddRow,
    onDeleteRow,
    onEntryChange,
    onDeleteTable,
  } = props;
  const { t, lang } = useTranslation('common');
  const isRTL = lang === 'ar';

  const [localTitle, setLocalTitle] = useState(table.title);

  // Check if mobile view
  const isMobile = useMatches({
    base: true,
    sm: false,
  });

  // Sync local state when prop changes
  useEffect(() => {
    setLocalTitle(table.title);
  }, [table.title]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setLocalTitle(newTitle);
      onTitleChange(newTitle);
    },
    [onTitleChange],
  );

  const handleEntryFieldChange = useCallback(
    (entryIndex: number) => (field: 'name' | 'priceUsd', value: string | number) => {
      onEntryChange(entryIndex, field, value);
    },
    [onEntryChange],
  );

  const handleDeleteEntry = useCallback(
    (entryIndex: number) => () => {
      onDeleteRow(entryIndex);
    },
    [onDeleteRow],
  );

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <TextInput
            value={localTitle}
            onChange={handleTitleChange}
            placeholder={t('pricingTable.defaultTitle')}
            fw={600}
            size="md"
            style={{ flex: 1, maxWidth: 300 }}
            aria-label="Table title"
          />
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={onDeleteTable}
            aria-label={t('pricingTable.deleteTable')}
          >
            <IconTrash size={20} />
          </ActionIcon>
        </Group>

        {isMobile ? (
          // Mobile Card Layout
          <Stack gap="sm">
            {table.entries.map((entry, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Paper key={`${table.id}-${index}`} p="sm" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start">
                    <Box style={{ flex: 1 }}>
                      <Text size="xs" c="dimmed" mb={4}>
                        {t('pricingTable.deviceName')}
                      </Text>
                      <TextInput
                        value={entry.name}
                        onChange={(e) => handleEntryFieldChange(index)('name', e.target.value)}
                        placeholder={t('pricingTable.deviceName')}
                        style={{ textAlign: isRTL ? 'right' : 'left' }}
                      />
                    </Box>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={handleDeleteEntry(index)}
                      aria-label={t('actions.delete')}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                  <Group grow>
                    <Box>
                      <Text size="xs" c="dimmed" mb={4}>
                        {t('pricingTable.priceUsd')}
                      </Text>
                      <TextInput
                        type="number"
                        value={entry.priceUsd}
                        onChange={(e) => handleEntryFieldChange(index)('priceUsd', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        style={{ textAlign: isRTL ? 'right' : 'left' }}
                      />
                    </Box>
                    <Box>
                      <Text size="xs" c="dimmed" mb={4}>
                        {t('pricingTable.priceSyr')}
                      </Text>
                      <TextInput
                        value={(entry.priceUsd * exchangeRate).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        readOnly
                        style={{
                          textAlign: isRTL ? 'right' : 'left',
                          backgroundColor: 'var(--mantine-color-gray-0)',
                        }}
                      />
                    </Box>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          // Desktop Table Layout
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ textAlign: isRTL ? 'right' : 'left', minWidth: 180 }}>
                  {t('pricingTable.deviceName')}
                </Table.Th>
                <Table.Th style={{ textAlign: isRTL ? 'right' : 'left', minWidth: 140 }}>
                  {t('pricingTable.priceUsd')}
                </Table.Th>
                <Table.Th style={{ textAlign: isRTL ? 'right' : 'left', minWidth: 140 }}>
                  {t('pricingTable.priceSyr')}
                </Table.Th>
                <Table.Th style={{ width: 50, textAlign: 'center' }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {table.entries.map((entry, index) => (
                <DeviceEntryRow
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${table.id}-${index}`}
                  entry={entry}
                  exchangeRate={exchangeRate}
                  onFieldChange={handleEntryFieldChange(index)}
                  onDelete={handleDeleteEntry(index)}
                />
              ))}
            </Table.Tbody>
          </Table>
        )}

        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          onClick={onAddRow}
        >
          {t('pricingTable.addRow')}
        </Button>
      </Stack>
    </Paper>
  );
}

export default PricingTable;
