/**
 * AI服务单例实例
 * 确保整个应用使用同一个AI服务实例
 */

const AIService = require('./aiService');

// 创建单例实例
const aiServiceInstance = new AIService();

module.exports = aiServiceInstance;
