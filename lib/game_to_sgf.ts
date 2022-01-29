import { Engine, Game, Participant } from "@prisma/client";

type ParticipantWithEngine = Participant & { engine: Engine };

const GTP_LETTERS = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'
];

const SGF_LETTERS = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'
];

export default class GameToSgf {
    public constructor(
        protected readonly game: Game,
        protected readonly participants: ParticipantWithEngine[]
    )
    {
        // pass
    }

    asSgfVertex(vertex: string): string {
        if (vertex == 'resign') {
            return '';
        } else if (vertex == 'pass') {
            return '';
        } else {
            const x = parseInt(vertex.substring(1)) - 1;
            const y = GTP_LETTERS.indexOf(vertex[0]);

            return `${SGF_LETTERS[x]}${SGF_LETTERS[y]}`;
        }
    }

    call(): string {
        const createdAt = this.game.createdAt.toISOString();
        const result = this.game.result;
        const black = this.participants.find(p => p.color == 'b')?.engine.name;
        const white = this.participants.find(p => p.color == 'w')?.engine.name;
        const prefix = `;GM[1]FF[4]SZ[19]GN[]DT[${createdAt}]PB[${black}]PW[${white}]RE[${result}]`;
        const seq = this.game.sequence.map(m => {
            const [color, vertex] = m.split(' ', 2);

            return `${color.toUpperCase()}[${this.asSgfVertex(vertex)}]`;
        })

        return `(${prefix};${seq.join(';')})`;
    }
}
