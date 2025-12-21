import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/libs/auth';
import { prisma } from '@/libs/prisma';
import { z } from 'zod';
import { createApiError } from '@/utils/api-utils/handle-backend-error';

const createSnapshotSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  rate: z.number().min(0.01),
  tables: z.array(
    z.object({
      title: z.string().min(1).max(255),
      entries: z.array(
        z.object({
          name: z.string().max(255),
          priceUsd: z.number().min(0),
        }),
      ),
    }),
  ),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100)
    .default(10),
});

async function handleGet(userId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const validation = paginationSchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Invalid pagination parameters', {
          fields: validation.error.errors.map((e) => e.message),
        }),
      );
    }

    const { page, pageSize } = validation.data;
    const skip = (page - 1) * pageSize;

    const [snapshots, total] = await Promise.all([
      prisma.pricingSnapshot.findMany({
        where: { userId },
        include: {
          tables: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.pricingSnapshot.count({
        where: { userId },
      }),
    ]);

    const formattedSnapshots = snapshots.map((snapshot) => ({
      id: snapshot.id,
      userId: snapshot.userId,
      title: snapshot.title,
      rate: snapshot.rate,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
      tables: snapshot.tables.map((table) => ({
        id: table.id,
        snapshotId: table.snapshotId,
        title: table.title,
        order: table.order,
        createdAt: table.createdAt.toISOString(),
        updatedAt: table.updatedAt.toISOString(),
        entries: Array.isArray(table.entries) ? table.entries : [],
      })),
    }));

    return res.status(200).json({
      data: formattedSnapshots,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch {
    return res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch snapshots'),
    );
  }
}

async function handlePost(userId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const validation = createSnapshotSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json(
        createApiError('VALIDATION_ERROR', 'Invalid snapshot data', {
          fields: validation.error.errors.map((e) => e.message),
        }),
      );
    }

    const { title, rate, tables } = validation.data;

    // Create snapshot with tables and entries in a transaction
    const snapshot = await prisma.pricingSnapshot.create({
      data: {
        userId,
        title: title?.trim(),
        rate,
        tables: {
          create: tables.map((table, tableIndex) => ({
            title: table.title.trim(),
            order: tableIndex,
            entries: table.entries.map((entry, entryIndex) => ({
              name: entry.name.trim(),
              priceUsd: entry.priceUsd,
              order: entryIndex,
            })),
          })),
        },
      },
      include: {
        tables: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Format response
    const formattedSnapshot = {
      id: snapshot.id,
      userId: snapshot.userId,
      title: snapshot.title,
      rate: snapshot.rate,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
      tables: snapshot.tables.map((table) => ({
        id: table.id,
        snapshotId: table.snapshotId,
        title: table.title,
        order: table.order,
        createdAt: table.createdAt.toISOString(),
        updatedAt: table.updatedAt.toISOString(),
        entries: Array.isArray(table.entries) ? table.entries : [],
      })),
    };

    return res.status(201).json(formattedSnapshot);
  } catch {
    return res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Failed to create snapshot'),
    );
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as Record<string, string>),
  });

  if (!session?.user) {
    return res.status(401).json(
      createApiError('UNAUTHORIZED', 'Authentication required'),
    );
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    return handleGet(userId, req, res);
  }

  if (req.method === 'POST') {
    return handlePost(userId, req, res);
  }

  return res.status(405).json(
    createApiError('METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`),
  );
}
