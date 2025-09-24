/**
 * AI分析状态管理切片
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AnalysisState, AnalysisResult, Reading } from '../../types';
import { api } from '../../services/api';

// 初始状态
const initialState: AnalysisState = {
  results: null,
  isAnalyzing: false,
  error: null,
};

// 异步操作：完整AI分析
export const analyzeComplete = createAsyncThunk(
  'analysis/analyzeComplete',
  async ({ reading, userQuestion }: { reading: Reading; userQuestion?: string }, { rejectWithValue }) => {
    try {
      const result = await api.analysis.analyzeComplete(reading, userQuestion);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'AI分析失败');
    }
  }
);

// 异步操作：详细分析
export const analyzeFull = createAsyncThunk(
  'analysis/analyzeFull',
  async ({ reading, userQuestion }: { reading: Reading; userQuestion?: string }, { rejectWithValue }) => {
    try {
      const result = await api.analysis.analyzeFull(reading, userQuestion);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || '详细分析失败');
    }
  }
);

// 异步操作：快速洞察
export const getInsight = createAsyncThunk(
  'analysis/getInsight',
  async (reading: Reading, { rejectWithValue }) => {
    try {
      const result = await api.analysis.getInsight(reading);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取洞察失败');
    }
  }
);

// 异步操作：季节建议
export const getSeasonalAdvice = createAsyncThunk(
  'analysis/getSeasonalAdvice',
  async (reading: Reading, { rejectWithValue }) => {
    try {
      const result = await api.analysis.getSeasonalAdvice(reading);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取季节建议失败');
    }
  }
);

// 异步操作：获取AI服务状态
export const getAnalysisStatus = createAsyncThunk(
  'analysis/getStatus',
  async (_, { rejectWithValue }) => {
    try {
      const result = await api.analysis.getStatus();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取AI服务状态失败');
    }
  }
);

// 创建切片
const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    // 重置分析结果
    resetAnalysis: (state) => {
      state.results = null;
      state.error = null;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 设置分析结果（手动设置）
    setAnalysisResults: (state, action: PayloadAction<AnalysisResult>) => {
      state.results = action.payload;
      state.error = null;
    },
    
    // 更新分析结果的特定部分
    updateAnalysisField: (state, action: PayloadAction<{ field: keyof AnalysisResult; value: any }>) => {
      if (state.results) {
        (state.results as any)[action.payload.field] = action.payload.value;
      }
    },
  },
  extraReducers: (builder) => {
    // 完整AI分析
    builder
      .addCase(analyzeComplete.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(analyzeComplete.fulfilled, (state, action: PayloadAction<AnalysisResult>) => {
        state.isAnalyzing = false;
        state.results = action.payload;
        state.error = null;
      })
      .addCase(analyzeComplete.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload as string;
      });
    
    // 详细分析
    builder
      .addCase(analyzeFull.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(analyzeFull.fulfilled, (state, action: PayloadAction<AnalysisResult>) => {
        state.isAnalyzing = false;
        // 合并结果，保留其他分析类型的数据
        if (state.results) {
          state.results = { ...state.results, ...action.payload };
        } else {
          state.results = action.payload;
        }
        state.error = null;
      })
      .addCase(analyzeFull.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload as string;
      });
    
    // 快速洞察
    builder
      .addCase(getInsight.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(getInsight.fulfilled, (state, action: PayloadAction<AnalysisResult>) => {
        state.isAnalyzing = false;
        // 合并洞察结果
        if (state.results) {
          state.results = { ...state.results, insight: action.payload.insight };
        } else {
          state.results = action.payload;
        }
        state.error = null;
      })
      .addCase(getInsight.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload as string;
      });
    
    // 季节建议
    builder
      .addCase(getSeasonalAdvice.pending, (state) => {
        state.isAnalyzing = true;
        state.error = null;
      })
      .addCase(getSeasonalAdvice.fulfilled, (state, action: PayloadAction<AnalysisResult>) => {
        state.isAnalyzing = false;
        // 合并季节建议结果
        if (state.results) {
          state.results = { ...state.results, seasonalAdvice: action.payload.seasonalAdvice };
        } else {
          state.results = action.payload;
        }
        state.error = null;
      })
      .addCase(getSeasonalAdvice.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload as string;
      });
    
    // 获取AI服务状态
    builder
      .addCase(getAnalysisStatus.fulfilled, (state, action) => {
        console.log('AI服务状态:', action.payload);
      })
      .addCase(getAnalysisStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// 导出actions
export const { 
  resetAnalysis, 
  clearError, 
  setAnalysisResults, 
  updateAnalysisField 
} = analysisSlice.actions;

// 选择器
export const selectAnalysisResults = (state: { analysis: AnalysisState }) => state.analysis.results;
export const selectIsAnalyzing = (state: { analysis: AnalysisState }) => state.analysis.isAnalyzing;
export const selectAnalysisError = (state: { analysis: AnalysisState }) => state.analysis.error;
export const selectHasAnalysis = (state: { analysis: AnalysisState }) => state.analysis.results !== null;

// 特定分析结果选择器
export const selectFullAnalysis = (state: { analysis: AnalysisState }) => 
  state.analysis.results?.fullAnalysis || null;

export const selectInsight = (state: { analysis: AnalysisState }) => 
  state.analysis.results?.insight || null;

export const selectSeasonalAdvice = (state: { analysis: AnalysisState }) => 
  state.analysis.results?.seasonalAdvice || null;

export const selectCardsSummary = (state: { analysis: AnalysisState }) => 
  state.analysis.results?.cardsSummary || null;

// 复合选择器
export const selectAnalysisStatus = (state: { analysis: AnalysisState }) => ({
  hasAnalysis: state.analysis.results !== null,
  isAnalyzing: state.analysis.isAnalyzing,
  error: state.analysis.error,
  timestamp: state.analysis.results?.timestamp || null,
});

export const selectAnalysisData = (state: { analysis: AnalysisState }) => ({
  fullAnalysis: state.analysis.results?.fullAnalysis,
  insight: state.analysis.results?.insight,
  seasonalAdvice: state.analysis.results?.seasonalAdvice,
  cardsSummary: state.analysis.results?.cardsSummary,
  timestamp: state.analysis.results?.timestamp,
  analysisType: state.analysis.results?.analysisType,
});

export default analysisSlice.reducer;
