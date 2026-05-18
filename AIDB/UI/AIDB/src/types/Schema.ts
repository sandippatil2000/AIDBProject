// Represents a single table with its columns
export interface TableSchema {
    tableName: string;
    columns: string[];
}

// Represents the entire JSON schema structure
export interface DatabaseSchema {
    schemaStructured: TableSchema[];
    schemaRaw: string[];
}
