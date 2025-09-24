/**
 * AI分析服务
 * 支持多种AI API提供商：Gemini、Deepseek、OpenAI、Claude
 * 统一的接口处理不同的API
 */

const axios = require('axios');
const { Card } = require('../models/Card');

// API类型枚举
const API_TYPES = {
  AIHUBMIX: 'aihubmix',
  GEMINI: 'gemini',
  DEEPSEEK: 'deepseek',
  OPENAI: 'openai',
  CLAUDE: 'claude'
};

// API配置模板
const API_CONFIGS = {
  [API_TYPES.AIHUBMIX]: {
    baseUrl: 'https://aihubmix.com/v1',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4', 'gpt-3.5-turbo', 'claude-3-5-sonnet-20241022', 'gemini-pro'],
    defaultModel: 'gpt-4o-mini',
    authHeader: 'Authorization'
  },
  [API_TYPES.GEMINI]: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-pro', 'gemini-pro-vision'],
    defaultModel: 'gemini-pro',
    authHeader: 'x-goog-api-key'
  },
  [API_TYPES.DEEPSEEK]: {
    baseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder'],
    defaultModel: 'deepseek-chat',
    authHeader: 'Authorization'
  },
  [API_TYPES.OPENAI]: {
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview', 'gpt-4o', 'gpt-4o-mini'],
    defaultModel: 'gpt-4o-mini',
    authHeader: 'Authorization'
  },
  [API_TYPES.CLAUDE]: {
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    defaultModel: 'claude-3-5-sonnet-20241022',
    authHeader: 'x-api-key'
  }
};

class AIService {
  constructor() {
    this.config = {
      apiType: process.env.AI_API_TYPE || API_TYPES.AIHUBMIX,
      apiKey: process.env.AI_API_KEY,
      model: process.env.AI_MODEL,
      maxTokens: parseInt(process.env.MAX_TOKENS) || 1500,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
      timeout: parseInt(process.env.API_TIMEOUT) || 30000
    };
    
    // 验证状态
    this.validationStatus = {
      isValidated: false,
      lastValidationTime: null,
      validationError: null
    };
    
    // 设置默认模型（如果未指定）
    if (!this.config.model) {
      this.config.model = API_CONFIGS[this.config.apiType]?.defaultModel || 'gpt-4o-mini';
    }
  }

  /**
   * 检查API配置是否完整并已验证
   * @returns {boolean} 配置是否有效且已验证
   */
  isConfigured() {
    const hasRequiredConfig = !!(this.config.apiKey && this.config.apiKey.trim() && this.config.apiType);
    
    // 在开发环境下，如果有配置就认为已配置（跳过严格验证）
    if (process.env.NODE_ENV === 'development') {
      return hasRequiredConfig;
    }
    
    // 生产环境需要验证成功
    return hasRequiredConfig && this.validationStatus.isValidated;
  }

  /**
   * 检查是否有基本配置（不考虑验证状态）
   * @returns {boolean} 是否有基本配置
   */
  hasBasicConfig() {
    return !!(this.config.apiKey && this.config.apiKey.trim() && this.config.apiType);
  }

  /**
   * 获取当前API配置信息
   * @returns {Object} API配置对象
   */
  getCurrentApiConfig() {
    return API_CONFIGS[this.config.apiType];
  }

