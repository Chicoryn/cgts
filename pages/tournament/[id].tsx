import type { NextPage } from 'next'
import styles from '../../styles/Tournament.module.css'
import { Tournament } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import { TournamentWithEnginesAndGames } from '../api/v1/tournaments/[id]';
import Link from 'next/link';
import TournamentDataTable from '../../components/TournamentDataTable';
import GameDataTable from '../../components/GameDataTable';

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
    {tournament && <GameDataTable games={tournament.games} engines={tournament.engines} />}
  </>;
}

export default Tournament
