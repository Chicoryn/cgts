import type { NextPage } from 'next'
import styles from '../../styles/Tournament.module.css'
import { Tournament, Engine, Game, Participant } from '@prisma/client';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useEffect, useState } from 'react';
import fromNow from 'fromnow';
import { useRouter } from 'next/router'
import { EngineWithStatistics, TournamentWithEnginesAndGames, GameWithParticipants } from '../api/v1/tournaments/[id]';

function getTournament(id: string): TournamentWithEnginesAndGames | null {
  const [tournament, setTournament] = useState(null);
  useEffect(() => {
    if (!id)
      return;

    fetch(`/api/v1/tournaments/${id}`)
      .then(res => res.json())
      .then(tournament => setTournament(tournament));
  }, [id]);

  return tournament;
}

function renderEnginesDataTable(engines: EngineWithStatistics[]) {
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

  return <DataTable columns={columns} data={engines} />
}

function renderGamesDataTable(games: GameWithParticipants[], engines: EngineWithStatistics[]) {
  const enginesById = engines.reduce((acc: { [key: number]: EngineWithStatistics }, engine) => {
    acc[engine.id] = engine;
    return acc;
  }, {});

  const columns: TableColumn<GameWithParticipants>[] = [
    {
      name: 'Black',
      selector: game => enginesById[game.participants[0].engineId].name,
    },
    {
      name: 'White',
      selector: game => enginesById[game.participants[1].engineId].name,
    },
    {
      name: 'Result',
      selector: row => row.active ? 'None' : 'Done',
    },
    {
      name: 'Created',
      selector: game => fromNow(new Date(game.createdAt), { max: 2, suffix: true }),
    }
  ];

  return <DataTable columns={columns} data={games} />
}

const Tournament: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const tournament = getTournament(id as string);

  return <>
    <h1>
      {tournament?.name}
      <a className={styles.new_engine} href={`/tournament/${id}/engine`}>Add new Engine</a>
    </h1>
    {tournament && renderEnginesDataTable(tournament.engines)}

    <h2>Games</h2>
    {tournament && renderGamesDataTable(tournament.games, tournament.engines)}
  </>;
}

export default Tournament
