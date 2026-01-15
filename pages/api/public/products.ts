import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/libs/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    const latestSnapshot = await prisma.pricingSnapshot.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { tables: { orderBy: { order: 'asc' } } },
    });

    if (!latestSnapshot) {
      return res.status(200).json({
        success: true,
        shopName: 'مركز الحمدان للإتصالات - فرع شين',
        phone: '0945 555 647',
        location: 'شين',
        workingHours: 'من 9 صباحاً حتى 8 مساءً',
        lastUpdated: new Date().toISOString(),
        exchangeRate: 1,
        categories: [],
        totalProducts: 0,
      });
    }

    const categories = latestSnapshot.tables.map((table) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entries = (table.entries as any[]) || [];
      return {
        category: table.title,
        products: entries.map((entry) => ({
          name: entry.name,
          priceUsd: entry.priceUsd,
          priceSyp: Math.round(entry.priceUsd * latestSnapshot.rate),
        })),
      };
    });

    const totalProducts = categories.reduce((sum, cat) => sum + cat.products.length, 0);

    return res.status(200).json({
      success: true,
      shopName: 'مركز الحمدان للإتصالات - فرع شين',
      phone: '0945 555 647',
      location: 'شين',
      workingHours: 'من 9 صباحاً حتى 8 مساءً',
      lastUpdated: latestSnapshot.updatedAt.toISOString(),
      exchangeRate: latestSnapshot.rate,
      categories,
      totalProducts,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching products:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
}
