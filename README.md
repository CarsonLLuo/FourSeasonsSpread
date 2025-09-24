# 🔮 四季牌阵 - AI智能塔罗占卜系统

传统塔罗智慧与现代AI技术的完美结合，支持日常单张抽牌和传统四季牌阵两种占卜模式。

## ✨ 主要功能

### 🌟 日常塔罗指引 (主要功能)
- 输入问题，抽取单张塔罗牌获得指引
- 真实的Rider-Waite塔罗牌图片
- AI个性化解读和建议

### 🌸 四季牌阵占卜
- 传统5张牌季节性布局
- 涵盖行动力、情感、理性、事业、灵性五个层面
- 深度AI分析和季节建议

### 🤖 多AI服务支持
- **AIHubMix** (默认推荐) - 统一API接入多种模型
- **OpenAI** - ChatGPT系列模型
- **Claude** - Anthropic Claude系列
- **Gemini** - Google AI模型
- **Deepseek** - 中文优化AI模型

## 🚀 快速开始

### Docker 部署 (推荐)

1. **克隆项目**
```bash
git clone <repository-url>
cd 四季牌阵
```

2. **配置环境变量**
```bash
cp backend_design/env.example .env
# 编辑.env文件，设置您的API密钥
```

3. **启动服务**
```bash
docker-compose up -d
```

4. **访问应用**
- 前端: http://localhost
- 后端API: http://localhost:3456

### 本地开发

**后端启动:**
```bash
cd backend_design
npm install
npm start
```

**前端启动:**
```bash
cd frontend
npm install
npm start
```

## 🔧 配置说明

### API密钥配置
在应用界面右侧配置面板中：
1. 选择AI服务提供商
2. 输入对应的API密钥
3. 输入或选择AI模型
4. 保存配置

### 支持的AI模型
- **AIHubMix**: gpt-4o-mini, gpt-4o, claude-3-5-sonnet-20241022, gemini-pro
- **OpenAI**: gpt-4o-mini, gpt-4o, gpt-4, gpt-3.5-turbo
- **Claude**: claude-3-5-sonnet-20241022, claude-3-opus-20240229
- **Gemini**: gemini-pro, gemini-pro-vision
- **Deepseek**: deepseek-chat, deepseek-coder

## 📁 项目结构

```
四季牌阵/
├── frontend/           # React前端应用
│   ├── src/
│   │   ├── components/ # React组件
│   │   ├── services/   # API服务和工具
│   │   ├── store/      # Redux状态管理
│   │   └── types/      # TypeScript类型定义
│   └── Dockerfile
├── backend_design/     # Node.js后端API
│   ├── routes/         # API路由
│   ├── services/       # 业务逻辑服务
│   ├── models/         # 数据模型
│   └── Dockerfile
├── Streamlit-Version/  # Streamlit版本(已弃用)
└── docker-compose.yml  # Docker编排配置
```

## 🛠️ 技术栈

**前端:**
- React 18 + TypeScript
- Material-UI (MUI)
- Redux Toolkit
- Framer Motion
- React Markdown

**后端:**
- Node.js + Express
- AI服务集成 (多API支持)
- CORS + 安全中间件

**部署:**
- Docker + Docker Compose
- Nginx (生产环境)

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为这个项目贡献的开发者和使用传统塔罗智慧的占卜师们。
