import React from 'react';
import clsx from 'clsx';
import { ConnectionStatus } from '../../types/index.js';

interface ConnectionStatusProps {
  status: ConnectionStatus;
  onReconnect?: () => void;
}

export const ConnectionStatusComponent: React.FC<ConnectionStatusProps> = ({
  status,
  onReconnect,
}) => {
  const getStatusText = () => {
    if (status.connected) return 'Connected';
    if (status.reconnectAttempts > 0) return `Reconnecting... (${status.reconnectAttempts}/5)`;
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (status.connected) return 'success';
    if (status.reconnectAttempts > 0) return 'warning';
    return 'error';
  };

  const getStatusIcon = () => {
    if (status.connected) {
      return (
        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
      );
    }
    if (status.reconnectAttempts > 0) {
      return (
        <div className="w-2 h-2 bg-warning rounded-full animate-spin"></div>
      );
    }
    return (
      <div className="w-2 h-2 bg-error rounded-full"></div>
    );
  };

  return (
    <div className={clsx('alert', `alert-${getStatusColor()}`, 'mb-4')}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
          {status.lastConnected && (
            <span className="text-sm opacity-70">
              Last connected: {status.lastConnected.toLocaleTimeString()}
            </span>
          )}
        </div>
        {!status.connected && onReconnect && (
          <button
            className="btn btn-sm btn-primary"
            onClick={onReconnect}
            disabled={status.reconnectAttempts >= 5}
          >
            {status.reconnectAttempts >= 5 ? 'Max Attempts Reached' : 'Reconnect'}
          </button>
        )}
      </div>
    </div>
  );
};