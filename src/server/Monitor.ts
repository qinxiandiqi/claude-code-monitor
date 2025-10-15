import WebSocket from 'ws';
import { ApiRequest, ApiResponse, MonitorStats, TokenUsage, WebSocketMessage } from '../types/index.js';

export class ApiMonitor {
  private requests: ApiRequest[] = [];
  private tokens = {
    input: 0,
    output: 0,
    total: 0,
  };
  private responseTimes: number[] = [];
  private websocketClients = new Set<WebSocket>();

  recordRequest(requestData: Omit<ApiRequest, 'id' | 'response' | 'tokenUsage'>): ApiRequest {
    const request: ApiRequest = {
      ...requestData,
      id: Date.now() + Math.random().toString(),
    };

    this.requests.push(request);
    return request;
  }

  recordResponse(requestId: string, responseData: ApiResponse): void {
    const request = this.requests.find((r) => r.id === requestId);
    if (request) {
      request.response = responseData;

      // 记录响应时间
      this.responseTimes.push(responseData.responseTime);
      if (this.responseTimes.length > 1000) {
        this.responseTimes.shift();
      }

      // 解析token使用量
      if (responseData.data) {
        const tokenUsage = this.extractTokenUsage(responseData.data);
        if (tokenUsage) {
          request.tokenUsage = tokenUsage;
          this.tokens.input += tokenUsage.input_tokens || 0;
          this.tokens.output += tokenUsage.output_tokens || 0;
          this.tokens.total += tokenUsage.total_tokens || 0;
        }
      }

      // 实时推送给WebSocket客户端
      this.broadcastUpdate({
        type: 'request',
        data: request,
        timestamp: new Date().toISOString(),
      });
    }
  }

  extractTokenUsage(data: any): TokenUsage | null {
    try {
      // 尝试从不同的响应格式中提取token信息
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }

      // Anthropic API 响应格式
      if (data.usage) {
        return data.usage;
      }

      // 检查 response 对象中的 usage
      if (data.response && data.response.usage) {
        return data.response.usage;
      }

      // Claude Code 可能的格式
      if (data.content) {
        // 估算token数量（粗略估算）
        const inputText = JSON.stringify(data.content);
        return {
          input_tokens: Math.ceil(inputText.length / 4),
          output_tokens: 0,
          total_tokens: Math.ceil(inputText.length / 4),
        };
      }

      return null;
    } catch (error) {
      console.error('Error extracting token usage:', error);
      return null;
    }
  }

  getStats(): MonitorStats {
    const now = Date.now();
    const recentRequests = this.requests.filter(
      (r) => now - r.timestamp.getTime() < 3600000, // 最近1小时
    );

    const recentResponseTimes = this.responseTimes.slice(-100); // 最近100个请求

    return {
      totalRequests: this.requests.length,
      recentRequests: recentRequests.length,
      totalTokens: this.tokens,
      inputTokens: this.tokens.input,
      outputTokens: this.tokens.output,
      averageResponseTime:
        recentResponseTimes.length > 0
          ? recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length
          : 0,
      requestsPerMinute: this.calculateRequestsPerMinute(recentRequests),
      tokensPerMinute: this.calculateTokensPerMinute(),
    };
  }

  calculateRequestsPerMinute(requests: ApiRequest[]): number {
    if (requests.length < 2) return 0;

    const timeSpan = (Date.now() - requests[0]!.timestamp.getTime()) / 60000; // 转换为分钟
    return timeSpan > 0 ? Math.round(requests.length / timeSpan) : 0;
  }

  calculateTokensPerMinute(): number {
    // 基于总token和运行时间计算每分钟token数
    if (this.requests.length < 2) return 0;

    const timeSpan = (Date.now() - this.requests[0]!.timestamp.getTime()) / 60000;
    return timeSpan > 0 ? Math.round(this.tokens.total / timeSpan) : 0;
  }

  addWebSocketClient(ws: WebSocket): void {
    this.websocketClients.add(ws);
  }

  removeWebSocketClient(ws: WebSocket): void {
    this.websocketClients.delete(ws);
  }

  broadcastUpdate(message: WebSocketMessage): void {
    this.websocketClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  getRecentRequests(limit: number = 50): ApiRequest[] {
    return this.requests.slice(-limit).reverse();
  }

  clearRequests(): void {
    this.requests = [];
    this.tokens = { input: 0, output: 0, total: 0 };
    this.responseTimes = [];
  }
}