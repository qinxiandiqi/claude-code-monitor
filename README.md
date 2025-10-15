# 🔍 Claude Code API Monitor v2.0

一个现代化的 Claude Code API 请求监控工具，使用 React + TypeScript + DaisyUI + Vite 构建。

## ✨ 特性

- 🚀 **现代化技术栈** - React 18, TypeScript, Vite, DaisyUI 4
- 📊 **实时监控** - WebSocket 实时数据推送，无延迟更新
- ⚡ **高性能** - Vite 提供极速的开发和构建体验
- 🎨 **美观界面** - 基于 DaisyUI 的现代化响应式设计
- 🔒 **类型安全** - 完整的 TypeScript 类型定义
- 📈 **详细统计** - Token 使用量、响应时间、请求频率等
- 🔄 **自动重连** - WebSocket 断线自动重连机制
- 📱 **响应式** - 完美适配桌面和移动设备

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 下一代前端构建工具
- **DaisyUI 4** - 基于 Tailwind CSS 的组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Recharts** - 数据可视化图表库
- **date-fns** - 日期处理工具库

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **WebSocket** - 实时双向通信
- **http-proxy-middleware** - HTTP 代理中间件
- **tsx** - TypeScript 执行器

## 📋 功能特性

### 🎯 核心监控功能
- ✅ HTTP 请求拦截和记录
- ✅ 实时响应时间监控
- ✅ Token 使用量统计（输入/输出/总计）
- ✅ 请求频率分析
- ✅ WebSocket 实时数据推送
- ✅ 请求历史详细记录

### 📊 监控指标
- **总请求数** - 累计 API 请求总数
- **平均响应时间** - 最近 100 个请求的平均响应时间
- **请求频率** - 每分钟请求数（RPM）
- **Token 使用量** - 输入/输出/总 Token 数量
- **Token 频率** - 每分钟 Token 使用量
- **最近请求** - 最近 1 小时的请求数

### 🎨 用户界面
- **统计卡片** - 关键指标的直观展示
- **实时状态** - WebSocket 连接状态显示
- **请求历史** - 详细的请求记录表格
- **响应式设计** - 适配各种屏幕尺寸
- **深色/浅色主题** - 支持主题切换

## 🚀 快速开始

### 1. 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐) 或 npm >= 9.0.0

### 2. 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install
```

### 3. 环境配置
复制并编辑环境配置文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 代理服务器端口 (默认: 3001)
PROXY_PORT=3001

# 监控面板端口 (默认: 3002)
MONITOR_PORT=3002

# 目标 Anthropic API URL
TARGET_URL=https://api.anthropic.com

# Claude Code API Base URL (已配置为使用监控代理)
ANTHROPIC_BASE_URL=http://localhost:3001

# 开发模式
NODE_ENV=development
```

### 4. 启动应用

#### 开发模式（推荐）
```bash
# 同时启动前端和后端
pnpm run dev
```

#### 分别启动
```bash
# 启动前端开发服务器
pnpm run client
# 访问: http://localhost:3000

# 启动后端服务器
pnpm run server
# 监控服务: http://localhost:3002
# 代理服务: http://localhost:3001
```

#### 生产模式
```bash
# 构建并启动
pnpm run start
```

## 📖 使用指南

### 配置 Claude Code

项目已自动配置环境变量，Claude Code 会自动使用监控代理。配置文件位于：
- `.claude/settings.local.json` - 项目级别的 Claude Code 配置

### 监控面板

访问 http://localhost:3002 查看监控面板：

1. **连接状态** - 显示 WebSocket 连接状态
2. **统计卡片** - 实时显示关键指标
3. **请求历史** - 详细的 API 请求记录
4. **实时更新** - 数据自动刷新，无需手动刷新

### API 接口

- `GET /api/health` - 健康检查
- `GET /api/stats` - 获取统计数据
- `GET /api/requests?limit=50` - 获取请求历史
- `DELETE /api/requests` - 清除请求记录

