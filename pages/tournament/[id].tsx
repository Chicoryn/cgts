import type { NextPage } from 'next'
import styles from '../../styles/Tournament.module.css'
import { Tournament, Engine, Game, Participant } from '@prisma/client';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useEffect, useState } from 'react';
import fromNow from 'fromnow';
import { useRouter } from 'next/router'
import { EngineWithStatistics, TournamentWithEnginesAndGames, GameWithParticipants } from '../api/v1/tournaments/[id]';
import Link from 'next/link';

type TournamentDataTableProps = {
  engines: EngineWithStatistics[]
};

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
      selector: row => row.played,
    },
    {
      name: 'Wins',
      selector: row => row.wins,
    },
    {
      name: 'Losses',
      selector: row => row.losses,
    }
  ];

  return <DataTable
    columns={columns}
    data={engines}
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
