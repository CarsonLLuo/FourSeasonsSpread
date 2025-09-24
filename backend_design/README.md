# 四季牌阵 Node.js 后端 API

> 传统塔罗智慧与现代AI技术的完美结合

## 项目概述

这是一个专业的Node.js后端服务，为四季牌阵占卜系统提供API支持。系统包含完整的78张塔罗牌体系、智能抽牌算法和AI深度分析功能。

### 主要功能

- 🎴 **完整塔罗牌系统** - 78张牌的完整实现（22张大阿尔卡纳 + 56张小阿尔卡纳）
- 🔮 **四季牌阵抽牌** - 专业的五位牌阵抽取算法
- 🤖 **AI智能分析** - 基于aihubmix API的深度塔罗分析
- 🛡️ **安全可靠** - 完整的错误处理、速率限制和安全防护
- 📚 **API文档** - 详细的RESTful API接口文档

## 技术栈

- **框架**: Express.js 4.18+
- **运行环境**: Node.js 16+
- **AI服务**: aihubmix API
- **安全**: Helmet, CORS, Rate Limiting
- **工具**: Morgan (日志), dotenv (环境配置)

## 快速开始

### 1. 环境要求

```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制环境配置模板：
```bash
cp env.example .env
```

编辑 `.env` 文件，填入必要配置：
```bash
# 必填：aihubmix API密钥
AIHUBMIX_API_KEY=your_api_key_here

# 可选：其他配置
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

## API 接口文档

### 基础信息

- **Base URL**: `http://localhost:3001/api`
- **数据格式**: JSON
- **认证方式**: 无需认证（AI功能需要API密钥配置）

### 核心接口

#### 1. 抽取四季牌阵

```http
POST /api/tarot/draw
```

**响应示例**:
```json
{
  "success": true,
  "message": "四季牌阵抽取成功",
  "data": {
    "reading": {
      "1": {
        "name": "权杖三 (正位)",
        "baseName": "权杖三",
        "isReversed": false,
        "suit": "wands"
      },
      "2": { "...": "圣杯牌" },
      "3": { "...": "宝剑牌" },
      "4": { "...": "金币牌" },
      "5": { "...": "大阿尔卡纳" }
    },
    "spreadInfo": {
      "name": "四季牌阵",
      "positions": {
        "1": { "name": "行动力", "season": "春" },
        "2": { "name": "情感状态", "season": "夏" },
        "3": { "name": "理性思维", "season": "秋" },
        "4": { "name": "事业财务", "season": "冬" },
        "5": { "name": "灵性成长", "season": "核心" }
      }
    }
  }
}
```

#### 2. 完整AI分析

```http
POST /api/analysis/complete
Content-Type: application/json

{
  "reading": {
    "1": { "name": "权杖三 (正位)", ... },
    "2": { "name": "圣杯七 (逆位)", ... },
    ...
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "完整AI分析完成",
  "data": {
    "fullAnalysis": "基于您抽取的四季牌阵...",
    "insight": "在行动与情感间寻找平衡，智慧将指引方向",
    "seasonalAdvice": "1. 行动力建议：保持初心，稳步前进...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### 3. 配置API密钥

```http
POST /api/config/api-key
Content-Type: application/json

