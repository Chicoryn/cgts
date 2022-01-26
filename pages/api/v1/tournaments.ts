import prisma from '../../../lib/db';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
)
{
  if (req.method === 'GET') {
    const tournaments = await prisma.tournament.findMany({
      include: {
        engines: true
      }
    });

    res.status(200).json(tournaments);
  } else if (req.method === 'POST') {
    const tournament = await prisma.tournament.create({
      data: {
        name: <string>req.query.name
      }
    });

    res.status(200).json(tournament)
  } else {
    res.status(400).json({ error: 'bad request' })
  }
}
