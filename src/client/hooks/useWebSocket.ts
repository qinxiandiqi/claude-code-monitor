import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketMessage, MonitorStats, ApiRequest, ConnectionStatus } from '../../types/index.js';

interface UseWebSocketReturn {
  stats: MonitorStats | null;
  requests: ApiRequest[];
  connectionStatus: ConnectionStatus;
  clearRequests: () => void;
  reconnect: () => void;
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnectAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('📱 Connected to monitor server');
        setConnectionStatus({
          connected: true,
          lastConnected: new Date(),
          reconnectAttempts: 0,
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'stats':
              setStats(message.data);
              break;
            case 'request':
              setRequests((prev) => {
                const newRequests = [message.data, ...prev];
                return newRequests.slice(0, 100); // Keep only last 100 requests
              });
              break;
            case 'connection':
              // Handle connection status updates
              break;
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('📱 Disconnected from monitor server', event.code, event.reason);
        setConnectionStatus((prev) => ({
          ...prev,
          connected: false,
        }));

        // Auto-reconnect if not explicitly closed
        if (event.code !== 1000 && connectionStatus.reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus((prev) => ({
          ...prev,
          connected: false,
        }));
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setConnectionStatus((prev) => ({
        ...prev,
        connected: false,
      }));
    }
  }, [url, connectionStatus.reconnectAttempts]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      setConnectionStatus((prev) => {
        const newAttempts = prev.reconnectAttempts + 1;
        console.log(`🔄 Reconnecting... (${newAttempts}/${maxReconnectAttempts})`);

        if (newAttempts <= maxReconnectAttempts) {
          connect();
        } else {
          console.error('❌ Max reconnection attempts reached');
        }

        return {
          ...prev,
          reconnectAttempts: newAttempts,
        };
      });
    }, reconnectInterval);
  }, [connect]);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setConnectionStatus((prev) => ({
      ...prev,
      reconnectAttempts: 0,
    }));
    connect();
  }, [connect]);

  const clearRequests = useCallback(() => {
    setRequests([]);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connect]);

  return {
    stats,
    requests,
    connectionStatus,
    clearRequests,
    reconnect,
  };
};