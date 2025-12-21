import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/libs/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseURL = process.env.BETTER_AUTH_URL || `http://${req.headers.host}`;
  const url = new URL(req.url!, baseURL);

  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  });

  const body = req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined;

  const request = new Request(url, {
    method: req.method,
    headers,
    body,
  });

  const response = await auth.handler(request);

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  res.status(response.status);

  const text = await response.text();
  res.send(text);
}
