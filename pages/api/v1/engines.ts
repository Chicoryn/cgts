import prisma from '../../../lib/db';
import { randomBytes } from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'

interface EngineNextApiRequest extends NextApiRequest {
  body: {
    tournamentId: number,
    name?: string
  }
}

export default async function handler(
  req: EngineNextApiRequest,
  res: NextApiResponse
)
{
  if (req.method === 'GET') {
    res.status(200).json(
      await prisma.engine.findMany({
        where: { tournamentId: parseInt(<string>req.query.tournamentId) }
      })
    );
  } else if (req.method === 'POST') {
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: req.body.tournamentId
      }
    });

    if (!tournament) {
      res.status(400).json({ error: `no such tournament` });
      return;
    }

    res.status(200).json(
      await prisma.engine.create({
        data: {
          key: randomBytes(8).toString('base64url'),
          name: req.body.name || '',
          tournament: { connect: { id: tournament.id } }
        }
      })
    );
  } else {
    res.status(400).json({ error: 'bad request' })
  }
}
