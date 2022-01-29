import type { NextPage } from 'next'
import styles from '../../styles/Tournament.module.css'
import { Tournament, Engine, Game, Participant } from '@prisma/client';
import DataTable, { TableColumn, ExpanderComponentProps  } from 'react-data-table-component';
import { useEffect, useState } from 'react';
import fromNow from 'fromnow';
import { useRouter } from 'next/router'
import { EngineWithStatistics, TournamentWithEnginesAndGames, GameWithParticipants } from '../api/v1/tournaments/[id]';
import Link from 'next/link';

type TournamentDataTableProps = {
  engines: EngineWithStatistics[]
};

function TournamentExpandedComponent({ data }: ExpanderComponentProps<EngineWithStatistics>) {
  const byOpponent = data.played.reduce(
    (acc, g) => {
      acc[g.opponent.name] ||= { wins: 0, count: 0};
      acc[g.opponent.name].wins += g.won ? 1 : 0;
      acc[g.opponent.name].count += 1;
      return acc;
    },
    {} as {[key: string]: {wins: number, count: number}}
  );

  return <div className={styles.padded_container}>
    {Object.entries(byOpponent).map(arg => {
      const [opponent, { wins, count }] = arg;
      const winRate = wins / (count + 1e-6);
      const green = Math.floor(255.0 * winRate);
      const red = Math.floor(255.0 - green);
      const color = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}00`;

      return <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' width='100' height='120'>
        <title>{`${opponent} - ${100.0 * winRate}%`}</title>
        <g fill={color}>
          <rect width={100} height={100} rx={15} />
        </g>
        <text x='50' y='120' style={{ textAnchor: 'middle' }}>{opponent}</text>
      </svg>;
    })}
  </div>;
}

function TournamentDataTable({ engines }: TournamentDataTableProps) {
  const columns: TableColumn<EngineWithStatistics>[] = [
    {
      name: 'Name',
      selector: row => row.name,
    },
    {
      name: 'Key',
      selector: row => row.key,
    },
    {
      name: 'Total played',
      selector: row => row.played.length,
    },
    {
      name: 'Wins',
      selector: row => row.played.filter(g => g.won).length,
    },
    {
      name: 'Losses',
      selector: row => row.played.filter(g => !g.won).length,
    }
  ];

  return <DataTable
    columns={columns}
    data={engines}
    expandableRows
    expandableRowsComponent={TournamentExpandedComponent}
  />
}

type GamesDataTableProps = {
  games: GameWithParticipants[],
  engines: EngineWithStatistics[]
};

function GamesDataTable({ games, engines }: GamesDataTableProps) {
  const enginesById = engines.reduce((acc: { [key: number]: EngineWithStatistics }, engine) => {
    acc[engine.id] = engine;
    return acc;
  }, {});

  const columns: TableColumn<GameWithParticipants>[] = [
    {
      name: 'Black',
      selector: game => enginesById[game.participants[0].engineId].name,
      sortable: true
    },
    {
      name: 'White',
      selector: game => enginesById[game.participants[1].engineId].name,
      sortable: true
    },
    {
      name: 'Result',
      selector: row => row.result ? row.result : 'None',
      sortable: true
    },
    {
      name: 'Created',
      selector: game => new Date(game.createdAt).toISOString(),
      format: game => fromNow(new Date(game.createdAt), { max: 2, suffix: true }),
      sortable: true
    }
  ];

  return <DataTable
    columns={columns}
    data={games}
    defaultSortFieldId={4}
    defaultSortAsc={false}
  />
}

const Tournament: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [tournament, setTournament] = useState<TournamentWithEnginesAndGames | null>(null);

  useEffect(() => {
    if (!id)
      return;

    fetch(`/api/v1/tournaments/${id}`)
      .then(res => res.json())
      .then(tournament => setTournament(tournament as TournamentWithEnginesAndGames));
  }, [id]);

  return <>
    <h1>
      {tournament?.name}
      <span className={styles.new_engine}>
        <Link href={`/tournament/${id}/engine`}>Add new Engine</Link>
      </span>
    </h1>

    {tournament && <TournamentDataTable engines={tournament.engines} />}

    <h2>Games</h2>
    {tournament && <GamesDataTable games={tournament.games} engines={tournament.engines} />}
  </>;
}

export default Tournament
