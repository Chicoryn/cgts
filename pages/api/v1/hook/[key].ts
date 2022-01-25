import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  error?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
)
{
  if (req.method === 'POST') {
    const key = req.body;

    res.status(200).json({})
  } else {
    res.status(400).json({error: 'bad request'})
  }
}
