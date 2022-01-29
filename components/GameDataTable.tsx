import DataTable, { TableColumn  } from 'react-data-table-component';
import { EngineWithStatistics, GameWithParticipants } from '../pages/api/v1/tournaments/[id]';
import fromNow from 'fromnow';

export type GameDataTableProps = {
    games: GameWithParticipants[],
    engines: EngineWithStatistics[]
};

export default function GameDataTable({ games, engines }: GameDataTableProps) {
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