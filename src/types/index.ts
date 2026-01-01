export interface ApiRequest {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  path: string;
  headers: Record<string, string>;
  startTime: number;
  response?: ApiResponse;
  tokenUsage?: TokenUsage;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  responseTime: number;
  endTime: number;
  data?: any;
}

export interface TokenUsage {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
}

export interface MonitorStats {
  totalRequests: number;
  recentRequests: number;
  totalTokens: {
    input: number;
    output: number;
    total: number;
  };
  inputTokens: number;
  outputTokens: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  tokensPerMinute: number;
}

export interface ResponseTimeStats {
  fastest: number;
  slowest: number;
  average: number;
  median: number;
  p95: number;
  p99: number;
}

export interface TokenStats {
  totalInput: number;
  totalOutput: number;
  totalTokens: number;
  averageInputPerRequest: number;
  averageOutputPerRequest: number;
  averageTotalPerRequest: number;
  tokensPerResponseTime: number;
}

export interface DetailedStats extends MonitorStats {
  responseTimeStats: ResponseTimeStats;
  tokenStats: TokenStats;
}

export interface WebSocketMessage {
  type: 'stats' | 'request' | 'connection' | 'error';
  data: any;
  timestamp?: string;
}

export interface ServerConfig {
  proxyPort: number;
  monitorPort: number;
  targetUrl: string;
  anthropicBaseUrl?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastConnected?: Date;
  reconnectAttempts: number;
}