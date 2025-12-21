import { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Stack,
  Title,
  Group,
  Alert,
  Text,
  SimpleGrid,
} from '@mantine/core';
import { IconPlus, IconAlertCircle, IconDeviceFloppy } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { AppShell } from '@/components/layout';
import { ExchangeRateInput, PricingTable } from '@/components/pricing';
import { createSnapshotMutation } from '@/components/store/snapshots';
import type { PricingSnapshot } from '@/components/store/snapshots/types';

// Local state types
interface LocalEntry {
  name: string;
  priceUsd: number;
  order: number;
}

interface LocalTable {
  id: string;
  title: string;
  entries: LocalEntry[];
}

interface AppState {
  rate: number;
  tables: LocalTable[];
}

const INITIAL_STATE: AppState = {
  rate: 1,
  tables: [],
};

export default function IndexPage() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const router = useRouter();

  // Local state for creating new snapshot
  const [localState, setLocalState] = useState<AppState>(INITIAL_STATE);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize state from router state (for duplicate functionality)
  useEffect(() => {
    if (!isInitialized && router.isReady) {
      const duplicateData = router.query.duplicate as string | undefined;

      if (duplicateData) {
        try {
          const snapshot: PricingSnapshot = JSON.parse(decodeURIComponent(duplicateData));

          // Convert snapshot data to local state format
          const initialTables: LocalTable[] = snapshot.tables.map((table) => ({
            id: `temp-${Date.now()}-${Math.random()}`,
            title: table.title,
            entries: table.entries.map((entry, index) => ({
              name: entry.name,
              priceUsd: entry.priceUsd,
              order: index,
            })),
          }));

          setLocalState({
            rate: snapshot.rate,
            tables: initialTables,
          });
        } catch {
          // If parsing fails, just use initial state
        }
      }

      setIsInitialized(true);
    }
  }, [router.isReady, router.query.duplicate, isInitialized]);

  // Mutation
  const createSnapshot = useMutation(createSnapshotMutation());

  // Handlers for local state changes
  const handleRateChange = useCallback((rate: number) => {
    setLocalState((prev) => ({ ...prev, rate }));
    setSaveSuccess(false);
  }, []);

  const handleAddTable = useCallback(() => {
    const newTable: LocalTable = {
      id: `temp-${Date.now()}`,
      title: t('pricingTable.defaultTitle') || 'New Table',
      entries: [
        {
          name: '',
          priceUsd: 0,
          order: 0,
        },
      ],
    };
    setLocalState((prev) => ({
      ...prev,
      tables: [...prev.tables, newTable],
    }));
    setSaveSuccess(false);
  }, [t]);

  const handleTitleChange = useCallback(
    (tableId: string) => (title: string) => {
      setLocalState((prev) => ({
        ...prev,
        tables: prev.tables.map((table) => (table.id === tableId ? { ...table, title } : table)),
      }));
      setSaveSuccess(false);
    },
    [],
  );

  const handleDeleteTable = useCallback(
    (tableId: string) => () => {
      setLocalState((prev) => ({
        ...prev,
        tables: prev.tables.filter((table) => table.id !== tableId),
      }));
      setSaveSuccess(false);
    },
    [],
  );

  const handleAddRow = useCallback(
    (tableId: string) => () => {
      setLocalState((prev) => ({
        ...prev,
        tables: prev.tables.map((table) => (table.id === tableId
          ? {
            ...table,
            entries: [
              ...table.entries,
              {
                name: '',
                priceUsd: 0,
                order: table.entries.length,
              },
            ],
          }
          : table)),
      }));
      setSaveSuccess(false);
    },
    [],
  );

  const handleDeleteRow = useCallback((tableId: string, entryIndex: number) => {
    setLocalState((prev) => ({
      ...prev,
      tables: prev.tables.map((table) => (table.id === tableId
        ? {
          ...table,
          entries: table.entries.filter((_, idx) => idx !== entryIndex).map((entry, idx) => ({
            ...entry,
            order: idx,
          })),
        }
        : table)),
    }));
    setSaveSuccess(false);
  }, []);

  const handleEntryChange = useCallback(
    (tableId: string, entryIndex: number, field: 'name' | 'priceUsd', value: string | number) => {
      setLocalState((prev) => ({
        ...prev,
        tables: prev.tables.map((table) => (table.id === tableId
          ? {
            ...table,
            entries: table.entries.map((entry, idx) => (idx === entryIndex ? { ...entry, [field]: value } : entry)),
          }
          : table)),
      }));
      setSaveSuccess(false);
    },
    [],
  );

  // Save as new snapshot
  const handleSave = useCallback(async () => {
    try {
      if (localState.tables.length === 0) {
        return;
      }

      const title = dayjs().format('MMM D, YYYY HH:mm');

      // Filter out tables with empty rows (rows where name is empty)
      const validTables = localState.tables
        .map((table) => ({
          title: table.title,
          entries: table.entries.filter((entry) => entry.name.trim() !== ''),
        }))
        .filter((table) => table.entries.length > 0);

      // Don't save if no valid tables remain
      if (validTables.length === 0) {
        return;
      }

      await createSnapshot.mutateAsync({
        body: {
          title,
          rate: localState.rate,
          tables: validTables.map((table) => ({
            title: table.title,
            entries: table.entries.map((entry) => ({
              name: entry.name,
              priceUsd: entry.priceUsd,
            })),
          })),
        },
      });

      await queryClient.invalidateQueries({ queryKey: ['snapshots'] });

      // Redirect to home page
      await router.push('/');
    } catch {
      //
    }
  }, [localState, createSnapshot, queryClient, router]);

  const isSaving = createSnapshot.isPending;

  // Check if there's valid data (at least one table with at least one non-empty entry)
  const hasValidData = localState.tables.some((table) => table.entries.some((entry) => entry.name.trim() !== ''));

  const hasData = localState.tables.length > 0 && hasValidData;

  return (
    <AppShell>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>{t('pricingTable.addNewItem') || 'Add New Item'}</Title>
        </Group>

        {saveSuccess && (
          <Alert color="green" title={t('actions.saveSuccess') || 'Success'}>
            {t('actions.itemSaved') || 'Item saved successfully! You can view it in the history page.'}
          </Alert>
        )}

        <ExchangeRateInput rate={localState.rate} onRateChange={handleRateChange} />

        <Group justify="space-between" align="center">
          <Title order={3}>{t('pricingTable.tables') || 'Tables'}</Title>
          <Group>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleAddTable}
              variant="outline"
            >
              {t('actions.addTable')}
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSave}
              loading={isSaving}
              disabled={!hasData || isSaving}
              color="green"
            >
              {t('actions.saveItem') || 'Save Item'}
            </Button>
          </Group>
        </Group>

        {localState.tables.length === 0 ? (
          <Alert icon={<IconAlertCircle size={16} />} color="blue">
            <Text>{t('pricingTable.noTablesYet') || 'No tables yet. Click "Add Table" to get started.'}</Text>
          </Alert>
        ) : (
          <SimpleGrid
            cols={{ base: 1, sm: 1, md: 2 }}
            spacing="md"
          >
            {localState.tables.map((table: LocalTable) => (
              <PricingTable
                key={table.id}
                table={{
                  id: table.id,
                  title: table.title,
                  entries: table.entries,
                }}
                exchangeRate={localState.rate}
                onTitleChange={handleTitleChange(table.id)}
                onAddRow={handleAddRow(table.id)}
                onDeleteRow={(entryIndex: number) => handleDeleteRow(table.id, entryIndex)}
                onEntryChange={(entryIndex: number, field: 'name' | 'priceUsd', value: string | number) => handleEntryChange(table.id, entryIndex, field, value)}
                onDeleteTable={handleDeleteTable(table.id)}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </AppShell>
  );
}
