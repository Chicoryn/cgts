import prisma from '../../../lib/db';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
)
{
  if (req.method === 'GET') {
    res.status(200).json(
      await prisma.game.findMany({
        where: { tournamentId: parseInt(<string>req.query.tournamentId) },
        include: {
            participants: true
        }
      })
    );
  } else {
    res.status(400).json({ error: 'bad request' })
  }
}
