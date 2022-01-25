import prisma from '../../../../lib/db';
import { Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
)
{
  if (req.method === 'POST') {
    const participant = await prisma.participant.findUnique({
      where: {
        key: <string>req.query.key
      },
      include: {
        game: true,
        engine: true
      }
    });

    if (!participant) {
      res.status(404).json({error: 'no such webhook'})
    } else {
      const color = participant.color;
      const body = JSON.parse(req.body);
      const response = body['response'];

      if (!response) {
        res.status(400).json({error: 'bad request'})
      } else {
        let sequence = participant.game.sequence as Prisma.JsonArray;
        sequence.push(`${color} ${response}`);

        res.status(200).json({})
      }
    }
  } else {
    res.status(400).json({error: 'bad request'})
  }
}
