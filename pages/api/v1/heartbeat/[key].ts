import type { NextApiRequest, NextApiResponse } from 'next'
import { randomBytes } from 'crypto'

type Data = {
  sequence?: Array<string>,
  action?: string,
  webhook_url?: string,
  error?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
)
{
  if (req.method === 'GET') {
    const new_hook_key = randomBytes(8).toString('base64url');
    const key = <string>req.query.key;

    res.status(200).json({
      sequence: [],
      action: 'genmove b',
      webhook_url: `api/v1/hook/${new_hook_key}`
    })
  } else {
    res.status(400).send({ error: 'bad request' })
  }
}
