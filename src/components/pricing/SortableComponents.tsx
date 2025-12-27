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
      <Table.Td
        style={{
          width: 44,
          cursor: 'grab',
          touchAction: 'none',
        }}
        {...attributes}
        {...listeners}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            margin: -8,
          }}
        >
          <IconGripVertical size={20} />
        </Box>
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

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Large touch-friendly drag handle style (minimum 44x44px for mobile)
  const dragHandleStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    minHeight: 44,
    cursor: 'grab',
    touchAction: 'none',
    backgroundColor: isDragging ? 'var(--mantine-color-blue-1)' : 'var(--mantine-color-gray-1)',
    borderRadius: 'var(--mantine-radius-sm)',
    transition: 'background-color 0.2s ease',
  };

  return (
    <Paper ref={setNodeRef} style={cardStyle} p="sm" withBorder>
      <Group gap="sm" wrap="nowrap" align="stretch">
        <Box style={dragHandleStyle} {...attributes} {...listeners}>
          <IconGripVertical size={24} />
        </Box>
        <Box style={{ flex: 1 }}>
          {children}
        </Box>
      </Group>
    </Paper>
  );
}
