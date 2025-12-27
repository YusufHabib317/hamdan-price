import {
  Paper, Table, Box, Group,
} from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
}

export function SortableRow({ id, children }: SortableRowProps) {
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

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      <Table.Td style={{ width: 40, cursor: 'grab' }} {...attributes} {...listeners}>
        <IconGripVertical size={18} style={{ display: 'block' }} />
      </Table.Td>
      {children}
    </Table.Tr>
  );
}

// Sortable Card Wrapper for Mobile
interface SortableCardProps {
  id: string;
  children: React.ReactNode;
}

export function SortableCard({ id, children }: SortableCardProps) {
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

  return (
    <Paper ref={setNodeRef} style={style} p="sm" withBorder>
      <Group gap="xs" wrap="nowrap">
        <Box {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'flex-start' }}>
          <IconGripVertical size={20} />
        </Box>
        <Box style={{ flex: 1 }}>
          {children}
        </Box>
      </Group>
    </Paper>
  );
}
