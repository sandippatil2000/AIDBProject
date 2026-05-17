import { apiClient } from './api';
import type { Connection } from '../types/Connection';

export const ConnectionAPI = {
  getConnections: async () => {
    return apiClient.get<Connection[]>('/Connections');
  },

  addConnection: async (connection: Connection) => {
    return apiClient.post<void>('/Connections', connection);
  },

  deleteConnection: async (name: string) => {
    return apiClient.delete<void>(`/Connections/${encodeURIComponent(name)}`);
  }
};
