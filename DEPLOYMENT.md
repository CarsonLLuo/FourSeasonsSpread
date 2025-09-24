# 🚀 部署指南

## 快速部署

### 方法1: 一键部署脚本
```bash
./deploy.sh
```

### 方法2: Docker Compose
```bash
# 1. 配置环境变量
cp backend_design/env.example backend_design/.env
# 编辑.env文件设置API密钥

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f
```

### 方法3: 本地开发
```bash
# 后端
cd backend_design
npm install
npm start

# 前端
cd frontend  
npm install
npm start
```

## 访问地址

- **前端应用**: http://localhost
- **后端API**: http://localhost:3456
- **API文档**: http://localhost:3456/api

## 环境变量配置

在 `backend_design/.env` 中设置：

```env
AI_API_TYPE=aihubmix
AI_API_KEY=your_api_key_here
AI_MODEL=gpt-4o-mini
```

## 故障排除

- **端口占用**: 修改docker-compose.yml中的端口映射
- **API密钥**: 检查.env文件中的AI_API_KEY配置
- **服务状态**: `docker-compose ps` 查看容器状态
