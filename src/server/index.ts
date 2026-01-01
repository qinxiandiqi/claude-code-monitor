import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { ApiMonitor } from './Monitor.js';
import { ClaudeAPIProxy } from './proxy.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MonitorServer {
  private app: express.Application;
  private server: any = null;
  private wss!: WebSocketServer;
  private monitor: ApiMonitor;
  private proxy!: ClaudeAPIProxy;
  private config = {
    monitorPort: parseInt(process.env.MONITOR_PORT || '3002'),
    proxyPort: parseInt(process.env.PROXY_PORT || '3001'),
    targetUrl: process.env.TARGET_URL || 'https://api.anthropic.com',
    anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL || `http://localhost:3001`,
  };

  constructor() {
    this.app = express();
    this.monitor = new ApiMonitor();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupStaticFiles();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // API Routes
    this.app.get('/api/health', (req, res) => {
      const requestId = this.monitor.recordRequest({
        method: 'GET',
        url: '/api/health',
        path: '/api/health',
        headers: req.headers as Record<string, string>,
        startTime: Date.now(),
        timestamp: new Date(),
      }).id;

      const healthData = { status: 'ok', timestamp: new Date().toISOString() };

      this.monitor.recordResponse(requestId, {
        status: 200,
        statusText: 'OK',
        headers: res.getHeaders() as Record<string, string>,
        responseTime: 3,
        endTime: Date.now(),
        data: healthData,
      });

      res.json(healthData);
    });

    this.app.get('/api/stats', (req, res) => {
      const requestId = this.monitor.recordRequest({
        method: 'GET',
        url: '/api/stats',
        path: '/api/stats',
        headers: req.headers as Record<string, string>,
        startTime: Date.now(),
        timestamp: new Date(),
      }).id;

      const stats = this.monitor.getStats();

      this.monitor.recordResponse(requestId, {
        status: 200,
        statusText: 'OK',
        headers: res.getHeaders() as Record<string, string>,
        responseTime: 5,
        endTime: Date.now(),
        data: stats,
      });

      res.json(stats);
    });

    // 新增：详细统计API端点
    this.app.get('/api/detailed-stats', (req, res) => {
      const requestId = this.monitor.recordRequest({
        method: 'GET',
        url: '/api/detailed-stats',
        path: '/api/detailed-stats',
        headers: req.headers as Record<string, string>,
        startTime: Date.now(),
        timestamp: new Date(),
      }).id;

      const detailedStats = this.monitor.getDetailedStats();

      this.monitor.recordResponse(requestId, {
        status: 200,
        statusText: 'OK',
        headers: res.getHeaders() as Record<string, string>,
        responseTime: 5,
        endTime: Date.now(),
        data: detailedStats,
      });

      res.json(detailedStats);
    });

    this.app.get('/api/requests', (req, res) => {
      const requestId = this.monitor.recordRequest({
        method: 'GET',
        url: '/api/requests',
        path: '/api/requests',
        headers: req.headers as Record<string, string>,
        startTime: Date.now(),
        timestamp: new Date(),
      }).id;

      const limit = parseInt(req.query.limit as string) || 50;
      const requests = this.monitor.getRecentRequests(limit);

      this.monitor.recordResponse(requestId, {
        status: 200,
        statusText: 'OK',
        headers: res.getHeaders() as Record<string, string>,
        responseTime: 5,
        endTime: Date.now(),
        data: requests,
      });

      res.json(requests);
    });

    this.app.delete('/api/requests', (req, res) => {
      this.monitor.clearRequests();
      res.json({ message: 'Requests cleared successfully' });
    });
  }

  private setupStaticFiles(): void {
    // Serve static files from built React app
    this.app.use(express.static(join(__dirname, '../../dist/client')));

    // For development, redirect to Vite dev server
    if (process.env.NODE_ENV !== 'production') {
      this.app.use('*', (req, res) => {
        res.redirect('http://localhost:3000');
      });
    } else {
      // Serve React app for production
      this.app.get('*', (req, res) => {
        res.sendFile(join(__dirname, '../../dist/client/index.html'));
      });
    }
  }

  private setupWebSocket(): void {
    this.wss = new WebSocketServer({ server: this.server });

    this.wss.on('connection', (ws: any) => {
      console.log(chalk.blue('📱 New monitor client connected'));
      this.monitor.addWebSocketClient(ws);

      // Send initial data
      ws.send(
        JSON.stringify({
          type: 'stats',
          data: this.monitor.getStats(),
          timestamp: new Date().toISOString(),
        }),
      );

      ws.on('close', () => {
        console.log(chalk.yellow('📱 Monitor client disconnected'));
        this.monitor.removeWebSocketClient(ws);
      });

      ws.on('error', (error: any) => {
        console.error(chalk.red('WebSocket error:'), error);
        this.monitor.removeWebSocketClient(ws);
      });
    });
  }

  async start(): Promise<void> {
    try {
      // Start server
      this.server = createServer(this.app);

      this.server.listen(this.config.monitorPort, () => {
        console.log(chalk.green.bold(`🚀 Claude API Monitor running on http://localhost:${this.config.monitorPort}`));
        console.log(chalk.blue(`📊 Monitor dashboard: http://localhost:${this.config.monitorPort}`));
        console.log(chalk.cyan(`🔗 Proxy endpoint: ${this.config.anthropicBaseUrl}`));
        console.log('');
        console.log(chalk.yellow('📝 To use with Claude Code, the environment is already configured in:'));
        console.log(chalk.gray(`   .claude/settings.local.json`));
        console.log('');
        console.log(chalk.green('✨ Monitor is ready!'));
      });

      this.setupWebSocket();

      // Start proxy
      this.proxy = new ClaudeAPIProxy({
        port: this.config.proxyPort,
        monitorPort: this.config.monitorPort,
        targetUrl: this.config.targetUrl,
        monitor: this.monitor,
      });

      // Graceful shutdown
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n🛑 Shutting down gracefully...'));
        this.server?.close();
        this.proxy?.stop();
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        console.log(chalk.yellow('\n🛑 Shutting down gracefully...'));
        this.server?.close();
        this.proxy?.stop();
        process.exit(0);
      });

    } catch (error) {
      console.error(chalk.red('Failed to start server:'), error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new MonitorServer();
server.start().catch(console.error);