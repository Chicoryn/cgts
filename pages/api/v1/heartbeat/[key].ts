import prisma from '../../../../lib/db';
import { randomBytes } from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  sequence?: Array<string>,
  action?: string,
  webhook_url?: string,
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
)
{
  if (req.method === 'GET') {
    const new_hook_key = randomBytes(8).toString('base64url');
    const engine = await prisma.engine.findUnique({
      where: { key: <string>req.query.key }
    });

    if (!engine) {
      res.status(404).json({
        error: 'no such engine'
      })
    } else {
      res.status(200).json({
        sequence: [],
        action: 'genmove b',
        webhook_url: `api/v1/hook/${new_hook_key}`
      })
    }
  } else {
    res.status(400).json({ error: 'bad request' })
  }
}
