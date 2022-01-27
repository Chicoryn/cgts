import { spawn } from 'child_process';
import readline from 'readline';

type Score = {
    color: string,
    re: string
};

export async function score(sequence: string[]): Promise<Score | null> {
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
            return {
                color: line.split(' ')[1][0].toLowerCase(), // e.g. B+127.5
                re: line.split(' ')[1]
            }
        }
    }

    return null;
}
