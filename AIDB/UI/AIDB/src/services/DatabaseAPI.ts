import { apiClient } from './api';

export interface QueryRequest {
  sqlQuery?: string | null;
}

export const DatabaseAPI = {
  getSchema: async (connectionName: string) => {
    return apiClient.get<any>(`/Database/schema/${encodeURIComponent(connectionName)}`);
  },

  getDataTable: async (connectionName: string, queryRequest: QueryRequest) => {
    return apiClient.post<any>(`/Database/datatable/${encodeURIComponent(connectionName)}`, queryRequest);
  }
};
