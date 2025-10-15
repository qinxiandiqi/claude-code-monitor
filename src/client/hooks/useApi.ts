import { useState, useEffect, useCallback } from 'react';
import { MonitorStats, ApiRequest } from '../../types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const request = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, loading: false };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      };
    }
  }, []);

  const getStats = useCallback(async (): Promise<ApiResponse<MonitorStats>> => {
    return request<MonitorStats>('/stats');
  }, [request]);

  const getRequests = useCallback(async (limit = 50): Promise<ApiResponse<ApiRequest[]>> => {
    return request<ApiRequest[]>(`/requests?limit=${limit}`);
  }, [request]);

  const clearRequests = useCallback(async (): Promise<ApiResponse<{ message: string }>> => {
    return request<{ message: string }>('/requests', { method: 'DELETE' });
  }, [request]);

  const getHealth = useCallback(async (): Promise<ApiResponse<{ status: string; timestamp: string }>> => {
    return request<{ status: string; timestamp: string }>('/health');
  }, [request]);

  return {
    loading,
    getStats,
    getRequests,
    clearRequests,
    getHealth,
    request,
  };
};