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
  AWSBedrock: "AWSBedrock",
} as const;

export type AiService = typeof AiService[keyof typeof AiService];

export const AiModel = {
  gpt41: "gpt-4.1",
  claude35sonnet: "claude-3-5-sonnet",
} as const;

export type AiModel = typeof AiModel[keyof typeof AiModel];
