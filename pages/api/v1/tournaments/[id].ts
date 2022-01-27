import { Engine, Game, Participant, Tournament, Prisma } from '@prisma/client';
import prisma from '../../../../lib/db';
import type { NextApiRequest, NextApiResponse } from 'next'

export type EngineWithStatistics =
    Engine & { wins: number, losses: number, played: number };

export type GameWithParticipants =
    Game & { participants: Participant[] };

export type TournamentWithEnginesAndGames =
    Tournament & { engines: EngineWithStatistics[], games: GameWithParticipants[] };

function augmentEngine(engine: Engine, games: GameWithParticipants[]): EngineWithStatistics {
    return {
        ...engine,
        wins: games.filter(g => g.participants.some(p => p.engineId == engine.id && p.winner === true)).length,
        losses: games.filter(g => g.participants.some(p => p.engineId == engine.id && p.winner === false)).length,
        played: games.filter(g => g.participants.some(p => p.engineId == engine.id)).length,
    }
}

function augmentGame(game: GameWithParticipants): GameWithParticipants {
    return {
        ...game,
        participants: game.participants.sort((a, b) => a.color.localeCompare(b.color))
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TournamentWithEnginesAndGames | null | ''>
)
{
    if (req.method != 'GET') {
        res.status(400).send('');
        return;
    }

    const tournament = await prisma.tournament.findUnique({
        where: {
            id: parseInt(<string>req.query.id)
        },
        include: {
            engines: true,
            games: {
                include: {
                    participants: true
                }
            }
        }
    });

    if (!tournament) {
        res.status(200).send(null);
    } else {
        res.status(200).json({
            ...tournament,
            engines: tournament.engines.map(engine => { return augmentEngine(engine, tournament.games) }),
            games: tournament.games.map(game => { return augmentGame(game) })
        });
    }
}
