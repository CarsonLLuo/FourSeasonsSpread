/**
 * 配置状态管理切片
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ConfigState, ConfigStatus } from '../../types';
import { api } from '../../services/api';

// 初始状态
const initialState: ConfigState = {
  apiKey: null,
  model: 'gpt-4o-mini',
  isConfigured: false,
  status: null,
  error: null,
};

// 异步操作：设置API密钥
export const setApiKey = createAsyncThunk(
  'config/setApiKey',
  async (apiKey: string, { rejectWithValue }) => {
    try {
      const result = await api.config.setApiKey(apiKey);
      return { apiKey, result };
    } catch (error: any) {
      return rejectWithValue(error.message || 'API密钥设置失败');
    }
  }
);

// 异步操作：获取配置状态
export const getConfigStatus = createAsyncThunk(
  'config/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const status = await api.config.getStatus();
      return status;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取配置状态失败');
    }
  }
);

// 异步操作：验证API密钥
export const validateApiKey = createAsyncThunk(
  'config/validateApiKey',
  async (_, { rejectWithValue }) => {
    try {
      const result = await api.config.validateApiKey();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'API密钥验证失败');
    }
  }
);

// 异步操作：获取可用AI模型
export const getAvailableModels = createAsyncThunk(
  'config/getModels',
  async (_, { rejectWithValue }) => {
    try {
      const result = await api.config.getModels();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取AI模型失败');
    }
  }
);

// 异步操作：设置AI模型
export const setAIModel = createAsyncThunk(
  'config/setModel',
  async (model: string, { rejectWithValue }) => {
    try {
      const result = await api.config.setModel(model);
      return { model, result };
    } catch (error: any) {
      return rejectWithValue(error.message || '设置AI模型失败');
    }
  }
);

// 创建切片
const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    // 重置配置
    resetConfig: (state) => {
      state.apiKey = null;
      state.model = 'gpt-4o-mini';
      state.isConfigured = false;
      state.status = null;
      state.error = null;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 本地设置API密钥（不发送请求）
    setLocalApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
    },
    
    // 本地设置模型
    setLocalModel: (state, action: PayloadAction<string>) => {
      state.model = action.payload;
    },
    
    // 设置配置状态
    setConfigured: (state, action: PayloadAction<boolean>) => {
      state.isConfigured = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 设置API密钥
    builder
      .addCase(setApiKey.pending, (state) => {
        state.error = null;
      })
      .addCase(setApiKey.fulfilled, (state, action) => {
        state.apiKey = action.payload.apiKey;
        state.isConfigured = true;
        state.error = null;
      })
      .addCase(setApiKey.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isConfigured = false;
      });
    
    // 获取配置状态
    builder
      .addCase(getConfigStatus.fulfilled, (state, action: PayloadAction<ConfigStatus>) => {
        state.status = action.payload;
        state.isConfigured = action.payload.isConfigured;
        state.model = action.payload.currentModel;
        state.error = null;
      })
      .addCase(getConfigStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // 验证API密钥
    builder
      .addCase(validateApiKey.fulfilled, (state, action) => {
        if (action.payload.isValid) {
          state.isConfigured = true;
        }
        state.error = null;
      })
      .addCase(validateApiKey.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isConfigured = false;
      });
    
    // 获取可用AI模型
    builder
      .addCase(getAvailableModels.fulfilled, (state, action) => {
        // 存储可用模型信息（如果需要的话）
        console.log('可用AI模型:', action.payload);
      })
      .addCase(getAvailableModels.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // 设置AI模型
    builder
      .addCase(setAIModel.fulfilled, (state, action) => {
        state.model = action.payload.model;
        state.error = null;
      })
      .addCase(setAIModel.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// 导出actions
export const { 
  resetConfig, 
  clearError, 
  setLocalApiKey, 
  setLocalModel, 
  setConfigured 
} = configSlice.actions;

// 选择器
export const selectApiKey = (state: { config: ConfigState }) => state.config.apiKey;
export const selectModel = (state: { config: ConfigState }) => state.config.model;
export const selectIsConfigured = (state: { config: ConfigState }) => state.config.isConfigured;
export const selectConfigStatus = (state: { config: ConfigState }) => state.config.status;
export const selectConfigError = (state: { config: ConfigState }) => state.config.error;

// 复合选择器
export const selectConfigData = (state: { config: ConfigState }) => ({
  apiKey: state.config.apiKey,
  model: state.config.model,
  isConfigured: state.config.isConfigured,
  status: state.config.status,
  error: state.config.error,
});

export const selectHasValidConfig = (state: { config: ConfigState }) => 
  state.config.isConfigured && state.config.apiKey && state.config.apiKey.trim() !== '';

export default configSlice.reducer;
