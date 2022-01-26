import { Engine, Game, Participant, Tournament, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto'
import prisma from './db';

export type StateAction =
    | { type: 'wait' }
    | { type: 'play', game: Game, color: string, hook_key: string };

export class UpdateEngineState {
    constructor(
        protected readonly tournament: Tournament,
        protected readonly engine: Engine
    )
    {
        // pass
    }

    // TODO prisma interactive transactions are in preview at the moment, once
    // they are stable. We need to wrap this method in a transaction.
    async call(): Promise<StateAction> {
        const active = await this.myActiveGames();

        if (active.length > 0) {
            const myGame = active.filter(g => this.isMyTurn(g));

            if (myGame.length > 0 && myGame[0] != null) {
                return this.playGame(myGame[0]);
            } else {
                return { type: 'wait' };
            }
        } else if (await this.numActiveGames() < this.tournament.maxActiveGames) {
            const otherEngine = await this.chooseOpponent();

            if (!otherEngine) {
                return { type: 'wait' };
            }

            const isBlack = Math.random() < 0.5;
            const game = await prisma.game.create({
                data: {
                    tournament: { connect: { id: this.tournament.id } },
                    active: true,
                    sequence: {
                        set: []
                    },
                    participants: {
                        create: [
                            {
                                key: randomBytes(8).toString('base64url'),
                                color: isBlack ? 'b' : 'w',
                                engineId: this.engine.id
                            },
                            {
                                key: randomBytes(8).toString('base64url'),
                                color: isBlack ? 'w' : 'b',
                                engineId: otherEngine.id
                            }
                        ]
                    }
                },
                include: {
                    participants: true
                }
            });

            if (isBlack) {
                return this.playGame(game);
            } else {
                return { type: 'wait' };
            }
        }

        return { type: 'wait' };
    }

    isMyTurn(game: Game & { participants: Participant[] }): boolean {
        const color = game.participants
            .filter(p => p.engineId == this.engine.id)
            .map(p => p.color)
            [0];

        if (!color) {
            return false;
        }

        const sequence = <Prisma.JsonArray>game.sequence || [];
        const lastMove = <string>sequence[sequence.length - 1];

        if (!lastMove) {
            return color == 'b';
        } else {
            return !lastMove.startsWith(color[0]);
        }
    }

    playGame(game: Game & { participants: Participant[] }): StateAction {
        const participant = game.participants
            .filter(p => p.engineId == this.engine.id)
            [0];

        return {
            type: 'play',
            game: game,
            color: participant.color,
            hook_key: participant.key
        };
    }

    async myActiveGames(): Promise<(Game & { participants: Participant[] })[]> {
        return prisma.game.findMany({
            where: {
                active: true,
                tournament: this.tournament,
                participants: {
                    some: {
                        engine: this.engine
                    }
                }
            },
            include: {
                participants: true
            }
        });
    }

    async numActiveGames(): Promise<number> {
        return prisma.game.count({
            where: {
                active: true,
                tournament: this.tournament
            }
        });
    }

    async chooseOpponent(): Promise<Engine | null> {
        return prisma.engine.findFirst({
            where: {
                tournament: this.tournament,
                participating: {
                    every: {
                        game: {
                            active: false
                        }
                    }
                },
                NOT: {
                    id: this.engine.id
                }
            },
            orderBy: {
                participating: {
                    _count: 'asc'
                }
            }
        });
    }
}
