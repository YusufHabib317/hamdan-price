import {
  Paper,
  Table,
  Stack,
  Text,
} from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useCallback } from 'react';
import { usdToSyr, formatCurrency } from '../../utils/currency';

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

export interface PricingTableReadOnlyProps {
  table: PricingTableData;
  exchangeRate: number;
  onReorderEntries?: (newEntries: DeviceEntry[]) => void;
}

// Sortable Row Wrapper Component for ReadOnly table
interface SortableReadOnlyRowProps {
  id: string;
  entry: DeviceEntry;
  exchangeRate: number;
  isRTL: boolean;
}

function SortableReadOnlyRow({
  id, entry, exchangeRate, isRTL,
}: SortableReadOnlyRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priceSyr = usdToSyr(entry.priceUsd, exchangeRate);

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      <Table.Td style={{ width: 40, cursor: 'grab' }} {...attributes} {...listeners}>
        <IconGripVertical size={18} style={{ display: 'block' }} />
      </Table.Td>
      <Table.Td style={{ textAlign: isRTL ? 'right' : 'left' }}>
        <Text>{entry.name || '-'}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: isRTL ? 'right' : 'left' }}>
        <Text>
          {formatCurrency(entry.priceUsd)}
          {' $'}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: isRTL ? 'right' : 'left' }}>
        <Text>
          {formatCurrency(priceSyr)}
          {' '}
          {isRTL ? 'ل.س' : 'SYP'}
        </Text>
      </Table.Td>
    </Table.Tr>
  );
}

export function PricingTableReadOnly({
  table,
  exchangeRate,
  onReorderEntries = undefined,
}: PricingTableReadOnlyProps) {
  const { t, lang } = useTranslation('common');
  const isRTL = lang === 'ar';

  const [localEntries, setLocalEntries] = useState(table.entries);

  const entries = onReorderEntries ? table.entries : localEntries;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const currentEntries = onReorderEntries ? table.entries : localEntries;
      const oldIndex = currentEntries.findIndex((_, idx) => `${table.id}-${idx}` === active.id);
      const newIndex = currentEntries.findIndex((_, idx) => `${table.id}-${idx}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(currentEntries, oldIndex, newIndex);

        if (onReorderEntries) {
          onReorderEntries(newOrder);
        } else {
          setLocalEntries(newOrder);
        }
      }
    }
  }, [table.id, table.entries, localEntries, onReorderEntries]);

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Stack gap="md">
        <Text fw={600} size="lg">
          {table.title}
        </Text>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={entries.map((_, idx) => `${table.id}-${idx}`)}
            strategy={verticalListSortingStrategy}
          >
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 40 }} />
                  <Table.Th style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {t('pricingTable.deviceName')}
                  </Table.Th>
                  <Table.Th style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {t('pricingTable.priceUsd')}
                  </Table.Th>
                  <Table.Th style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {t('pricingTable.priceSyr')}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {entries.map((entry, index) => (
                  <SortableReadOnlyRow
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${table.id}-${index}`}
                    id={`${table.id}-${index}`}
                    entry={entry}
                    exchangeRate={exchangeRate}
                    isRTL={isRTL}
                  />
                ))}
              </Table.Tbody>
            </Table>
          </SortableContext>
        </DndContext>
      </Stack>
    </Paper>
  );
}

export default PricingTableReadOnly;
