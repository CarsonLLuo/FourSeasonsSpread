/**
 * API服务 - 与Node.js后端通信
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  DrawResponse, 
  AnalysisResult, 
  ConfigStatus, 
  Reading,
  ApiError,
  ApiEndpoints,
  AIModel
} from '../types';

// API配置
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3456/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 创建axios实例
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API响应: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API响应错误:', error);
    
    // 统一错误处理
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || '网络错误',
      status: error.response?.status,
      code: error.response?.data?.code || error.code,
    };
    
    return Promise.reject(apiError);
  }
);

// API端点配置
export const endpoints: ApiEndpoints = {
  baseUrl: API_CONFIG.baseURL,
  tarot: {
    draw: '/tarot/draw',
    spreadInfo: '/tarot/spread-info',
    cards: '/tarot/cards',
    validate: '/tarot/validate-reading',
  },
  analysis: {
    complete: '/analysis/complete',
    full: '/analysis/full',
    insight: '/analysis/insight',
    seasonal: '/analysis/seasonal',
    status: '/analysis/status',
  },
  config: {
    apiKey: '/config/api-key',
    status: '/config/status',
    validate: '/config/validate',
    models: '/config/models',
    model: '/config/model',
    environment: '/config/environment',
  },
  system: {
    health: '/health',
    api: '',
  },
};

/**
 * 塔罗牌相关API
 */
export class TarotAPI {
  /**
   * 抽取单张塔罗牌（日常占卜）
   */
  static async drawSingleCard(question?: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/tarot/draw-single', { question });
    
    if (!response.data.success) {
      throw new Error(response.data.message || '单张抽牌失败');
    }
    
    return response.data.data!;
  }

  /**
   * 抽取四季牌阵
   */
  static async drawCards(): Promise<DrawResponse> {
    const response = await apiClient.post<ApiResponse<DrawResponse>>(endpoints.tarot.draw);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '抽牌失败');
    }
    
    return response.data.data!;
  }

  /**
   * 获取牌阵信息
   */
  static async getSpreadInfo(): Promise<any> {
    const response = await apiClient.get<ApiResponse>(endpoints.tarot.spreadInfo);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '获取牌阵信息失败');
    }
    
    return response.data.data;
  }

  /**
   * 获取所有牌面信息
   */
  static async getAllCards(): Promise<any> {
    const response = await apiClient.get<ApiResponse>(endpoints.tarot.cards);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '获取牌面信息失败');
    }
    
    return response.data.data;
  }

  /**
   * 验证抽牌结果
   */
  static async validateReading(reading: Reading): Promise<any> {
    const response = await apiClient.post<ApiResponse>(endpoints.tarot.validate, { reading });
    
    if (!response.data.success) {
      throw new Error(response.data.message || '验证抽牌结果失败');
    }
    
    return response.data.data;
  }
}

/**
 * AI分析相关API
 */
export class AnalysisAPI {
  /**
   * 日常单张牌AI分析
   */
  static async analyzeSingleCard(card: any, question: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      '/analysis/daily-single',
      { card, question }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || '单张牌分析失败');
    }
    
    return response.data.data!;
  }

  /**
   * 完整AI分析
   */
  static async analyzeComplete(reading: Reading, userQuestion?: string): Promise<AnalysisResult> {
    const response = await apiClient.post<ApiResponse<AnalysisResult>>(
      endpoints.analysis.complete,
      { reading, userQuestion }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'AI分析失败');
    }
    
    return response.data.data!;
  }

  /**
   * 详细分析
   */
  static async analyzeFull(reading: Reading, userQuestion?: string): Promise<AnalysisResult> {
    const response = await apiClient.post<ApiResponse<AnalysisResult>>(
      endpoints.analysis.full,
      { reading, userQuestion }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || '详细分析失败');
    }
    
    return response.data.data!;
  }

  /**
   * 快速洞察
   */
  static async getInsight(reading: Reading): Promise<AnalysisResult> {
    const response = await apiClient.post<ApiResponse<AnalysisResult>>(
      endpoints.analysis.insight,
      { reading }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || '获取洞察失败');
    }
    
    return response.data.data!;
  }

  /**
   * 季节建议
   */
  static async getSeasonalAdvice(reading: Reading): Promise<AnalysisResult> {
    const response = await apiClient.post<ApiResponse<AnalysisResult>>(
      endpoints.analysis.seasonal,
      { reading }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || '获取季节建议失败');
    }
    
    return response.data.data!;
  }

  /**
   * 获取AI服务状态
   */
  static async getStatus(): Promise<any> {
    const response = await apiClient.get<ApiResponse>(endpoints.analysis.status);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '获取AI服务状态失败');
    }
    
    return response.data.data;
  }
}

