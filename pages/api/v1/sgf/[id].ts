import prisma from '../../../../lib/db';
import GameToSgf from '../../../../lib/game_to_sgf';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
)
{
  if (req.method === 'GET') {
    const game = await prisma.game.findUnique({
      where: {
        id: parseInt(<string>req.query.id)
      },
      include: {
        participants: {
            include: {
                engine: true
            }
        }
      }
    });

    if (!game) {
      res.status(404).send('')
    } else {
        const serializer = new GameToSgf(
            game,
            game.participants
        );

        res.status(200)
            .setHeader('Content-Type', 'application/x-go-sgf')
            .setHeader('Content-Disposition', `attachment; filename=${game.id}.sgf;`)
            .send(serializer.call())
    }
  } else {
    res.status(400).send('')
}
}
