import styles from '../styles/Tournament.module.css'
import DataTable, { TableColumn, ExpanderComponentProps  } from 'react-data-table-component';
import { EngineWithStatistics } from '../pages/api/v1/tournaments/[id]';

export type EngineDataTableProps = {
    engines: EngineWithStatistics[]
};

function EngineExpandedComponent({ data }: ExpanderComponentProps<EngineWithStatistics>) {
    const byOpponent = data.played.reduce(
        (acc, g) => {
            acc[g.opponent.name] ||= { wins: 0, losses: 0, count: 0};
            acc[g.opponent.name].wins += g.won === true ? 1 : 0;
            acc[g.opponent.name].losses += g.won === false ? 1 : 0;
            acc[g.opponent.name].count += 1;
            return acc;
        },
        {} as {[key: string]: {wins: number, losses: number, count: number}}
    );
    const byOpponentRows = Object.entries(byOpponent).map(arg => {
        const [name, { wins, losses, count }] = arg;

        return {
            name: name,
            wins: wins,
            losses: losses,
            count: count
        };
    })

    const columns: TableColumn<{name: string, wins: number, losses: number, count: number}>[] = [
        {
            name: 'Opponent',
            selector: row => row.name,
        },
        {
            name: 'Total played',
            selector: row => row.count,
            sortable: true
        },
        {
            name: 'Wins',
            selector: row => row.wins,
            sortable: true
        },
        {
            name: 'Losses',
            selector: row => row.losses,
            sortable: true
        },
    ];

    return <div className={styles.padded_container}>
        <DataTable
            columns={columns}
            data={byOpponentRows}
            defaultSortFieldId={2}
            defaultSortAsc={false}
            dense
        />
    </div>;
}

function EngineDataTable({ engines }: EngineDataTableProps) {
    const columns: TableColumn<EngineWithStatistics>[] = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true
        },
        {
            name: 'Key',
            selector: row => row.key,
        },
        {
            name: 'Total played',
            selector: row => row.played.length,
            sortable: true
        },
        {
            name: 'Wins',
            selector: row => row.played.filter(g => g.won).length,
            sortable: true
        },
        {
            name: 'Losses',
            selector: row => row.played.filter(g => !g.won).length,
            sortable: true
        }
    ];

    return <DataTable
        columns={columns}
        data={engines}
        defaultSortFieldId={0}
        defaultSortAsc={true}
        expandableRows
        expandableRowsComponent={EngineExpandedComponent}
    />
}

export default EngineDataTable;
