import { z } from 'zod';
import { createSnapshotApiRequestSchema } from './types';

export const createSnapshotBackendRequestSchema = createSnapshotApiRequestSchema.transform(
  (data) => ({
    title: data.title?.trim(),
    rate: data.rate,
    tables: data.tables.map((table) => ({
      title: table.title.trim(),
      entries: table.entries.map((entry) => ({
        name: entry.name.trim(),
        priceUsd: entry.priceUsd,
      })),
    })),
  }),
);

export type CreateSnapshotBackendRequest = z.infer<
  typeof createSnapshotBackendRequestSchema
>;
