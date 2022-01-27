import type { NextPage } from 'next'
import { Tournament, Engine } from '@prisma/client';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useEffect, useState } from 'react';
import fromNow from 'fromnow';
import Link from 'next/link';

const Home: NextPage = () => {
  const columns: TableColumn<Tournament & { numGames: number, engines: Engine[] }>[] = [
    {
      name: 'Name',
      selector: row => row.name,
      cell: (row, index, column, id) => {
        return <Link href={`tournament/${row.id}`}>{row.name}</Link>;
      }
    },
    {
      name: '# Engines',
      selector: row => row.engines.length
    },
    {
      name: '# Games',
      selector: row => row.numGames
    },
    {
      name: 'Created',
      selector: row => fromNow(new Date(row.createdAt), { max: 2, suffix: true }),
    },
    {
      name: 'Updated',
      selector: row => fromNow(new Date(row.updatedAt), { max: 2, suffix: true }),
    }
  ];

  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/v1/tournaments')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return <>
    <DataTable
      columns={columns}
      data={data}
    />
  </>;
}

export default Home
