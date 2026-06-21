import type { DBTypes } from "./DBTypes";

export interface DBConnection {
    id: number;
    name: string;
    connectionString: string;
    databaseType: DBTypes;
    host: string;
    port: number;
    database: string;
    status: 'connected' | 'offline' | 'error';
    lastPing: string;
}