  /**
   * 获取API请求头
   * @returns {Object} 请求头对象
   */
  getApiHeaders() {
    if (!this.isConfigured()) {
      throw new Error(`API密钥未设置，请先配置${this.config.apiType} API密钥`);
    }

    const apiConfig = this.getCurrentApiConfig();
    const headers = {
      'Content-Type': 'application/json'
    };

    // 根据API类型设置认证头
    switch (this.config.apiType) {
      case API_TYPES.GEMINI:
        headers[apiConfig.authHeader] = this.config.apiKey;
        break;
      case API_TYPES.AIHUBMIX:
      case API_TYPES.DEEPSEEK:
      case API_TYPES.OPENAI:
        headers[apiConfig.authHeader] = `Bearer ${this.config.apiKey}`;
        break;
      case API_TYPES.CLAUDE:
        headers[apiConfig.authHeader] = this.config.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      default:
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  /**
   * 设置API配置
   * @param {string} apiType API类型
   * @param {string} apiKey API密钥
   * @param {string} model 模型名称（可选）
   */
  setApiConfig(apiType, apiKey, model = null) {
    if (!API_CONFIGS[apiType]) {
      throw new Error(`不支持的API类型: ${apiType}`);
    }
    
    this.config.apiType = apiType;
    this.config.apiKey = apiKey;
    this.config.model = model || API_CONFIGS[apiType].defaultModel;
    
    // 重置验证状态
    this.validationStatus = {
      isValidated: false,
      lastValidationTime: null,
      validationError: null
    };
  }

  /**
   * 获取可用的API类型和模型
   * @returns {Object} API类型和模型信息
   */
  static getAvailableApis() {
    const apis = {};
    Object.keys(API_CONFIGS).forEach(apiType => {
      apis[apiType] = {
        name: apiType.toUpperCase(),
        models: API_CONFIGS[apiType].models,
        defaultModel: API_CONFIGS[apiType].defaultModel
      };
    });
    return apis;
  }

  /**
   * 获取系统提示词，定义AI的角色和任务
   * @returns {string} 系统提示词
   */
  getSystemPrompt() {
    return `你是一位经验丰富的塔罗牌占卜师和心灵导师，专精于四季牌阵的解读。

你的专业特长包括：
1. 深度理解塔罗牌的象征意义和灵性内涵
2. 精通四季牌阵的布局和各位置的含义
3. 能够将牌面含义与现实生活情况相结合
4. 提供富有洞察力和启发性的指导建议
5. 用温暖、智慧的语言与咨询者沟通

四季牌阵说明：
- 1号位置（权杖牌组）：行动力 - 关于意志、创造与行动层面
- 2号位置（圣杯牌组）：情感状态 - 关于情绪、感觉与感性层面  
- 3号位置（宝剑牌组）：理性思维 - 关于理性、思维与关系层面
- 4号位置（金币牌组）：事业财务 - 关于感官、现实与物质层面
- 5号位置（大阿尔卡纳）：心灵成长 - 关于灵魂课题和精神成长

请用专业、温暖、富有洞察力的语言进行解读，避免过于绝对化的预言，而是提供启发性的指导。`;
  }

  /**
   * 向AI API发送请求
   * @param {string} prompt 发送给AI的提示词
   * @param {number} maxTokens 最大token数量（可选）
   * @returns {Promise<string|null>} AI的回复内容，失败时返回null
   */
  async makeApiRequest(prompt, maxTokens = null) {
    if (!this.isConfigured()) {
      throw new Error(`API密钥未配置，请先设置${this.config.apiType} API密钥`);
    }

    try {
      const apiConfig = this.getCurrentApiConfig();
      const requestData = this.buildRequestData(prompt, maxTokens);
      const endpoint = this.getApiEndpoint();

      const response = await axios.post(
        `${apiConfig.baseUrl}${endpoint}`,
        requestData,
        {
          headers: this.getApiHeaders(),
          timeout: this.config.timeout
        }
      );

      return this.parseApiResponse(response);
    } catch (error) {
      this.handleApiError(error);
      return null;
    }
  }

  /**
   * 构建请求数据
   * @param {string} prompt 用户提示词
   * @param {number} maxTokens 最大token数
   * @returns {Object} 请求数据对象
   */
  buildRequestData(prompt, maxTokens = null) {
    const systemPrompt = this.getSystemPrompt();
    const tokens = maxTokens || this.config.maxTokens;

    switch (this.config.apiType) {
      case API_TYPES.GEMINI:
        return {
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${prompt}`
            }]
          }],
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: tokens
          }
        };

      case API_TYPES.CLAUDE:
        return {
          model: this.config.model,
          max_tokens: tokens,
          temperature: this.config.temperature,
          system: systemPrompt,
          messages: [
            { role: 'user', content: prompt }
          ]
        };

      case API_TYPES.AIHUBMIX:
      case API_TYPES.DEEPSEEK:
      case API_TYPES.OPENAI:
      default:
        return {
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: tokens,
          temperature: this.config.temperature
        };
    }
  }

  /**
   * 获取API端点
   * @returns {string} API端点路径
   */
  getApiEndpoint() {
    switch (this.config.apiType) {
      case API_TYPES.GEMINI:
        return `/models/${this.config.model}:generateContent`;
      case API_TYPES.CLAUDE:
        return '/messages';
      case API_TYPES.AIHUBMIX:
      case API_TYPES.DEEPSEEK:
      case API_TYPES.OPENAI:
      default:
        return '/chat/completions';
    }
  }

  /**
   * 解析API响应
   * @param {Object} response axios响应对象
   * @returns {string|null} 解析的文本内容
   */
  parseApiResponse(response) {
    if (response.status !== 200) {
      console.error(`API请求失败: ${response.status} - ${JSON.stringify(response.data)}`);
      return null;
    }

    try {
      switch (this.config.apiType) {
        case API_TYPES.GEMINI:
          return response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        case API_TYPES.CLAUDE:
          return response.data.content?.[0]?.text || '';

        case API_TYPES.AIHUBMIX:
        case API_TYPES.DEEPSEEK:
        case API_TYPES.OPENAI:
        default:
          return response.data.choices?.[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('解析API响应失败:', error);
      return null;
    }
  }

  /**
   * 处理API错误
   * @param {Error} error 错误对象
   */
  handleApiError(error) {
    if (error.code === 'ECONNABORTED') {
      console.error('API请求超时');
    } else if (error.response) {
      console.error(`API请求失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('API请求网络错误:', error.message);
    } else {
      console.error('未知错误:', error.message);
    }
  }

  /**
   * 将抽牌结果格式化为适合AI分析的文本
   * @param {Object} reading 抽牌结果字典
   * @returns {string} 格式化后的卡牌信息文本
   */
  formatCardsForPrompt(reading) {
    const positionNames = {
      1: "1号位置（权杖牌组-行动力）",
      2: "2号位置（圣杯牌组-情感状态）",
      3: "3号位置（宝剑牌组-理性思维）",
      4: "4号位置（金币牌组-事业财务）",
      5: "5号位置（大阿尔卡纳-心灵成长）"
    };

    const cardInfo = [];
    
    // 按重要性排序：核心位置(5)优先，然后按季节顺序
    for (const position of [5, 1, 2, 3, 4]) {
      const card = reading[position];
      if (card) {
        const cardName = typeof card.name === 'string' ? card.name : card.baseName;
        cardInfo.push(`${positionNames[position]}：${cardName}`);
      }
    }

    return cardInfo.join('\n');
  }

  /**
   * 分析四季牌阵并生成详细解读
   * @param {Object} reading 抽牌结果字典
   * @param {string} userQuestion 用户的具体问题（已弃用，保留参数兼容性）
   * @returns {Promise<Object>} 包含各种分析结果的对象
   */
  async analyzeReading(reading, userQuestion = null) {
    const cardsText = this.formatCardsForPrompt(reading);

    const prompt = `请对以下四季牌阵进行深度分析：

${cardsText}

请从以下几个方面分析接下来季节的能量流动：

1. 整体概述：这个牌阵传达的核心信息和季节主题
2. 逐位解读：每个位置的牌面含义及其对应生活层面的能量指导
3. 牌面关联：不同位置之间的相互关系和能量流动模式
4. 实用建议：基于牌阵给出的具体行动建议和注意事项
5. 灵性指引：这个季度的精神成长方向和内在智慧

请用专业而温暖的语言，为咨询者提供富有启发性的季节性指导。`;

    try {
      const analysis = await this.makeApiRequest(prompt);
      
      if (analysis) {
        return {
          fullAnalysis: analysis,
          cardsSummary: cardsText,
          status: 'success'
        };
      } else {
        return {
          fullAnalysis: '抱歉，AI分析服务暂时不可用。请检查网络连接和API配置。',
          cardsSummary: cardsText,
          status: 'error'
        };
      }
    } catch (error) {
      return {
        fullAnalysis: `分析过程中出现错误：${error.message}`,
        cardsSummary: cardsText,
        status: 'error'
      };
    }
  }

  /**
   * 获取快速洞察，简短的一句话总结
   * @param {Object} reading 抽牌结果字典
   * @returns {Promise<string>} 简短的洞察文本
   */
  async getQuickInsight(reading) {
    const cardsText = this.formatCardsForPrompt(reading);

    const prompt = `基于以下四季牌阵结果，请给出一句话的核心洞察：

${cardsText}

请用一句富有诗意和启发性的话语来概括这个牌阵的核心信息。`;

    try {
      const insight = await this.makeApiRequest(prompt, 100);
      return insight || '静心聆听内在的声音，答案会在适当的时候显现。';
    } catch (error) {
      console.error('获取快速洞察失败:', error);
      return '静心聆听内在的声音，答案会在适当的时候显现。';
    }
  }

  /**
   * 获取季节性建议，针对每个生活层面的具体指导
   * @param {Object} reading 抽牌结果字典
   * @returns {Promise<Object>} 包含各个层面建议的对象
   */
  async getSeasonalAdvice(reading) {
    const cardsText = this.formatCardsForPrompt(reading);

    const prompt = `基于以下四季牌阵，请为每个生活层面提供简洁的季节性建议：

${cardsText}

请分别为以下五个方面给出1-2句具体的行动建议：
1. 行动力建议
2. 情感状态建议  
3. 理性思维建议
4. 事业财务建议
5. 心灵成长建议

格式要求：每个建议控制在50字以内，语言温暖而具有指导性。`;

    try {
      const advice = await this.makeApiRequest(prompt, 800);
      
      if (advice) {
        return {
          seasonalAdvice: advice,
          status: 'success'
        };
      } else {
        return {
          seasonalAdvice: '在这个特殊的时刻，相信自己的直觉，跟随内心的指引前行。',
          status: 'error'
        };
      }
    } catch (error) {
      console.error('获取季节建议失败:', error);
      return {
        seasonalAdvice: '在这个特殊的时刻，相信自己的直觉，跟随内心的指引前行。',
        status: 'error'
      };
    }
  }

  /**
   * 设置API密钥
   * @param {string} apiKey 新的API密钥
   */
  setApiKey(apiKey) {
    this.config.apiKey = apiKey;
    
    // 重置验证状态
    this.validationStatus = {
      isValidated: false,
      lastValidationTime: null,
      validationError: null
    };
  }

  /**
   * 获取配置状态
   * @returns {Object} 配置状态信息
   */
  getConfigStatus() {
    const apiConfig = this.getCurrentApiConfig();
    return {
      isConfigured: this.isConfigured(),
      apiType: this.config.apiType,
      apiTypeName: this.config.apiType.toUpperCase(),
      apiBaseUrl: apiConfig?.baseUrl || '',
      currentModel: this.config.model,
      availableModels: apiConfig?.models || [],
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      hasApiKey: !!(this.config.apiKey && this.config.apiKey.trim())
    };
  }

  /**
   * 分析单张塔罗牌（日常抽牌使用）
   * @param {Object} card 塔罗牌对象
   * @param {string} question 用户的问题
   * @returns {Promise<Object>} 包含分析结果的对象
   */
  async analyzeSingleCard(card, question) {
    const cardName = card.name || card.baseName;
    const cardType = card.isMajorArcana ? '大阿尔卡纳' : '小阿尔卡纳';
    const orientation = card.isReversed ? '逆位' : '正位';

    const prompt = `作为专业的塔罗牌占卜师，请分析以下日常抽牌结果：

问题：${question}
抽取的牌：${cardName} (${orientation})
牌面类型：${cardType}

请从以下三个方面进行深度解读：

1. 【牌面解读】：
   - 这张牌的核心象征意义
   - ${orientation}状态下的特殊含义
   - 与用户问题的直接关联

2. 【实用指导】：
   - 针对用户问题的具体建议
   - 今日或近期的行动指引
   - 需要注意的事项或挑战

3. 【核心信息】：
   - 一句话总结这张牌想传达的关键信息
   - 用简洁而富有启发性的语言表达

请用温暖、专业的语言，避免过于绝对化的预测，而是提供启发性的指导。回答控制在400字左右。`;

    try {
      const analysis = await this.makeApiRequest(prompt, 600);
      
      if (analysis) {
        // 尝试解析回答的不同部分
        const parts = this.parseSingleCardAnalysis(analysis);
        
        return {
          interpretation: parts.interpretation || analysis,
          guidance: parts.guidance || '',
          keyMessage: parts.keyMessage || '',
          fullText: analysis,
          status: 'success'
        };
      } else {
        return {
          interpretation: '抱歉，AI分析服务暂时不可用。请检查网络连接和API配置。',
          guidance: '请静心默念您的问题，相信内在的智慧会给您指引。',
          keyMessage: '答案在您心中，相信自己的直觉。',
          status: 'error'
        };
      }
    } catch (error) {
      console.error('单张牌分析失败:', error);
      return {
        interpretation: `分析过程中出现错误：${error.message}`,
        guidance: '请稍后再试，或者静心思考您抽到的这张牌对您的意义。',
        keyMessage: '每张牌都蕴含着智慧，相信您能找到答案。',
        status: 'error'
      };
    }
  }

  /**
   * 解析单张牌分析结果的不同部分
   * @param {string} analysis 完整的分析文本
   * @returns {Object} 解析后的各部分内容
   */
  parseSingleCardAnalysis(analysis) {
    const result = {
      interpretation: '',
      guidance: '',
      keyMessage: ''
    };

    try {
      // 尝试根据标记分割内容
      const interpretationMatch = analysis.match(/【牌面解读】[：:]\s*([\s\S]*?)(?=【|$)/);
      const guidanceMatch = analysis.match(/【实用指导】[：:]\s*([\s\S]*?)(?=【|$)/);
      const keyMessageMatch = analysis.match(/【核心信息】[：:]\s*([\s\S]*?)(?=【|$)/);

      if (interpretationMatch) {
        result.interpretation = interpretationMatch[1].trim();
      }
      if (guidanceMatch) {
        result.guidance = guidanceMatch[1].trim();
      }
      if (keyMessageMatch) {
        result.keyMessage = keyMessageMatch[1].trim();
      }

      // 如果解析失败，返回原文本
      if (!result.interpretation && !result.guidance && !result.keyMessage) {
        result.interpretation = analysis;
      }
    } catch (error) {
      console.error('解析单张牌分析失败:', error);
      result.interpretation = analysis;
    }

    return result;
  }

  /**
   * 验证API密钥是否有效
   * @returns {Promise<Object>} 验证结果
   */
  async validateApiKey() {
    if (!this.hasBasicConfig()) {
      this.validationStatus = {
        isValidated: false,
        lastValidationTime: new Date(),
        validationError: 'API密钥未设置'
      };
      
      return {
        valid: false,
        message: 'API密钥未设置'
      };
    }

    try {
      const testPrompt = '请回复"测试成功"';
      const response = await this.makeApiRequest(testPrompt, 10);
      
      const isValid = !!response;
      
      // 更新验证状态
      this.validationStatus = {
        isValidated: isValid,
        lastValidationTime: new Date(),
        validationError: isValid ? null : 'API请求失败'
      };
      
      return {
        valid: isValid,
        message: isValid ? 'API密钥验证成功' : 'API密钥验证失败'
      };
    } catch (error) {
      this.validationStatus = {
        isValidated: false,
        lastValidationTime: new Date(),
        validationError: error.message
      };
      
      return {
        valid: false,
        message: `API密钥验证失败: ${error.message}`
      };
    }
  }
}

module.exports = AIService;
module.exports.API_TYPES = API_TYPES;
module.exports.API_CONFIGS = API_CONFIGS;
