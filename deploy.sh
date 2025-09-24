#!/bin/bash
# 四季牌阵一键部署脚本

echo "🔮 四季牌阵 - 一键部署脚本"
echo "============================="

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查环境变量文件
if [ ! -f "./backend_design/.env" ]; then
    echo "⚠️  未找到环境配置文件"
    echo "📋 正在创建.env配置文件..."
    cp ./backend_design/env.example ./backend_design/.env
    echo "✅ 已创建 backend_design/.env 文件"
    echo "🔑 请编辑该文件并设置您的API密钥"
    echo ""
    echo "📖 支持的AI服务类型："
    echo "   - aihubmix (推荐)"
    echo "   - openai"
    echo "   - claude"
    echo "   - gemini"
    echo "   - deepseek"
    echo ""
    read -p "是否现在编辑配置文件？(y/n): " edit_config
    if [ "$edit_config" = "y" ]; then
        ${EDITOR:-nano} ./backend_design/.env
    fi
fi

echo "🚀 开始构建和启动服务..."

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 构建并启动服务
echo "🔧 构建镜像..."
docker-compose build

echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
if curl -f http://localhost:3456/api/health > /dev/null 2>&1; then
    echo "✅ 后端服务运行正常"
else
    echo "❌ 后端服务启动失败"
fi

if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ 前端服务运行正常"
else
    echo "❌ 前端服务启动失败"
fi

echo ""
echo "🎉 部署完成！"
echo "🌐 前端访问地址: http://localhost"
echo "🔧 后端API地址: http://localhost:3456"
echo "📊 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"
