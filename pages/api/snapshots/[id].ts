import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/libs/auth';
import { prisma } from '@/libs/prisma';
import { createApiError } from '@/utils/api-utils/handle-backend-error';

const SNAPSHOT_NOT_FOUND = 'Snapshot not found';

async function handleGet(userId: string, snapshotId: string, res: NextApiResponse) {
  try {
    const snapshot = await prisma.pricingSnapshot.findFirst({
      where: {
        id: snapshotId,
        userId,
      },
      include: {
        tables: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!snapshot) {
      return res.status(404).json(
        createApiError('NOT_FOUND', SNAPSHOT_NOT_FOUND),
      );
    }

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

    return res.status(200).json(formattedSnapshot);
  } catch {
    return res.status(500).json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch snapshot'),
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
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json(
      createApiError('VALIDATION_ERROR', 'Snapshot ID is required'),
    );
  }

  if (req.method === 'GET') {
    return handleGet(userId, id, res);
  }

  return res.status(405).json(
    createApiError('METHOD_NOT_ALLOWED', `Method ${req.method} not allowed`),
  );
}
