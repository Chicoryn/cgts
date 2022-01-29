import type { NextPage } from 'next'
import styles from '../../../styles/Tournament.module.css'
import { FormEvent } from 'react';
import { NextRouter, useRouter } from 'next/router'

async function onSubmit(event: FormEvent<HTMLFormElement>, id: string, router: NextRouter) {
    const form = event.target as HTMLFormElement;
    event.preventDefault();

    await fetch('/api/v1/engines', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: form.engineName.value,
            tournamentId: parseInt(id)
        })
    });

    router.push(`/tournament/${id}`);
}

const NewEngine: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;

    return <form className={styles.form} onSubmit={e => onSubmit(e, id as string, router)}>
        <p>
            <label>
                <span>Name</span>
                <input name='engineName' type='text' required />
            </label>
        </p>
        <input type='submit' />
    </form>;
}

export default NewEngine;
