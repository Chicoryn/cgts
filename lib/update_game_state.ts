import { Engine, Game, Participant, Tournament } from '@prisma/client';
import { randomBytes } from 'crypto'
import Board from '@sabaki/go-board';
import prisma from './db';
import { spawn } from 'child_process';
import readline from 'readline';

type Evaluation =
    | { type: 'done', winner: Participant }
    | { type: 'ongoing' };

export class UpdateGameState {
    constructor(
        protected readonly game: Game,
        protected readonly participant: Participant,
        protected readonly move: string
    )
    {
        // pass
    }

    async call(): Promise<boolean> {
        if (!this.isValidMove()) {
            return false;
        }

        const evaluation = await this.evaluate();
        const isDone = evaluation.type == 'done';
        const winnerId = isDone ? (<Extract<Evaluation, { type: 'done' }>>evaluation).winner.id : null;

        await prisma.$transaction([
            prisma.game.update({
                where: { id: this.game.id },
                data: {
                    active: !isDone,
                    sequence: {
                        push: `${this.participant.color} ${this.move}`
                    }
                }
            }),
            prisma.participant.update({
                where: { id: this.participant.id },
                data: {
                    key: randomBytes(8).toString('base64url'),
                    winner: isDone ? winnerId == this.participant.id : null
                }
            }),
            prisma.participant.updateMany({
                where: {
                    NOT: { id: this.participant.id },
                    gameId: this.game.id
                },
                data: {
                    winner: isDone ? winnerId != this.participant.id : null
                }
            }),
        ]);

        return true;
    }

    newSequence(): string[] {
        return [...<string[]>this.game.sequence, `${this.participant.color} ${this.move}`];
    }

    moveAsSign(move: string): 0 | -1 | 1 {
        if (move.startsWith('b')) {
            return 1;
        } else {
            return -1;
        }
    }

    moveAsVertex(move: string): [number, number] | null {
        const GTP_LETTERS = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'
        ];

        const parts = move.split(' ');
        const vertex = parts[1];

        if (vertex == 'pass') {
            return null;
        } else if (vertex == 'resign') {
            return null;
        } else {
            return [
                GTP_LETTERS.indexOf(vertex[0]),
                parseInt(vertex.substring(1)) - 1
            ];
        }
    }

    async evaluate(): Promise<Evaluation> {
        const newSequence = this.newSequence();
        const lastMove = newSequence[newSequence.length - 1];

        if (!lastMove) {
            return { type: 'ongoing' };
        } else if (lastMove.includes('resign')) {
            const winner = await prisma.participant.findMany({
                where: {
                    NOT: { color: lastMove[0] },
                    gameId: this.game.id
                }
            });

            return { type: 'done', winner: winner[0] };
        } else if (lastMove.includes('pass') && newSequence.length >= 2) {
            const moveBeforeLast = newSequence[newSequence.length - 2];

            if (!moveBeforeLast.includes('pass')) {
                return { type: 'ongoing' };
            }

            const winningColor = await this.score(newSequence);
            if (!winningColor) {
                return { type: 'ongoing' };
            }

            const winner = await prisma.participant.findMany({
                where: {
                    color: winningColor,
                    gameId: this.game.id
                }
            });

            return { type: 'done', winner: winner[0] };
        } else {
            return { type: 'ongoing' };
        }
    }

    async score(sequence: string[]): Promise<string | null> {
        const gnugo = spawn(
            '/usr/games/gnugo',
            ['--mode', 'gtp'],
            {
                timeout: 3000
            }
        );

        for (const move of sequence) {
            gnugo.stdin.write(`play ${move}\n`);
        }
        gnugo.stdin.write(`1000 estimate_score\n`);
        gnugo.stdin.write(`2000 quit\n`);

        for await (const line of readline.createInterface(gnugo.stdout)) {
            if (line.startsWith('=1000')) {
                return line.split(' ')[1][0].toLowerCase(); // e.g. B+127.5
            }
        }

        return null;
    }

    isValidMove(): boolean {
        const newSequence = this.newSequence();
        let board = Board.fromDimensions(19, 19);

        for(let move of newSequence) {
            const sign = this.moveAsSign(move);
            const vertex = this.moveAsVertex(move);

            if (vertex != null) {
                const analysis = board.analyzeMove(sign, vertex);

                if (analysis.pass || analysis.ko || analysis.overwrite || analysis.suicide) {
                    return false;
                } else {
                    board = board.makeMove(sign, vertex);
                }
            }
        }

        return true;
    }
}
