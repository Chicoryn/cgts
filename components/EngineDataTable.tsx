import styles from '../styles/EngineDataTable.module.css'
import DataTable, { TableColumn, ExpanderComponentProps  } from 'react-data-table-component';
import { EngineWithStatistics } from '../pages/api/v1/tournaments/[id]';

function percentage(amount: number, total: number): string {
    if (total < 1) {
        return '-';
    } else {
        return `${(100.0 * amount / total).toFixed(1)}% (${amount})`;
    }
}

export type EngineDataTableProps = {
    engines: EngineWithStatistics[]
};

function EngineExpandedDataTableComponent({ data }: ExpanderComponentProps<EngineWithStatistics>) {
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
            name: 'Wins',
            selector: row => percentage(row.wins, row.count),
            sortable: true
        },
        {
            name: 'Losses',
            selector: row => percentage(row.losses, row.count),
            sortable: true
        },
        {
            name: 'Total played',
            selector: row => row.count,
            sortable: true
        },
    ];

    return <div className={styles.padded_card}>
        <DataTable
            columns={columns}
            data={byOpponentRows}
            defaultSortFieldId={1}
            defaultSortAsc={false}
            dense
        />
    </div>;
}

function EngineExpandedComponent({ data }: ExpanderComponentProps<EngineWithStatistics>) {
    if (!data.played.length) {
        return <div className={styles.padded_container}>
            <p className={styles.small_text}>
                No games has been recorded, connect an engine using:
            </p>

            <pre className={styles.small_text}>
                cgts_client --key {data.key} -- command arguments...
            </pre>
        </div>;
    } else {
        return <EngineExpandedDataTableComponent data={data} />
    }
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
            name: 'Wins',
            selector: row => percentage(row.played.filter(g => g.won === true).length, row.played.length),
            sortable: true
        },
        {
            name: 'Losses',
            selector: row => percentage(row.played.filter(g => g.won === false).length, row.played.length),
            sortable: true
        },
        {
            name: 'Total played',
            selector: row => row.played.length,
            sortable: true
        },
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
