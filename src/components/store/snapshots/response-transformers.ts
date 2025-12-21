import { z } from 'zod';
import { pricingSnapshotSchema } from './types';

// Backend response schema for a single snapshot
export const snapshotBackendResponseSchema = pricingSnapshotSchema;

// Transform a single snapshot from backend response
export const snapshotApiResponseSchema = (
  item: z.infer<typeof snapshotBackendResponseSchema>,
) => ({
  id: item.id,
  userId: item.userId,
  title: item.title,
  rate: item.rate,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  tables: item.tables.map((table) => ({
    id: table.id,
    snapshotId: table.snapshotId,
    title: table.title,
    order: table.order,
    createdAt: table.createdAt,
    updatedAt: table.updatedAt,
    entries: Array.isArray(table.entries) ? table.entries : [],
  })),
});

export type SnapshotApiResponse = ReturnType<typeof snapshotApiResponseSchema>;
