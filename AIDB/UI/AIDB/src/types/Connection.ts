import type { DBTypes } from "./DBTypes";

export interface Connection {
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

