import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { StatCard } from '../components/StatCard.js';
import { ConnectionStatusComponent } from '../components/ConnectionStatus.js';
import { RequestHistory } from '../components/RequestHistory.js';

export const Dashboard: React.FC = () => {
  const { stats, requests, connectionStatus, clearRequests, reconnect } = useWebSocket(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:3002`
  );

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