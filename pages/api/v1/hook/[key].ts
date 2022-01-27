import prisma from '../../../../lib/db';
import { UpdateGameState } from '../../../../lib/update_game_state';
import type { NextApiRequest, NextApiResponse } from 'next'

interface HookNextApiRequest extends NextApiRequest {
  body: {
    response: string
  }
}

type Data = {
  error?: string
}

export default async function handler(
  req: HookNextApiRequest,
  res: NextApiResponse<Data>
)
{
  if (req.method === 'POST') {
    const participant = await prisma.participant.findUnique({
      where: {
        key: <string>req.query.key
      },
      include: {
        game: true
      }
    });

    if (!participant) {
      res.status(404).json({error: 'no such webhook'})
    } else {
      const response = req.body.response.toLowerCase();

      if (!response) {
        res.status(400).json({error: 'bad request'})
      } else {
        const updateGameState = new UpdateGameState(participant.game, participant, response);

        if (await updateGameState.call()) {
          res.status(200).json({});
        } else {
          res.status(400).json({error: 'invalid move'});
        }
      }
    }
  } else {
    res.status(400).json({error: 'bad request'})
  }
}