{
  "apiKey": "your_aihubmix_api_key"
}
```

### 完整API列表

#### 塔罗牌相关 (`/api/tarot`)
- `POST /draw` - 抽取四季牌阵
- `GET /spread-info` - 获取牌阵信息
- `GET /cards` - 获取所有牌面信息

#### AI分析相关 (`/api/analysis`)
- `POST /complete` - 完整分析（推荐）
- `POST /full` - 详细分析
- `POST /insight` - 快速洞察
- `POST /seasonal` - 季节建议
- `GET /status` - AI服务状态

#### 配置相关 (`/api/config`)
- `POST /api-key` - 设置API密钥
- `POST /validate` - 验证API密钥
- `GET /status` - 配置状态
- `GET /models` - 可用AI模型

#### 系统相关
- `GET /api/health` - 健康检查
- `GET /api` - API文档

## 项目结构

```
backend/
├── src/
│   ├── models/
│   │   └── Card.js           # 塔罗牌模型
│   ├── services/
│   │   ├── tarotService.js   # 塔罗牌业务逻辑
│   │   └── aiService.js      # AI分析服务
│   └── routes/
│       ├── tarot.js          # 塔罗牌路由
│       ├── analysis.js       # AI分析路由
│       └── config.js         # 配置路由
├── server.js                 # 主服务器文件
├── package.json             # 项目配置
└── env.example              # 环境配置模板
```

## 核心特性详解

### 1. 塔罗牌系统

完整实现78张塔罗牌：
- **大阿尔卡纳 (22张)**: 愚人、魔术师、女祭司...世界
- **小阿尔卡纳 (56张)**: 权杖、圣杯、宝剑、金币各14张

每张牌支持正位/逆位，具备完整的元数据信息。

### 2. 四季牌阵规则

```
        4 (事业财务)
1 (行动力) 5 (灵性成长) 3 (理性思维)
        2 (情感状态)
```

- **1号位 (权杖)**: 春季能量，行动力与意志
- **2号位 (圣杯)**: 夏季能量，情感与直觉
- **3号位 (宝剑)**: 秋季能量，理性与思维
- **4号位 (金币)**: 冬季能量，事业与物质
- **5号位 (大阿尔卡纳)**: 核心主题，灵性成长

### 3. AI分析系统

基于aihubmix API的多层次分析：

1. **完整分析**: 详细的牌阵解读和生活指导
2. **快速洞察**: 一句话核心洞察
3. **季节建议**: 五个层面的具体行动建议

### 4. 安全与性能

- **速率限制**: 防止API滥用
- **CORS配置**: 安全的跨域访问
- **错误处理**: 完整的异常处理机制
- **请求验证**: 数据格式验证
- **日志记录**: 完整的请求日志

## 开发工具

```bash
# 开发模式（自动重启）
npm run dev

# 代码检查
npm run lint
npm run lint:fix

# 代码格式化
npm run prettier

# 测试
npm test
npm run test:watch
npm run test:coverage

# 健康检查
npm run health-check

# 环境验证
npm run validate-env
```

## 部署指南

### Docker 部署

```bash
# 构建镜像
npm run docker:build

# 运行容器
npm run docker:run
```

### 传统部署

```bash
# 安装生产依赖
npm ci --only=production

# 设置环境变量
export NODE_ENV=production
export AIHUBMIX_API_KEY=your_key

# 启动服务
npm start
```

## 环境变量说明

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `AIHUBMIX_API_KEY` | ✅ | - | aihubmix API密钥 |
| `PORT` | ❌ | 3001 | 服务器端口 |
| `NODE_ENV` | ❌ | development | 运行环境 |
| `FRONTEND_URL` | ❌ | http://localhost:3000 | 前端URL |
| `AIHUBMIX_MODEL` | ❌ | gpt-4o-mini | AI模型 |
| `MAX_TOKENS` | ❌ | 1500 | 最大Token数 |
| `TEMPERATURE` | ❌ | 0.7 | AI创造性参数 |

## 故障排除

### 常见问题

1. **AI分析失败**
   - 检查API密钥是否正确设置
   - 验证网络连接
   - 查看服务器日志

2. **跨域错误**
   - 确认 `FRONTEND_URL` 配置正确
   - 检查CORS设置

3. **端口占用**
   - 修改 `PORT` 环境变量
   - 关闭占用端口的进程

### 日志调试

```bash
# 开启调试模式
DEBUG=true npm run dev

# 查看详细日志
NODE_ENV=development npm start
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码更改
4. 通过所有测试
5. 提交 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件

## 联系方式

- 项目维护者: Carson
- 邮箱: your-email@example.com
- 项目地址: https://github.com/your-username/四季牌阵

---

**🔮 愿智慧与洞察伴随每一次占卜 🔮**
