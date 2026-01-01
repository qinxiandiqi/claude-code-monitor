import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { useApi } from '../hooks/useApi.js';
import { StatCard } from '../components/StatCard.js';
import { ConnectionStatusComponent } from '../components/ConnectionStatus.js';
import { RequestHistory } from '../components/RequestHistory.js';
import { DetailedStats } from '../components/DetailedStats.js';
import { DetailedStats as DetailedStatsType } from '../../types/index.js';

export const Dashboard: React.FC = () => {
  const { stats, requests, connectionStatus, clearRequests, reconnect } = useWebSocket(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:3002`
  );

  const { getDetailedStats } = useApi();
  const [detailedStats, setDetailedStats] = useState<DetailedStatsType | null>(null);
  const [showDetailed, setShowDetailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadDetailedStats = async () => {
    if (!showDetailed) return;

    setLoading(true);
    const result = await getDetailedStats();
    if (result.data && !result.error) {
      setDetailedStats(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDetailedStats();
  }, [showDetailed]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🔍 Claude Code API Monitor</h1>
          <p className="text-base-content/60">Real-time monitoring of Claude Code API requests, performance, and token usage</p>

          {/* 详细统计切换按钮 */}
          <div className="mt-4">
            <button
              className={`btn ${showDetailed ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowDetailed(!showDetailed)}
            >
              {showDetailed ? '📊 隐藏详细统计' : '📊 显示详细统计'}
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <ConnectionStatusComponent status={connectionStatus} onReconnect={reconnect} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Requests"
            value={formatNumber(stats?.totalRequests || 0)}
            icon={<div>📊</div>}
            color="primary"
            loading={!stats}
          />

          <StatCard
            title="Avg Response Time"
            value={stats ? formatResponseTime(stats.averageResponseTime) : '-'}
            icon={<div>⚡</div>}
            color="secondary"
            loading={!stats}
          />

          <StatCard
            title="Requests/Min"
            value={formatNumber(stats?.requestsPerMinute || 0)}
            unit="req/min"
            icon={<div>📈</div>}
            color="accent"
            loading={!stats}
          />

          <StatCard
            title="Total Tokens"
            value={formatNumber(stats?.totalTokens?.total || 0)}
            icon={<div>🪙</div>}
            color="success"
            loading={!stats}
          />

          <StatCard
            title="Input Tokens"
            value={formatNumber(stats?.totalTokens?.input || 0)}
            icon={<div>⬆️</div>}
            color="info"
            loading={!stats}
          />

          <StatCard
            title="Output Tokens"
            value={formatNumber(stats?.totalTokens?.output || 0)}
            icon={<div>⬇️</div>}
            color="warning"
            loading={!stats}
          />

          <StatCard
            title="Tokens/Min"
            value={formatNumber(stats?.tokensPerMinute || 0)}
            unit="tokens/min"
            icon={<div>💰</div>}
            color="success"
            loading={!stats}
          />

          <StatCard
            title="Recent Requests"
            value={formatNumber(stats?.recentRequests || 0)}
            unit="last hour"
            icon={<div>🕐</div>}
            color="secondary"
            loading={!stats}
          />
        </div>

        {/* 详细统计 */}
        {showDetailed && (
          <div className="mb-8">
            {loading ? (
              <div className="text-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
                <p className="mt-2">加载详细统计中...</p>
              </div>
            ) : detailedStats ? (
              <DetailedStats stats={detailedStats} />
            ) : (
              <div className="alert alert-error">
                <span>无法加载详细统计数据</span>
              </div>
            )}
          </div>
        )}

        {/* Request History */}
        <RequestHistory requests={requests} clearRequests={clearRequests} />

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-base-content/60">
          <p>Claude Code API Monitor v2.0 • Built with React, TypeScript & DaisyUI</p>
          {connectionStatus.connected && (
            <p className="mt-1">
              🟢 Live updates active • Last update: {new Date().toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};