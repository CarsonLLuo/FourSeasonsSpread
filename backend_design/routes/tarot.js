/**
 * 塔罗牌相关路由
 */

const express = require('express');
const router = express.Router();
const TarotService = require('../services/tarotService');

/**
 * POST /api/tarot/draw-single
 * 日常单张塔罗抽牌
 */
router.post('/draw-single', async (req, res) => {
  try {
    const { question } = req.body;
    
    console.log('开始抽取单张塔罗牌...');
    console.log('用户问题:', question);
    
    const result = TarotService.drawSingleCard();
    
    if (result.success) {
      const cardWithImage = {
        ...result.card,
        imageUrl: result.card.imageUrl,
        imageUrlReversed: result.card.imageUrlReversed
      };
      
      res.json({
        success: true,
        message: '单张塔罗牌抽取成功',
        data: {
          card: cardWithImage,
          question: question || '',
          timestamp: result.timestamp,
          drawTime: result.timestamp
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: '抽牌失败',
        error: result.error
      });
    }
  } catch (error) {
    console.error('单张抽牌过程中出现错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : '抽牌服务暂时不可用'
    });
  }
});

/**
 * POST /api/tarot/draw
 * 抽取四季牌阵
 */
router.post('/draw', async (req, res) => {
  try {
    console.log('开始抽取四季牌阵...');
    
    const result = TarotService.shuffleAndDraw();
    
    if (result.success) {
      const validation = TarotService.validateReading(result.reading);
      
      if (!validation.isValid) {
        return res.status(500).json({
          success: false,
          message: '抽牌结果验证失败',
          errors: validation.errors
        });
      }

      const formattedResult = TarotService.formatReadingForResponse(result.reading);
      
      res.json({
        success: true,
        message: '四季牌阵抽取成功',
        data: {
          ...formattedResult,
          drawTime: result.timestamp
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: '抽牌失败',
        error: result.error
      });
    }
  } catch (error) {
    console.error('抽牌过程中出现错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : '抽牌服务暂时不可用'
    });
  }
});

/**
 * GET /api/tarot/spread-info
 * 获取四季牌阵信息
 */
router.get('/spread-info', (req, res) => {
  try {
    const spreadInfo = TarotService.getSpreadInfo();
    
    res.json({
      success: true,
      data: spreadInfo
    });
  } catch (error) {
    console.error('获取牌阵信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取牌阵信息失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务暂时不可用'
    });
  }
});

/**
 * GET /api/tarot/cards
 * 获取所有塔罗牌信息（用于参考）
 */
router.get('/cards', (req, res) => {
  try {
    const { MajorArcana, MinorArcana } = require('../models/Card');
    
    res.json({
      success: true,
      data: {
        majorArcana: Object.values(MajorArcana),
        minorArcana: {
          wands: Object.values(MinorArcana).filter(card => card.suit === 'wands'),
          cups: Object.values(MinorArcana).filter(card => card.suit === 'cups'),
          swords: Object.values(MinorArcana).filter(card => card.suit === 'swords'),
          pentacles: Object.values(MinorArcana).filter(card => card.suit === 'pentacles')
        },
        totalCards: {
          major: Object.keys(MajorArcana).length,
          minor: Object.keys(MinorArcana).length,
          total: Object.keys(MajorArcana).length + Object.keys(MinorArcana).length
        }
      }
    });
  } catch (error) {
    console.error('获取牌面信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取牌面信息失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务暂时不可用'
    });
  }
});

/**
 * POST /api/tarot/validate-reading
 * 验证抽牌结果格式
 */
router.post('/validate-reading', (req, res) => {
  try {
    const { reading } = req.body;
    
    if (!reading) {
      return res.status(400).json({
        success: false,
        message: '缺少抽牌结果数据'
      });
    }

    const validation = TarotService.validateReading(reading);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('验证抽牌结果错误:', error);
    res.status(500).json({
      success: false,
      message: '验证过程失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '验证服务暂时不可用'
    });
  }
});

module.exports = router;
