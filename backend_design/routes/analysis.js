/**
 * AI分析相关路由
 */

const express = require('express');
const router = express.Router();
const aiService = require('../services/aiServiceInstance');

/**
 * POST /api/analysis/daily-single
 * 日常单张牌AI分析
 */
router.post('/daily-single', async (req, res) => {
  try {
    const { card, question } = req.body;
    
    if (!card) {
      return res.status(400).json({
        success: false,
        message: '缺少塔罗牌数据'
      });
    }

    if (!question) {
      return res.status(400).json({
        success: false,
        message: '缺少用户问题'
      });
    }

    if (!aiService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'AI分析服务未配置，请设置API密钥'
      });
    }

    console.log('开始日常单张牌AI分析...');
    console.log('用户问题:', question);
    console.log('抽取的牌:', card.name);
    
    const analysisResult = await aiService.analyzeSingleCard(card, question);
    
    res.json({
      success: analysisResult.status === 'success',
      message: analysisResult.status === 'success' ? '单张牌分析完成' : '单张牌分析失败',
      data: {
        interpretation: analysisResult.interpretation,
        guidance: analysisResult.guidance,
        keyMessage: analysisResult.keyMessage,
        timestamp: new Date().toISOString(),
        analysisType: 'daily-single'
      }
    });
  } catch (error) {
    console.error('日常单张牌AI分析错误:', error);
    res.status(500).json({
      success: false,
      message: 'AI分析服务错误',
      error: process.env.NODE_ENV === 'development' ? error.message : 'AI分析服务暂时不可用'
    });
  }
});

/**
 * POST /api/analysis/full
 * 完整AI分析
 */
router.post('/full', async (req, res) => {
  try {
    const { reading, userQuestion } = req.body;
    
    if (!reading) {
      return res.status(400).json({
        success: false,
        message: '缺少抽牌结果数据'
      });
    }

    if (!aiService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'AI分析服务未配置，请设置API密钥'
      });
    }

    console.log('开始AI完整分析...');
    
    const analysisResult = await aiService.analyzeReading(reading, userQuestion);
    
    res.json({
      success: analysisResult.status === 'success',
      message: analysisResult.status === 'success' ? 'AI分析完成' : 'AI分析失败',
      data: {
        fullAnalysis: analysisResult.fullAnalysis,
        cardsSummary: analysisResult.cardsSummary,
        timestamp: new Date().toISOString(),
        analysisType: 'full'
      }
    });
  } catch (error) {
    console.error('AI完整分析错误:', error);
    res.status(500).json({
      success: false,
      message: 'AI分析服务错误',
      error: process.env.NODE_ENV === 'development' ? error.message : 'AI分析服务暂时不可用'
    });
  }
});

/**
 * POST /api/analysis/insight
 * 快速洞察分析
 */
router.post('/insight', async (req, res) => {
  try {
    const { reading } = req.body;
    
    if (!reading) {
      return res.status(400).json({
        success: false,
        message: '缺少抽牌结果数据'
      });
    }

    if (!aiService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'AI分析服务未配置，请设置API密钥'
      });
    }

    console.log('开始AI快速洞察分析...');
    
    const insight = await aiService.getQuickInsight(reading);
    
    res.json({
      success: true,
      message: '快速洞察完成',
      data: {
        insight,
        timestamp: new Date().toISOString(),
        analysisType: 'insight'
      }
    });
  } catch (error) {
    console.error('AI快速洞察错误:', error);
    res.status(500).json({
      success: false,
      message: 'AI洞察服务错误',
      error: process.env.NODE_ENV === 'development' ? error.message : 'AI洞察服务暂时不可用'
    });
  }
});

/**
 * POST /api/analysis/seasonal
 * 季节性建议分析
 */
router.post('/seasonal', async (req, res) => {
  try {
    const { reading } = req.body;
    
    if (!reading) {
      return res.status(400).json({
        success: false,
        message: '缺少抽牌结果数据'
      });
    }

    if (!aiService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'AI分析服务未配置，请设置API密钥'
      });
    }

    console.log('开始AI季节性建议分析...');
    
    const adviceResult = await aiService.getSeasonalAdvice(reading);
    
    res.json({
      success: adviceResult.status === 'success',
      message: adviceResult.status === 'success' ? '季节建议分析完成' : '季节建议分析失败',
      data: {
        seasonalAdvice: adviceResult.seasonalAdvice,
        timestamp: new Date().toISOString(),
        analysisType: 'seasonal'
      }
    });
  } catch (error) {
    console.error('AI季节建议错误:', error);
    res.status(500).json({
      success: false,
      message: 'AI季节建议服务错误',
      error: process.env.NODE_ENV === 'development' ? error.message : 'AI建议服务暂时不可用'
    });
  }
});

/**
 * POST /api/analysis/complete
 * 完整分析（包含所有三种分析类型）
 */
router.post('/complete', async (req, res) => {
  try {
    const { reading, userQuestion } = req.body;
    
    if (!reading) {
      return res.status(400).json({
        success: false,
        message: '缺少抽牌结果数据'
      });
    }

    if (!aiService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'AI分析服务未配置，请设置API密钥'
      });
    }

    console.log('开始完整AI分析（包含所有分析类型）...');
    
    // 并行执行三种分析
    const [analysisResult, insight, adviceResult] = await Promise.all([
      aiService.analyzeReading(reading, userQuestion),
      aiService.getQuickInsight(reading),
      aiService.getSeasonalAdvice(reading)
    ]);
    
    res.json({
      success: true,
      message: '完整AI分析完成',
      data: {
        fullAnalysis: analysisResult.fullAnalysis,
        cardsSummary: analysisResult.cardsSummary,
        insight,
        seasonalAdvice: adviceResult.seasonalAdvice,
        timestamp: new Date().toISOString(),
        analysisType: 'complete',
        analysisStatus: {
          fullAnalysis: analysisResult.status,
          seasonalAdvice: adviceResult.status
        }
      }
    });
  } catch (error) {
    console.error('完整AI分析错误:', error);
    res.status(500).json({
      success: false,
      message: '完整AI分析服务错误',
      error: process.env.NODE_ENV === 'development' ? error.message : 'AI分析服务暂时不可用'
    });
  }
});

/**
 * GET /api/analysis/status
 * 获取AI分析服务状态
 */
router.get('/status', (req, res) => {
  try {
    const status = aiService.getConfigStatus();
    
    res.json({
      success: true,
      data: {
        ...status,
        serviceAvailable: aiService.isConfigured()
      }
    });
  } catch (error) {
    console.error('获取AI服务状态错误:', error);
    res.status(500).json({
      success: false,
      message: '获取服务状态失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务状态查询暂时不可用'
    });
  }
});

module.exports = router;
