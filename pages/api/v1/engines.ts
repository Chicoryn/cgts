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
  if (req.body.tournamentId === undefined) {
    res.status(400).json({ error: 'missing tournamentId' })
  } else {
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: req.body.tournamentId
      }
    });

    if (!tournament) {
      res.status(400).json({ error: `no such tournament` })
    } else if (req.method === 'GET') {
      const engines = await prisma.engine.findMany({
          where: { tournament: tournament }
      });

      res.status(200).json(engines);
    } else if (req.method === 'POST') {
      const engine = await prisma.engine.create({
        data: {
          key: randomBytes(8).toString('base64url'),
          name: req.body.name || '',
          tournamentId: tournament.id
        }
      });

      res.status(200).json(engine)
    } else {
      res.status(400).json({ error: 'bad request' })
    }
  }
}
