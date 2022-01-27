import prisma from '../../../../lib/db';
import {sleepUntilWake} from '../../../../lib/redis';
import { StateAction, UpdateEngineState } from '../../../../lib/update_engine_state';
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  sequence?: Array<string>,
  action?: string,
  webhook_url?: string,
  error?: string
} | ''

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
)
{
  if (req.method === 'GET') {
    const engine = await prisma.engine.findUnique({
      where: { key: <string>req.query.key },
      include: { tournament: true }
    });

    if (!engine) {
      res.status(404).json({
        error: 'no such engine'
      });
    } else {
      const update_engine_state = new UpdateEngineState(engine.tournament, engine)
      let action = await update_engine_state.call();

      switch (action.type) {
        case 'wait': {
          await sleepUntilWake(engine, 10);

          action = await update_engine_state.call();
          if (action.type == 'wait') {
            res.status(204).send('')
            break
          } else {
            // fallthrough
          }
        }
        case 'play': {
          const action_ = <Extract<StateAction, {type: 'play'}>>action;

          res.status(200).json({
            sequence: <string[]>action_.game.sequence,
            action: `genmove ${action_.color}`,
            webhook_url: `api/v1/hook/${action_.hook_key}`
          })
          break
        }
      }
    }
  } else {
    res.status(400).json({ error: 'bad request' })
  }
}
