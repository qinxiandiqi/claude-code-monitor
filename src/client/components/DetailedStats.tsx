import React from 'react';
import { DetailedStats, ResponseTimeStats, TokenStats } from '../../types/index.js';

interface DetailedStatsProps {
  stats: DetailedStats;
}

const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const formatTokens = (tokens: number): string => {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return tokens.toString();
};

export const DetailedStats: React.FC<DetailedStatsProps> = ({ stats }) => {
  const { responseTimeStats, tokenStats } = stats;

  return (
    <div className="grid gap-6">
      {/* 响应时间统计 */}
      <div className="card bg-base-200 shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-base-content">⏱️ 响应时间统计</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="stat-item bg-base-300 rounded-lg p-3">
            <div className="text-xs text-base-content/70">最快</div>
            <div className="text-lg font-semibold text-success">
              {formatTime(responseTimeStats.fastest)}
            </div>
          </div>
          <div className="stat-item bg-base-300 rounded-lg p-3">
            <div className="text-xs text-base-content/70">最慢</div>
            <div className="text-lg font-semibold text-error">
              {formatTime(responseTimeStats.slowest)}
            </div>
          </div>
          <div className="stat-item bg-base-300 rounded-lg p-3">
            <div className="text-xs text-base-content/70">平均</div>
            <div className="text-lg font-semibold text-info">
              {formatTime(responseTimeStats.average)}
            </div>
          </div>
          <div className="stat-item bg-base-300 rounded-lg p-3">
            <div className="text-xs text-base-content/70">中位数</div>
            <div className="text-lg font-semibold text-warning">
              {formatTime(responseTimeStats.median)}
            </div>
          </div>
          <div className="stat-item bg-base-300 rounded-lg p-3">
            <div className="text-xs text-base-content/70">P95</div>
            <div className="text-lg font-semibold text-primary">
              {formatTime(responseTimeStats.p95)}
            </div>
          </div>
          <div className="stat-item bg-base-300 rounded-lg p-3">
            <div className="text-xs text-base-content/70">P99</div>
            <div className="text-lg font-semibold text-secondary">
              {formatTime(responseTimeStats.p99)}
            </div>
          </div>
        </div>
      </div>

      {/* Token使用统计 */}
      <div className="card bg-base-200 shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-base-content">🪙 Token消耗统计</h2>

        {/* 总计统计 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-base-content/80">总计统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="stat-item bg-base-300 rounded-lg p-4">
              <div className="text-sm text-base-content/70">输入Token</div>
              <div className="text-2xl font-bold text-primary">
                {formatTokens(tokenStats.totalInput)}
              </div>
            </div>
            <div className="stat-item bg-base-300 rounded-lg p-4">
              <div className="text-sm text-base-content/70">输出Token</div>
              <div className="text-2xl font-bold text-success">
                {formatTokens(tokenStats.totalOutput)}
              </div>
            </div>
            <div className="stat-item bg-base-300 rounded-lg p-4">
              <div className="text-sm text-base-content/70">总计Token</div>
              <div className="text-2xl font-bold text-warning">
                {formatTokens(tokenStats.totalTokens)}
              </div>
            </div>
          </div>
        </div>

        {/* 平均统计 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-base-content/80">平均每请求统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="stat-item bg-base-300 rounded-lg p-4">
              <div className="text-sm text-base-content/70">平均输入Token</div>
              <div className="text-xl font-semibold text-primary">
                {formatTokens(tokenStats.averageInputPerRequest)}
              </div>
            </div>
            <div className="stat-item bg-base-300 rounded-lg p-4">
              <div className="text-sm text-base-content/70">平均输出Token</div>
              <div className="text-xl font-semibold text-success">
                {formatTokens(tokenStats.averageOutputPerRequest)}
              </div>
            </div>
            <div className="stat-item bg-base-300 rounded-lg p-4">
              <div className="text-sm text-base-content/70">平均总Token</div>
              <div className="text-xl font-semibold text-warning">
                {formatTokens(tokenStats.averageTotalPerRequest)}
              </div>
            </div>
          </div>
        </div>

        {/* 效率指标 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-base-content/80">效率指标</h3>
          <div className="stat-item bg-base-300 rounded-lg p-4">
            <div className="text-sm text-base-content/70">Token/秒（基于响应时间）</div>
            <div className="text-xl font-semibold text-info">
              {tokenStats.tokensPerResponseTime}
            </div>
          </div>
        </div>
      </div>

      {/* 性能建议 */}
      <div className="card bg-base-200 shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-base-content">💡 性能分析</h2>
        <div className="space-y-3">
          {responseTimeStats.p95 > 5000 && (
            <div className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>95%的请求响应时间超过5秒，建议优化API调用</span>
            </div>
          )}

          {tokenStats.averageTotalPerRequest > 10000 && (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>平均每请求超过10K token，考虑优化提示长度或使用摘要</span>
            </div>
          )}

          {stats.averageResponseTime > 3000 && (
            <div className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>平均响应时间较长，建议检查网络连接或减少请求复杂度</span>
            </div>
          )}

          {tokenStats.tokensPerResponseTime < 50 && (
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Token使用效率良好！</span>
            </div>
          )}

          {responseTimeStats.average < 1000 && stats.totalRequests > 0 && (
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>平均响应时间优秀，系统运行流畅！</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};