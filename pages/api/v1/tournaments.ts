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
        engines: true,
        games: true
      }
    });

    res.status(200).json(
      tournaments.map(tournament => {
        return {
          id: tournament.id,
          name: tournament.name,
          createdAt: tournament.createdAt,
          updatedAt: tournament.updatedAt,
          engines: tournament.engines,
          numGames: tournament.games.length
        };
      })
    );
  } else if (req.method === 'POST') {
    const tournament = await prisma.tournament.create({
      data: {
        name: req.body.name,
        maxActiveGames: parseInt(req.body.maxActiveGames) || 1,
      }
    });

    res.status(200).json(tournament)
  } else {
    res.status(400).json({ error: 'bad request' })
  }
}
