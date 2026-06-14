export const DBTypes = {
  MSSQL: "MSSQL",
  MYSQL: "MYSQL",
  POSTGRESQL: "POSTGRESQL",
  ORACLE: "ORACLE",
} as const;

export type DBTypes = typeof DBTypes[keyof typeof DBTypes];

export const AiService = {
  AzureOpenAI: "AzureOpenAI",
  OpenAI: "OpenAI",
  Ollama: "Ollama",
} as const;

export type AiService = typeof AiService[keyof typeof AiService];

export const AiModel = {
  gpt52: "gpt-5.2",
  gpt5: "gpt-5",
  gpt5mini: "gpt-5-min",
  gpt41: "gpt-4.1",
  gpt41Mini: "gpt-4.1-mini",
} as const;

export type AiModel = typeof AiModel[keyof typeof AiModel];
