export const DBTypes = {
  MSSQL: "MSSQL",
  MYSQL: "MYSQL",
  POSTGRESQL: "POSTGRESQL",
  ORACLE: "ORACLE",
} as const;

export type DBTypes = typeof DBTypes[keyof typeof DBTypes];
