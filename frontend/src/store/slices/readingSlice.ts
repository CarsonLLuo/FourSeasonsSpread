/**
 * 抽牌状态管理切片
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ReadingState, Reading, DrawResponse } from '../../types';
import { api } from '../../services/api';

// 初始状态
const initialState: ReadingState = {
  currentReading: null,
  isDrawing: false,
  drawTimestamp: null,
  error: null,
};

// 异步操作：抽取四季牌阵
export const drawCards = createAsyncThunk(
  'reading/drawCards',
  async (_, { rejectWithValue }) => {
    try {
      const result = await api.tarot.drawCards();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || '抽牌失败');
    }
  }
);

// 异步操作：验证抽牌结果
export const validateReading = createAsyncThunk(
  'reading/validateReading',
  async (reading: Reading, { rejectWithValue }) => {
    try {
      const result = await api.tarot.validateReading(reading);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || '验证失败');
    }
  }
);

// 异步操作：获取牌阵信息
export const getSpreadInfo = createAsyncThunk(
  'reading/getSpreadInfo',
  async (_, { rejectWithValue }) => {
    try {
      const result = await api.tarot.getSpreadInfo();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取牌阵信息失败');
    }
  }
);

// 创建切片
const readingSlice = createSlice({
  name: 'reading',
  initialState,
  reducers: {
    // 重置抽牌状态
    resetReading: (state) => {
      state.currentReading = null;
      state.drawTimestamp = null;
      state.error = null;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 设置抽牌结果（手动设置）
    setReading: (state, action: PayloadAction<Reading>) => {
      state.currentReading = action.payload;
      state.drawTimestamp = new Date().toISOString();
      state.error = null;
    },
    
    // 更新特定位置的牌
    updateCard: (state, action: PayloadAction<{ position: number; card: any }>) => {
      if (state.currentReading) {
        state.currentReading[action.payload.position] = action.payload.card;
      }
    },
  },
  extraReducers: (builder) => {
    // 抽取四季牌阵
    builder
      .addCase(drawCards.pending, (state) => {
        state.isDrawing = true;
        state.error = null;
      })
      .addCase(drawCards.fulfilled, (state, action: PayloadAction<DrawResponse>) => {
        state.isDrawing = false;
        state.currentReading = action.payload.reading;
        state.drawTimestamp = action.payload.timestamp;
        state.error = null;
      })
      .addCase(drawCards.rejected, (state, action) => {
        state.isDrawing = false;
        state.error = action.payload as string;
      });
    
    // 验证抽牌结果
    builder
      .addCase(validateReading.fulfilled, (state, action) => {
        // 验证成功，可以添加相关逻辑
        console.log('抽牌结果验证成功:', action.payload);
      })
      .addCase(validateReading.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // 获取牌阵信息
    builder
      .addCase(getSpreadInfo.fulfilled, (state, action) => {
        // 牌阵信息获取成功
        console.log('牌阵信息获取成功:', action.payload);
      })
      .addCase(getSpreadInfo.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// 导出actions
export const { resetReading, clearError, setReading, updateCard } = readingSlice.actions;

// 选择器
export const selectCurrentReading = (state: { reading: ReadingState }) => state.reading.currentReading;
export const selectIsDrawing = (state: { reading: ReadingState }) => state.reading.isDrawing;
export const selectDrawTimestamp = (state: { reading: ReadingState }) => state.reading.drawTimestamp;
export const selectReadingError = (state: { reading: ReadingState }) => state.reading.error;
export const selectHasReading = (state: { reading: ReadingState }) => state.reading.currentReading !== null;

// 复合选择器
export const selectReadingStatus = (state: { reading: ReadingState }) => ({
  hasReading: state.reading.currentReading !== null,
  isDrawing: state.reading.isDrawing,
  error: state.reading.error,
  timestamp: state.reading.drawTimestamp,
});

export default readingSlice.reducer;
