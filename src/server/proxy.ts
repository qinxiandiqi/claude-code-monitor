import { createProxyMiddleware } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { ApiMonitor } from './Monitor.js';

export interface ProxyOptions {
  port?: number;
  monitorPort?: number;
  targetUrl?: string;
  monitor?: ApiMonitor;
}

export class ClaudeAPIProxy {
  private targetUrl: string;
  private port: number;
  private monitorPort: number;
  private monitor: ApiMonitor;
  private proxyMiddleware: any;
  private server?: any;

  constructor(options: ProxyOptions = {}) {
    this.targetUrl = options.targetUrl || 'https://api.anthropic.com';
    this.port = options.port || 3001;
    this.monitorPort = options.monitorPort || 3002;
    this.monitor = options.monitor || new ApiMonitor();

    this.setupProxy();
  }

  private setupProxy(): void {
    const proxyOptions = {
      target: this.targetUrl,
      changeOrigin: true,
      secure: true,
      onProxyReq: (proxyReq: any, req: IncomingMessage) => {
        // 记录请求开始时间
        (req as any).startTime = Date.now();

        const requestData = {
          method: req.method || 'GET',
          url: req.url || '/',
          path: req.url?.split('?')[0] || '/',
          headers: req.headers as Record<string, string>,
          startTime: (req as any).startTime,
        };

        (req as any).requestId = this.monitor.recordRequest(requestData).id;

        console.log(chalk.blue(`🔵 [${new Date().toISOString()}] ${req.method} ${req.url}`));
      },

      onProxyRes: (proxyRes: any, req: IncomingMessage, res: ServerResponse) => {
        const endTime = Date.now();
        const responseTime = endTime - ((req as any).startTime || endTime);

        let responseData = '';

        proxyRes.on('data', (chunk: Buffer) => {
          responseData += chunk.toString();
        });

        proxyRes.on('end', () => {
          try {
            const data = responseData ? JSON.parse(responseData) : null;

            this.monitor.recordResponse((req as any).requestId, {
              status: proxyRes.statusCode || 500,
              statusText: proxyRes.statusMessage || 'Unknown',
              headers: proxyRes.headers as Record<string, string>,
              responseTime: responseTime,
              endTime: endTime,
              data: data,
            });

            console.log(
              chalk.green(
                `🟢 [${new Date().toISOString()}] ${req.method} ${req.url} - ${proxyRes.statusCode} (${responseTime}ms)`,
              ),
            );

            if (data && data.usage) {
              console.log(
                chalk.yellow(
                  `📊 Tokens: ${data.usage.input_tokens || 0} input, ${data.usage.output_tokens || 0} output`,
                ),
              );
            }
          } catch (error) {
            console.error(chalk.red('Error parsing response:'), error);
            this.monitor.recordResponse((req as any).requestId, {
              status: proxyRes.statusCode || 500,
              statusText: proxyRes.statusMessage || 'Unknown',
              headers: proxyRes.headers as Record<string, string>,
              responseTime: responseTime,
              endTime: endTime,
              data: null,
            });
          }
        });
      },

      onError: (err: Error, req: IncomingMessage, res: ServerResponse) => {
        console.error(chalk.red(`❌ Proxy error for ${req.method} ${req.url}:`), err.message);

        if (!res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'text/plain',
          });
          res.end('Proxy Error: ' + err.message);
        }
      },
    };

    this.proxyMiddleware = createProxyMiddleware(proxyOptions);
  }

  getMiddleware() {
    return this.proxyMiddleware;
  }

  async start(port?: number): Promise<void> {
    const express = await import('express');
    const app = express.default();

    // Apply proxy middleware to all routes
    app.use('/', this.proxyMiddleware);

    return new Promise<void>((resolve, reject) => {
      try {
        this.server = app.listen(port || this.port, () => {
          console.log(chalk.cyan(`🔗 Proxy server listening on port ${port || this.port}`));
          resolve();
        });

        this.server.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            console.error(chalk.red(`Port ${port || this.port} is already in use`));
            reject(error);
          } else {
            reject(error);
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      console.log(chalk.yellow('🛑 Proxy server stopped'));
    }
  }
}