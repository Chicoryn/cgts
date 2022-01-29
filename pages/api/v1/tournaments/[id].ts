import { Engine, Game, Participant, Tournament, Prisma } from '@prisma/client';
import prisma from '../../../../lib/db';
import type { NextApiRequest, NextApiResponse } from 'next'

export type GameStatistics =
    { won: boolean, opponent: { id: number, name: string } };

export type EngineWithStatistics =
    Engine & { played: GameStatistics[] };

export type GameWithParticipants =
    Game & { participants: Participant[] };

export type TournamentWithEnginesAndGames =
    Tournament & { engines: EngineWithStatistics[], games: GameWithParticipants[] };

function augmentGameWithStatistics(game: GameWithParticipants, engines: Engine[]): GameStatistics {
    const engineIds = engines.map(e => e.id);
    const opponentParticipant = game.participants.find(p => engineIds.includes(p.engineId));
    const opponent = engines.find(e => e.id == opponentParticipant?.engineId);

    return {
        won: !opponentParticipant?.winner,
        opponent: {
            id: opponent?.id || 0,
            name: opponent?.name || ''
        }
    };
}

function augmentEngine(engine: Engine, engines: Engine[], games: GameWithParticipants[]): EngineWithStatistics {
    const otherEngines = engines.filter(e => e.id != engine.id);

    return {
        ...engine,
        played: games.filter(g => g.participants.some(p => p.engineId == engine.id)).map(g => augmentGameWithStatistics(g, otherEngines)),
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
            engines: tournament.engines.map(engine => { return augmentEngine(engine, tournament.engines, tournament.games) }),
            games: tournament.games.map(game => { return augmentGame(game) })
        });
    }
}
