import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient();

type Data = {
  error?: string
}

export default async function handler(
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
