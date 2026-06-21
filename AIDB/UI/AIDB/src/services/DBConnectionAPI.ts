import { apiClient } from './api';
import type { DBConnection } from '../types/DBConnection';

export const DBConnectionAPI = {
  /**
   * GET /api/DBConnection
   * Retrieve all DB connections.
   */
  getDBConnections: async () => {
    return apiClient.get<DBConnection[]>('/DBConnection');
  },

  /**
   * GET /api/DBConnection/{id}
   * Retrieve a single DB connection by ID.
   */
  getDBConnectionById: async (id: number) => {
    return apiClient.get<DBConnection>(`/DBConnection/${id}`);
  },

  /**
   * POST /api/DBConnection
   * Create a new DB connection.
   */
  createDBConnection: async (connection: DBConnection) => {
    return apiClient.post<DBConnection>('/DBConnection', connection);
  },

  /**
   * PUT /api/DBConnection/{id}
   * Update an existing DB connection by ID.
   */
  updateDBConnection: async (id: number, connection: DBConnection) => {
    return apiClient.put<void>(`/DBConnection/${id}`, connection);
  },

  /**
   * DELETE /api/DBConnection/{id}
   * Delete a DB connection by ID.
   */
  deleteDBConnection: async (id: number) => {
    return apiClient.delete<void>(`/DBConnection/${id}`);
  },
};
