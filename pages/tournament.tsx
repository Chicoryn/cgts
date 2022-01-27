import type { NextPage } from 'next'
import styles from '../styles/Tournament.module.css'
import { FormEvent, useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router'

async function onSubmit(event: FormEvent<HTMLFormElement>, router: NextRouter) {
    const form = event.target as HTMLFormElement;
    event.preventDefault();

    await fetch('/api/v1/tournaments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: form.tournamentName.value,
            maxActiveGames: form.maxActiveGames.value,
        })
    });

    router.push('/');
}

const NewTournament: NextPage = () => {
    const router = useRouter();

    return <form className={styles.form} onSubmit={e => onSubmit(e, router)}>
        <p>
            <label>
                <span>Name</span>
                <input name='tournamentName' type='text' required />
            </label>
            </p>
        <p>
            <label>
                <span>Max Parallel Games</span>
                <input name='maxActiveGames' type='number' defaultValue='1' />
            </label>
        </p>
        <input type='submit' />
    </form>;
}

export default NewTournament