### WebSocket 连接

- `ws://localhost:3002` - 实时数据推送

## 🏗️ 项目结构

```
claude-code-monitor/
├── 📁 src/
│   ├── 📁 client/                 # React 前端
│   │   ├── 📁 components/         # UI 组件
│   │   │   ├── StatCard.tsx       # 统计卡片
│   │   │   ├── ConnectionStatus.tsx # 连接状态
│   │   │   └── RequestHistory.tsx # 请求历史
│   │   ├── 📁 hooks/             # React Hooks
│   │   │   ├── useWebSocket.ts   # WebSocket 客户端
│   │   │   └── useApi.ts         # API 客户端
│   │   ├── 📁 pages/             # 页面组件
│   │   │   └── Dashboard.tsx     # 主仪表板
│   │   ├── App.tsx               # 应用入口
│   │   └── main.tsx              # React 入口
│   ├── 📁 server/                 # Node.js 后端
│   │   ├── Monitor.ts            # 监控核心逻辑
│   │   ├── proxy.ts              # API 代理
│   │   └── index.ts              # 服务器入口
│   ├── 📁 types/                  # TypeScript 类型
│   │   └── index.ts              # 类型定义
│   └── 📁 utils/                  # 工具函数
│       └── coloredConsole.ts     # 控制台颜色
├── 📄 package.json               # 项目配置
├── 📄 vite.config.ts             # Vite 配置
├── 📄 tsconfig.json              # TypeScript 配置
├── 📄 tailwind.config.js         # Tailwind CSS 配置
├── 📄 .env                       # 环境变量
├── 📄 .gitignore                 # Git 忽略文件
└── 📄 README.md                  # 项目文档
```

## 🛠️ 开发指南

### 可用脚本

```bash
# 开发
pnpm run dev              # 同时启动前后端开发服务器
pnpm run client           # 仅启动前端开发服务器
pnpm run server           # 仅启动后端服务器

# 构建
pnpm run build            # 构建生产版本
pnpm run preview          # 预览构建结果

# 类型检查
pnpm run type-check       # TypeScript 类型检查
```

### 自定义配置

#### 修改端口
在 `.env` 文件中修改：
```env
PROXY_PORT=3001          # 代理服务器端口
MONITOR_PORT=3002        # 监控面板端口
```

#### 修改样式
编辑 `tailwind.config.js` 和 `daisyui` 主题配置。

#### 添加新的监控指标
1. 在 `src/types/index.ts` 中添加类型定义
2. 在 `src/server/Monitor.ts` 中实现监控逻辑
3. 在前端组件中显示新指标

## 🔧 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # Windows
   netstat -ano | findstr :3002
   taskkill //F //PID <PID>

   # Linux/macOS
   lsof -ti:3002 | xargs kill -9
   ```

2. **依赖安装失败**
   ```bash
   # 清除缓存重新安装
   pnpm store prune
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **TypeScript 类型错误**
   ```bash
   # 检查类型
   pnpm run type-check
   ```

4. **WebSocket 连接失败**
   - 检查后端服务器是否正在运行
   - 确认端口配置正确
   - 检查防火墙设置

### 调试模式

启用详细日志：
```bash
DEBUG=* pnpm run server
```

## 📈 性能特性

- **前端构建时间** - < 2s (Vite HMR)
- **WebSocket 延迟** - < 10ms
- **API 响应时间** - < 5ms
- **内存使用** - < 100MB (开发模式)
- **代理延迟** - < 10ms 额外开销

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [DaisyUI](https://daisyui.com/) - 基于 Tailwind CSS 的组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

## 📞 支持

如果你遇到问题或有建议，请：

1. 查看 [Issues](../../issues) 页面
2. 创建新的 Issue
3. 联系项目维护者

---

**Claude Code API Monitor v2.0** - 让 API 监控变得简单而强大 🚀