/**
 * 配置相关API
 */
export class ConfigAPI {
  /**
   * 获取所有可用的API类型
   */
  static async getApiTypes(): Promise<{ apiTypes: any[]; currentType: string }> {
    const response = await apiClient.get<ApiResponse>('/config/api-types');
    
    if (!response.data.success) {
      throw new Error(response.data.message || '获取API类型失败');
    }
    
    return response.data.data;
  }

  /**
   * 设置完整的API配置
   */
  static async setApiConfig(apiType: string, apiKey: string, model?: string): Promise<any> {
    const response = await apiClient.post<ApiResponse>('/config/set-api', { 
      apiType, 
      apiKey, 
      model 
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'API配置失败');
    }
    
    return response.data.data;
  }

  /**
   * 设置API密钥（保持向后兼容）
   */
  static async setApiKey(apiKey: string): Promise<any> {
    const response = await apiClient.post<ApiResponse>(endpoints.config.apiKey, { apiKey });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'API密钥设置失败');
    }
    
    return response.data.data;
  }

  /**
   * 获取配置状态
   */
  static async getStatus(): Promise<ConfigStatus> {
    const response = await apiClient.get<ApiResponse<ConfigStatus>>(endpoints.config.status);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '获取配置状态失败');
    }
    
    return response.data.data!;
  }

  /**
   * 验证API密钥
   */
  static async validateApiKey(): Promise<any> {
    const response = await apiClient.post<ApiResponse>(endpoints.config.validate);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'API密钥验证失败');
    }
    
    return response.data.data;
  }

  /**
   * 获取可用AI模型
   */
  static async getModels(): Promise<{ models: AIModel[]; currentModel: string }> {
    const response = await apiClient.get<ApiResponse>(endpoints.config.models);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '获取AI模型失败');
    }
    
    return response.data.data;
  }

  /**
   * 设置AI模型
   */
  static async setModel(model: string): Promise<any> {
    const response = await apiClient.post<ApiResponse>(endpoints.config.model, { model });
    
    if (!response.data.success) {
      throw new Error(response.data.message || '设置AI模型失败');
    }
    
    return response.data.data;
  }

  /**
   * 获取环境信息
   */
  static async getEnvironment(): Promise<any> {
    const response = await apiClient.get<ApiResponse>(endpoints.config.environment);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '获取环境信息失败');
    }
    
    return response.data.data;
  }
}

/**
 * 系统相关API
 */
export class SystemAPI {
  /**
   * 健康检查
   */
  static async healthCheck(): Promise<any> {
    const response = await apiClient.get<ApiResponse>(endpoints.system.health);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '健康检查失败');
    }
    
    return response.data.data;
  }

  /**
   * 获取API文档
   */
  static async getApiDoc(): Promise<any> {
    const response = await apiClient.get<ApiResponse>(endpoints.system.api);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '获取API文档失败');
    }
    
    return response.data.data;
  }
}

/**
 * 统一API导出
 */
export const api = {
  tarot: TarotAPI,
  analysis: AnalysisAPI,
  config: ConfigAPI,
  system: SystemAPI,
};

/**
 * 错误处理工具
 */
export const handleApiError = (error: any): string => {
  if (error.message) {
    return error.message;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return '网络连接失败，请检查后端服务是否正常运行';
  }
  
  return '未知错误，请稍后重试';
};

/**
 * API连接测试
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await SystemAPI.healthCheck();
    return true;
  } catch (error) {
    console.error('API连接测试失败:', error);
    return false;
  }
};

export default api;
