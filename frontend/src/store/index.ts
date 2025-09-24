/**
 * Redux Store 配置
 */

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../types';

// 导入切片
import readingSlice from './slices/readingSlice';
import analysisSlice from './slices/analysisSlice';
import configSlice from './slices/configSlice';
import uiSlice from './slices/uiSlice';

// 配置store
export const store = configureStore({
  reducer: {
    reading: readingSlice,
    analysis: analysisSlice,
    config: configSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 导出类型
export type AppDispatch = typeof store.dispatch;
export type AppGetState = typeof store.getState;

// 类型化的hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
