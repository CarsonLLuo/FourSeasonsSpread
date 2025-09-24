/**
 * 配置相关路由
 * 支持多种AI API类型配置
 */

const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');
const { API_TYPES, API_CONFIGS } = AIService;
const aiService = require('../services/aiServiceInstance');

/**
 * GET /api/config/api-types
 * 获取所有可用的API类型
 */
router.get('/api-types', (req, res) => {
  try {
    const apiTypes = Object.keys(API_TYPES).map(key => ({
      type: API_TYPES[key],
      name: key,
      displayName: key.charAt(0) + key.slice(1).toLowerCase(),
      models: API_CONFIGS[API_TYPES[key]].models,
      defaultModel: API_CONFIGS[API_TYPES[key]].defaultModel
    }));

    res.json({
      success: true,
      data: {
        apiTypes,
        currentType: aiService.config.apiType
      }
    });
  } catch (error) {
    console.error('获取API类型错误:', error);
    res.status(500).json({
      success: false,
      message: '获取API类型失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务暂时不可用'
    });
  }
});

/**
 * POST /api/config/set-api
 * 设置完整的API配置
 */
router.post('/set-api', async (req, res) => {
  try {
    const { apiType, apiKey, model } = req.body;
    
    if (!apiType || !Object.values(API_TYPES).includes(apiType)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的API类型',
        availableTypes: Object.values(API_TYPES)
      });
    }

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的API密钥'
      });
    }

    // 验证模型是否支持
    const apiConfig = API_CONFIGS[apiType];
    const selectedModel = model || apiConfig.defaultModel;
    if (!apiConfig.models.includes(selectedModel)) {
      return res.status(400).json({
        success: false,
        message: '不支持的模型',
        availableModels: apiConfig.models
      });
    }

    // 设置API配置
    aiService.setApiConfig(apiType, apiKey.trim(), selectedModel);
    
    // 验证API密钥
    console.log(`验证${apiType}类型的API密钥...`);
    const validation = await aiService.validateApiKey();
    
    if (validation.valid) {
      res.json({
        success: true,
        message: `${apiType.toUpperCase()} API配置成功`,
        data: {
          isConfigured: true,
          apiType,
          model: selectedModel,
          validationMessage: validation.message
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'API密钥验证失败',
        error: validation.message
      });
    }
  } catch (error) {
    console.error('设置API配置错误:', error);
    res.status(500).json({
      success: false,
      message: 'API配置失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '配置服务暂时不可用'
    });
  }
});

/**
 * POST /api/config/api-key
 * 设置API密钥（保持向后兼容）
 */
router.post('/api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的API密钥'
      });
    }

    // 设置API密钥
    aiService.setApiKey(apiKey.trim());
    
    // 验证API密钥
    console.log('验证新设置的API密钥...');
    const validation = await aiService.validateApiKey();
    
    if (validation.valid) {
      res.json({
        success: true,
        message: 'API密钥设置并验证成功',
        data: {
          isConfigured: true,
          validationMessage: validation.message
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'API密钥验证失败',
        error: validation.message
      });
    }
  } catch (error) {
    console.error('设置API密钥错误:', error);
    res.status(500).json({
      success: false,
      message: 'API密钥设置失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '配置服务暂时不可用'
    });
  }
});

/**
 * GET /api/config/status
 * 获取配置状态
 */
router.get('/status', (req, res) => {
  try {
    const status = aiService.getConfigStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('获取配置状态错误:', error);
    res.status(500).json({
      success: false,
      message: '获取配置状态失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '配置服务暂时不可用'
    });
  }
});

/**
 * POST /api/config/validate
 * 验证当前API密钥
 */
router.post('/validate', async (req, res) => {
  try {
    console.log('验证当前API密钥...');
    const validation = await aiService.validateApiKey();
    
    res.json({
      success: validation.valid,
      message: validation.message,
      data: {
        isValid: validation.valid,
        isConfigured: aiService.isConfigured()
      }
    });
  } catch (error) {
    console.error('验证API密钥错误:', error);
    res.status(500).json({
      success: false,
      message: 'API密钥验证失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '验证服务暂时不可用'
    });
  }
});

/**
 * GET /api/config/models
 * 获取当前API类型的可用模型列表
 */
