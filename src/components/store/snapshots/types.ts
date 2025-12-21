import { z } from 'zod';
import { QueryFunctionContext } from '@tanstack/react-query';

// Device Entry Schema (now just data, no DB fields)
export const deviceEntrySchema = z.object({
  name: z.string(),
  priceUsd: z.number(),
  order: z.number(),
});

export type DeviceEntry = z.infer<typeof deviceEntrySchema>;

// Pricing Table Schema (for snapshot)
export const snapshotTableSchema = z.object({
  id: z.string(),
  snapshotId: z.string(),
  title: z.string(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  entries: z.array(deviceEntrySchema),
});

export type SnapshotTable = z.infer<typeof snapshotTableSchema>;

// Pricing Snapshot Schema
export const pricingSnapshotSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  rate: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tables: z.array(snapshotTableSchema),
});

export type PricingSnapshot = z.infer<typeof pricingSnapshotSchema>;

// API Request Schemas
export const createSnapshotApiRequestSchema = z.object({
  title: z.string().optional(),
  rate: z.number().min(0.01),
  tables: z.array(
    z.object({
      title: z.string(),
      entries: z.array(
        z.object({
          name: z.string(),
          priceUsd: z.number().min(0),
        }),
      ),
    }),
  ),
});

export type CreateSnapshotApiRequest = z.infer<typeof createSnapshotApiRequestSchema>;

// API Response Schemas
export const snapshotsListResponseSchema = z.object({
  data: z.array(pricingSnapshotSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type SnapshotsListResponse = z.infer<typeof snapshotsListResponseSchema>;

// Query Props
export interface GetSnapshotsQueryProps {
  pagination?: {
    page?: number;
    pageSize?: number;
  };
  params?: QueryFunctionContext;
}

export interface GetSnapshotQueryProps {
  id: string;
  params?: QueryFunctionContext;
}
