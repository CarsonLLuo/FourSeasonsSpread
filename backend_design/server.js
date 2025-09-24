/**
 * 四季牌阵 Node.js 后端服务器
 * Express.js + AI分析服务
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// 导入路由
const tarotRoutes = require('./routes/tarot');
const analysisRoutes = require('./routes/analysis');
const configRoutes = require('./routes/config');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3456;

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS配置
const corsOptions = {
  origin: process.env.FRONTEND_URL ? 
    process.env.FRONTEND_URL.split(',').map(url => url.trim()) : [
    'http://localhost:3000', 
    'http://localhost:5173',
    'http://127.0.0.1:3457',
    'http://localhost:3457'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 请求日志
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 生产环境限制更严格
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// API路由
app.use('/api/tarot', tarotRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/config', configRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '四季牌阵后端服务运行正常',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// API文档端点
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '四季牌阵 AI 分析 API',
    data: {
      version: '1.0.0',
      description: '传统塔罗智慧与现代AI技术的完美结合',
      endpoints: {
        tarot: {
          'POST /api/tarot/draw': '抽取四季牌阵',
          'GET /api/tarot/spread-info': '获取牌阵信息',
          'GET /api/tarot/cards': '获取所有牌面信息',
          'POST /api/tarot/validate-reading': '验证抽牌结果'
        },
        analysis: {
          'POST /api/analysis/full': '完整AI分析',
          'POST /api/analysis/insight': '快速洞察',
          'POST /api/analysis/seasonal': '季节建议',
          'POST /api/analysis/complete': '完整分析（所有类型）',
          'GET /api/analysis/status': '获取AI服务状态'
        },
        config: {
          'POST /api/config/api-key': '设置API密钥',
          'GET /api/config/status': '获取配置状态',
          'POST /api/config/validate': '验证API密钥',
          'GET /api/config/models': '获取可用AI模型',
          'POST /api/config/model': '设置AI模型',
          'GET /api/config/environment': '获取环境信息'
        },
        system: {
          'GET /api/health': '健康检查',
          'GET /api': 'API文档'
        }
      }
    }
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `路径 ${req.originalUrl} 不存在`,
    availableEndpoints: [
      '/api',
      '/api/health',
      '/api/tarot/*',
      '/api/analysis/*',
      '/api/config/*'
    ]
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  
  // 不同类型的错误处理
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON解析错误',
      error: 'Invalid JSON format'
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: '请求体过大',
      error: 'Request entity too large'
    });
  }
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? error.message : '服务暂时不可用',
    timestamp: new Date().toISOString()
  });
});

// 进程错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 在生产环境中可能需要退出进程
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，开始优雅关闭...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，开始优雅关闭...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🔮 四季牌阵 AI 分析后端服务');
  console.log('='.repeat(50));
  console.log(`🚀 服务器运行在端口: ${PORT}`);
  console.log(`🌐 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API文档: http://localhost:${PORT}/api`);
  console.log(`💚 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🔮 抽牌接口: http://localhost:${PORT}/api/tarot/draw`);
  console.log(`🤖 AI分析接口: http://localhost:${PORT}/api/analysis/complete`);
  
  // 检查关键环境变量
  if (!process.env.AIHUBMIX_API_KEY) {
    console.log('⚠️  警告: 未设置 AIHUBMIX_API_KEY 环境变量');
    console.log('   AI分析功能将不可用，请在.env文件中配置');
  } else {
    console.log('✅ AI服务配置完成');
  }
  
  console.log('='.repeat(50));
});

module.exports = app;
