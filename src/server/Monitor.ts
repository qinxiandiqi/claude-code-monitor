import WebSocket from 'ws';
import { ApiRequest, ApiResponse, MonitorStats, TokenUsage, WebSocketMessage, ResponseTimeStats, TokenStats, DetailedStats } from '../types/index.js';

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

  // 新增：计算响应时间统计
  calculateResponseTimeStats(): ResponseTimeStats {
    const validResponseTimes = this.responseTimes.filter(time => time > 0);

    if (validResponseTimes.length === 0) {
      return {
        fastest: 0,
        slowest: 0,
        average: 0,
        median: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sortedTimes = [...validResponseTimes].sort((a, b) => a - b);
    const len = sortedTimes.length;

    // 计算平均值
    const average = validResponseTimes.reduce((sum, time) => sum + time, 0) / len;

    // 计算中位数
    const median = len % 2 === 0
      ? (sortedTimes[len / 2 - 1]! + sortedTimes[len / 2]!) / 2
      : sortedTimes[Math.floor(len / 2)]!;

    // 计算百分位数
    const p95Index = Math.ceil(len * 0.95) - 1;
    const p99Index = Math.ceil(len * 0.99) - 1;
    const p95 = sortedTimes[p95Index] || 0;
    const p99 = sortedTimes[p99Index] || 0;

    return {
      fastest: sortedTimes[0]!,
      slowest: sortedTimes[len - 1]!,
      average: Math.round(average),
      median: Math.round(median),
      p95: Math.round(p95),
      p99: Math.round(p99),
    };
  }

  // 新增：计算Token使用统计
  calculateTokenStats(): TokenStats {
    const requestsWithTokens = this.requests.filter(req => req.tokenUsage);
    const tokenCount = requestsWithTokens.length;

    if (tokenCount === 0) {
      return {
        totalInput: this.tokens.input,
        totalOutput: this.tokens.output,
        totalTokens: this.tokens.total,
        averageInputPerRequest: 0,
        averageOutputPerRequest: 0,
        averageTotalPerRequest: 0,
        tokensPerResponseTime: 0,
      };
    }

    const totalInput = this.tokens.input;
    const totalOutput = this.tokens.output;
    const totalTokens = this.tokens.total;

    // 计算平均每请求的token使用量
    const averageInputPerRequest = totalInput / tokenCount;
    const averageOutputPerRequest = totalOutput / tokenCount;
    const averageTotalPerRequest = totalTokens / tokenCount;

    // 计算token效率（每毫秒响应时间产生的token数）
    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
      : 1;

    const tokensPerResponseTime = avgResponseTime > 0 ? totalTokens / avgResponseTime : 0;

    return {
      totalInput,
      totalOutput,
      totalTokens,
      averageInputPerRequest: Math.round(averageInputPerRequest),
      averageOutputPerRequest: Math.round(averageOutputPerRequest),
      averageTotalPerRequest: Math.round(averageTotalPerRequest),
      tokensPerResponseTime: Math.round(tokensPerResponseTime * 1000) / 1000, // 保留3位小数
    };
  }

  // 新增：获取详细统计信息
  getDetailedStats(): DetailedStats {
    const basicStats = this.getStats();
    const responseTimeStats = this.calculateResponseTimeStats();
    const tokenStats = this.calculateTokenStats();

    return {
      ...basicStats,
      responseTimeStats,
      tokenStats,
    };
  }
}