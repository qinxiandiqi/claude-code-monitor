# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Claude Code API monitoring system that intercepts and tracks API requests, response times, and token usage through a proxy server. The system consists of:

- **Backend**: Node.js Express server with WebSocket real-time updates and HTTP proxy middleware
- **Frontend**: React 18 + TypeScript dashboard with DaisyUI components for real-time monitoring
- **Proxy**: HTTP proxy that intercepts ANTHROPIC_BASE_URL requests for monitoring

## Development Commands

### Package Management
```bash
pnpm install                    # Install dependencies
pnpm store prune               # Clean package cache (if needed)
```

### Development
```bash
pnpm run dev                   # Start both frontend (port 3000) and backend (port 3002)
pnpm run client                # Start only frontend dev server (Vite)
pnpm run server                # Start only backend server with tsx watch
```

### Build & Production
```bash
pnpm run build                 # Build production version (TypeScript compile + Vite build)
pnpm run start                 # Build and start production server
pnpm run preview               # Preview built application
```

### Type Checking
```bash
pnpm run type-check            # Run TypeScript compiler without emitting files
```

## Architecture

### Backend Structure (`src/server/`)
- **index.ts**: Main Express server with WebSocket setup and API routes
- **Monitor.ts**: Core monitoring logic - tracks requests, calculates stats, manages WebSocket clients
- **proxy.ts**: HTTP proxy middleware using `http-proxy-middleware` to intercept API calls

### Frontend Structure (`src/client/`)
- **Dashboard.tsx**: Main dashboard page with real-time stats and request history
- **components/**: React UI components (StatCard, ConnectionStatus, RequestHistory)
- **hooks/**: Custom React hooks (useWebSocket for real-time data, useApi for HTTP requests)

### Key Architecture Points
- **WebSocket Connection**: Frontend connects to `ws://localhost:3002` for real-time updates (NOT Vite dev server)
- **API Proxy**: Proxy server runs on port 3001, intercepts requests and forwards to target API
- **Monitor Server**: Main server runs on port 3002, serves both API and frontend
- **Type Safety**: All TypeScript interfaces defined in `src/types/index.ts`

### Data Flow
1. API requests flow through proxy (port 3001) → target API
2. Proxy records request start time and metadata in Monitor
3. Response recorded with timing and token usage data
4. Monitor calculates statistics and broadcasts via WebSocket to dashboard
5. Dashboard receives real-time updates and displays metrics

## Configuration

### Environment Variables (`.env`)
- `PROXY_PORT=3001`: HTTP proxy server port
- `MONITOR_PORT=3002`: Main monitor server port
- `TARGET_URL=https://api.anthropic.com`: Target API to proxy to
- `ANTHROPIC_BASE_URL=http://localhost:3001`: Configured for Claude Code integration

### Claude Code Integration
- `.claude/settings.local.json` automatically configures ANTHROPIC_BASE_URL to use the proxy
- Claude Code requests are automatically intercepted and monitored

## API Endpoints

- `GET /api/health`: Health check (also records test request)
- `GET /api/stats`: Get current monitoring statistics
- `GET /api/requests?limit=50`: Get recent request history
- `DELETE /api/requests`: Clear all request records
- `WebSocket ws://localhost:3002`: Real-time data streaming

## Development Notes

### TypeScript Configuration
- Uses `tsx watch` for backend development with hot reload
- Frontend uses Vite with React plugin
- Strict TypeScript with comprehensive type definitions

### WebSocket Implementation
- Server uses `ws` library for WebSocket server
- Frontend uses custom `useWebSocket` hook with auto-reconnection
- Real-time updates broadcast to all connected clients

### Proxy Configuration
- Uses `http-proxy-middleware` to intercept and forward HTTP requests
- Records request metadata and timing before forwarding
- Extracts token usage from API responses

### Known Issues
- WebSocket connections can be unstable during development when navigating
- Date-fns warnings in RequestHistory component (safe to ignore)
- Connection may drop and reconnect automatically - this is expected behavior

### Port Conflicts
If ports are occupied:
```bash
# Windows
netstat -ano | findstr :3002
taskkill //F //PID <PID>

# Linux/macOS
lsof -ti:3002 | xargs kill -9
```

## Testing the System

1. Start both servers: `pnpm run dev`
2. Visit http://localhost:3002 to see dashboard
3. Make test API calls: `curl http://localhost:3002/api/health`
4. Observe real-time updates in dashboard
5. Check WebSocket connection status in UI

The system should show "Connected" status and record API requests with response times and token usage.