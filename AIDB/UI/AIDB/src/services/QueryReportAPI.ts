import { apiClient } from './api';
import type { QueryReport } from '../types/QueryReport';

export const QueryReportAPI = {
  getQueryReports: async () => {
    return apiClient.get<QueryReport[]>('/QueryReport');
  },

  getQueryReportById: async (id: number) => {
    return apiClient.get<QueryReport>(`/QueryReport/${id}`);
  },

  createQueryReport: async (report: QueryReport) => {
    return apiClient.post<QueryReport>('/QueryReport', report);
  },

  updateQueryReport: async (id: number, report: QueryReport) => {
    return apiClient.put<void>(`/QueryReport/${id}`, report);
  },

  deleteQueryReport: async (id: number) => {
    return apiClient.delete<void>(`/QueryReport/${id}`);
  }
};
