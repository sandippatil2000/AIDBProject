import { DBTypes } from '../types/DBTypes'
import type { Connection } from '../types/Connection';
export const mockConnections: Connection[] = [
    {
        id: 1,
        name: 'Production DB (Primary)',
        databaseType: DBTypes.MSSQL,
        host: 'db-prod.aidb.internal',
        port: 5432,
        database: 'aidb_main',
        status: 'connected',
        lastPing: '2 mins ago',
        connectionString: ""
    },
    {
        id: 2,
        name: 'MY SQL',
        databaseType: DBTypes.MYSQL,
        host: 'analytics.snowflakecomputing.com',
        port: 443,
        database: 'ANALYTICS_DB',
        status: 'connected',
        lastPing: '1 hr ago',
        connectionString: ""
    },
    {
        id: 3,
        name: 'POSTGRESQL',
        databaseType: DBTypes.POSTGRESQL,
        host: '10.0.1.45',
        port: 3306,
        database: 'old_crm',
        status: 'offline',
        lastPing: '2 days ago',
        connectionString: ""
    },
    {
        id: 4,
        name: 'ORACLE',
        databaseType: DBTypes.ORACLE,
        host: 'mongo-dev.aidb.internal',
        port: 27017,
        database: 'aidb_dev',
        status: 'error',
        lastPing: '5 mins ago',
        connectionString: ""
    },
];