router.get('/models', (req, res) => {
  try {
    const apiType = req.query.apiType || aiService.config.apiType;
    const apiConfig = API_CONFIGS[apiType];
    
    if (!apiConfig) {
      return res.status(400).json({
        success: false,
        message: '不支持的API类型',
        availableTypes: Object.values(API_TYPES)
      });
    }

    // 为不同API类型提供模型描述
    const modelDescriptions = {
      [API_TYPES.AIHUBMIX]: {
        'gpt-4o-mini': { name: 'GPT-4o Mini', description: '快速响应，性价比高', recommended: true },
        'gpt-4o': { name: 'GPT-4o', description: '最新的GPT-4模型', recommended: false },
        'gpt-4': { name: 'GPT-4', description: '高质量分析', recommended: false },
        'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', description: '平衡性能与成本', recommended: false },
        'claude-3-5-sonnet-20241022': { name: 'Claude 3.5 Sonnet', description: '强大的Claude模型', recommended: false },
        'gemini-pro': { name: 'Gemini Pro', description: 'Google Gemini模型', recommended: false }
      },
      [API_TYPES.OPENAI]: {
        'gpt-4o-mini': { name: 'GPT-4o Mini', description: '快速响应，成本低', recommended: true },
        'gpt-4o': { name: 'GPT-4o', description: '最新的GPT-4模型', recommended: false },
        'gpt-4': { name: 'GPT-4', description: '高质量分析', recommended: false },
        'gpt-4-turbo-preview': { name: 'GPT-4 Turbo', description: '增强版GPT-4', recommended: false },
        'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', description: '平衡性能与成本', recommended: false }
      },
      [API_TYPES.CLAUDE]: {
        'claude-3-5-sonnet-20241022': { name: 'Claude 3.5 Sonnet', description: '最新的Claude模型', recommended: true },
        'claude-3-opus-20240229': { name: 'Claude 3 Opus', description: '最强性能的Claude', recommended: false },
        'claude-3-haiku-20240307': { name: 'Claude 3 Haiku', description: '快速响应的Claude', recommended: false }
      },
      [API_TYPES.GEMINI]: {
        'gemini-pro': { name: 'Gemini Pro', description: 'Google的高性能模型', recommended: true },
        'gemini-pro-vision': { name: 'Gemini Pro Vision', description: '支持图像的Gemini', recommended: false }
      },
      [API_TYPES.DEEPSEEK]: {
        'deepseek-chat': { name: 'DeepSeek Chat', description: 'DeepSeek对话模型', recommended: true },
        'deepseek-coder': { name: 'DeepSeek Coder', description: 'DeepSeek编程模型', recommended: false }
      }
    };

    const modelsWithDetails = apiConfig.models.map(modelId => ({
      id: modelId,
      name: modelDescriptions[apiType]?.[modelId]?.name || modelId,
      description: modelDescriptions[apiType]?.[modelId]?.description || '无描述',
      recommended: modelDescriptions[apiType]?.[modelId]?.recommended || false
    }));

    res.json({
      success: true,
      data: {
        apiType,
        models: modelsWithDetails,
        currentModel: aiService.config.model,
        defaultModel: apiConfig.defaultModel
      }
    });
  } catch (error) {
    console.error('获取模型列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取模型列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务暂时不可用'
    });
  }
});

/**
 * POST /api/config/model
 * 设置AI模型
 */
router.post('/model', (req, res) => {
  try {
    const { model } = req.body;
    
    const validModels = ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'];
    
    if (!model || !validModels.includes(model)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的AI模型',
        validModels
      });
    }

    // 设置环境变量（注意：这只在当前进程中有效）
    process.env.AIHUBMIX_MODEL = model;
    
    res.json({
      success: true,
      message: `AI模型已设置为 ${model}`,
      data: {
        currentModel: model
      }
    });
  } catch (error) {
    console.error('设置AI模型错误:', error);
    res.status(500).json({
      success: false,
      message: '设置AI模型失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '配置服务暂时不可用'
    });
  }
});

/**
 * GET /api/config/environment
 * 获取环境配置信息
 */
router.get('/environment', (req, res) => {
  try {
    const environmentInfo = {
      nodeVersion: process.version,
      nodeEnv: process.env.NODE_ENV || 'development',
      platform: process.platform,
      uptime: process.uptime(),
      apiBaseUrl: process.env.AIHUBMIX_API_BASE_URL || 'https://aihubmix.com/v1',
      hasApiKey: !!(process.env.AIHUBMIX_API_KEY && process.env.AIHUBMIX_API_KEY.trim()),
      currentModel: process.env.AIHUBMIX_MODEL || 'gpt-4o-mini',
      maxTokens: parseInt(process.env.MAX_TOKENS) || 1500,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.7
    };

    res.json({
      success: true,
      data: environmentInfo
    });
  } catch (error) {
    console.error('获取环境信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取环境信息失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务暂时不可用'
    });
  }
});

module.exports = router;
