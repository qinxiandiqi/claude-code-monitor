import React, { useState } from 'react';
import clsx from 'clsx';
import { ApiRequest } from '../../types/index.js';
import { formatDistanceToNow } from 'date-fns';

interface RequestHistoryProps {
  requests: ApiRequest[];
  clearRequests: () => void;
}

export const RequestHistory: React.FC<RequestHistoryProps> = ({
  requests,
  clearRequests,
}) => {
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRequests = requests.filter((request) => {
    if (filter === 'all') return true;
    if (filter === 'success') return request.response && request.response.status < 400;
    if (filter === 'error') return request.response && request.response.status >= 400;
    return true;
  });

  const getStatusColor = (status?: number) => {
    if (!status) return 'neutral';
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'warning';
    if (status >= 400 && status < 500) return 'warning';
    return 'error';
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTokens = (tokens?: number) => {
    if (!tokens) return '0';
    if (tokens < 1000) return tokens.toString();
    return `${(tokens / 1000).toFixed(1)}k`;
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">📋 Request History</h2>
          <div className="flex items-center gap-2">
            <div className="join">
              <button
                className={clsx('join-item btn btn-sm', filter === 'all' && 'btn-active')}
                onClick={() => setFilter('all')}
              >
                All ({requests.length})
              </button>
              <button
                className={clsx('join-item btn btn-sm', filter === 'success' && 'btn-active')}
                onClick={() => setFilter('success')}
              >
                Success
              </button>
              <button
                className={clsx('join-item btn btn-sm', filter === 'error' && 'btn-active')}
                onClick={() => setFilter('error')}
              >
                Error
              </button>
            </div>
            <button
              className="btn btn-sm btn-outline btn-error"
              onClick={clearRequests}
              disabled={requests.length === 0}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Status</th>
                <th>Time</th>
                <th>Tokens</th>
                <th>Age</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-base-content/60">
                    {requests.length === 0 ? 'No requests yet' : 'No requests match the filter'}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <React.Fragment key={request.id}>
                    <tr
                      className={clsx(
                        'hover cursor-pointer',
                        expandedId === request.id && 'bg-base-200'
                      )}
                      onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                    >
                      <td>
                        <span
                          className={clsx(
                            'badge badge-sm',
                            request.method === 'GET' && 'badge-success',
                            request.method === 'POST' && 'badge-primary',
                            request.method === 'PUT' && 'badge-warning',
                            request.method === 'DELETE' && 'badge-error',
                            !['GET', 'POST', 'PUT', 'DELETE'].includes(request.method) && 'badge-info'
                          )}
                        >
                          {request.method}
                        </span>
                      </td>
                      <td className="max-w-xs truncate" title={request.url}>
                        {request.path}
                      </td>
                      <td>
                        {request.response ? (
                          <span className={clsx('badge badge-sm', `badge-${getStatusColor(request.response.status)}`)}>
                            {request.response.status}
                          </span>
                        ) : (
                          <span className="badge badge-sm badge-ghost">Pending</span>
                        )}
                      </td>
                      <td>
                        {request.response ? (
                          <span className={clsx(
                            'text-xs',
                            request.response.responseTime > 1000 ? 'text-warning' : 'text-success'
                          )}>
                            {formatResponseTime(request.response.responseTime)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {request.tokenUsage ? (
                          <div className="text-xs">
                            <span>{formatTokens(request.tokenUsage.input_tokens)}↑</span>
                            <span className="ml-1">{formatTokens(request.tokenUsage.output_tokens)}↓</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="text-xs text-base-content/60">
                        {formatDistanceToNow(request.timestamp, { addSuffix: true })}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expandedId === request.id ? null : request.id);
                          }}
                        >
                          {expandedId === request.id ? '▲' : '▼'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === request.id && (
                      <tr>
                        <td colSpan={7} className="bg-base-200 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold mb-2">Request Details</h4>
                              <div className="space-y-1">
                                <div><strong>URL:</strong> {request.url}</div>
                                <div><strong>Timestamp:</strong> {request.timestamp.toISOString()}</div>
                                <div><strong>Headers:</strong></div>
                                <pre className="text-xs bg-base-300 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(request.headers, null, 2)}
                                </pre>
                              </div>
                            </div>
                            {request.response && (
                              <div>
                                <h4 className="font-semibold mb-2">Response Details</h4>
                                <div className="space-y-1">
                                  <div><strong>Status:</strong> {request.response.status} {request.response.statusText}</div>
                                  <div><strong>Response Time:</strong> {formatResponseTime(request.response.responseTime)}</div>
                                  {request.tokenUsage && (
                                    <div>
                                      <strong>Token Usage:</strong>
                                      <div className="ml-2">
                                        <div>Input: {formatTokens(request.tokenUsage.input_tokens)}</div>
                                        <div>Output: {formatTokens(request.tokenUsage.output_tokens)}</div>
                                        <div>Total: {formatTokens(request.tokenUsage.total_tokens)}</div>
                                      </div>
                                    </div>
                                  )}
                                  {request.response.data && (
                                    <div>
                                      <strong>Response Data:</strong>
                                      <pre className="text-xs bg-base-300 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
                                        {JSON.stringify(request.response.data, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};