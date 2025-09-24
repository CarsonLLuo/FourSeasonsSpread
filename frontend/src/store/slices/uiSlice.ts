/**
 * UI状态管理切片
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, Notification } from '../../types';

// 初始状态
const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  currentTab: 'analysis',
  showExportDialog: false,
  notifications: [],
};

// 生成通知ID
const generateNotificationId = () => Date.now().toString();

// 创建切片
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 切换主题
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // 设置主题
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    // 切换侧边栏
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    // 设置侧边栏状态
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // 切换当前标签页
    setCurrentTab: (state, action: PayloadAction<'analysis' | 'insight' | 'advice'>) => {
      state.currentTab = action.payload;
    },
    
    // 显示导出对话框
    showExportDialog: (state) => {
      state.showExportDialog = true;
    },
    
    // 隐藏导出对话框
    hideExportDialog: (state) => {
      state.showExportDialog = false;
    },
    
    // 切换导出对话框
    toggleExportDialog: (state) => {
      state.showExportDialog = !state.showExportDialog;
    },
    
    // 添加通知
    addNotification: {
      reducer: (state, action: PayloadAction<Notification>) => {
        state.notifications.push(action.payload);
      },
      prepare: (notification: Omit<Notification, 'id' | 'timestamp'>) => ({
        payload: {
          ...notification,
          id: generateNotificationId(),
          timestamp: Date.now(),
          autoClose: notification.autoClose !== false, // 默认自动关闭
        },
      }),
    },
    
    // 移除通知
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    // 清除所有通知
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // 移除过期通知
    removeExpiredNotifications: (state) => {
      const now = Date.now();
      state.notifications = state.notifications.filter(
        n => !n.autoClose || (now - n.timestamp) < 5000 // 5秒后自动移除
      );
    },
  },
});

// 导出actions
export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setCurrentTab,
  showExportDialog,
  hideExportDialog,
  toggleExportDialog,
  addNotification,
  removeNotification,
  clearNotifications,
  removeExpiredNotifications,
} = uiSlice.actions;

// 选择器
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectCurrentTab = (state: { ui: UIState }) => state.ui.currentTab;
export const selectShowExportDialog = (state: { ui: UIState }) => state.ui.showExportDialog;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;

// 复合选择器
export const selectUIState = (state: { ui: UIState }) => ({
  theme: state.ui.theme,
  sidebarOpen: state.ui.sidebarOpen,
  currentTab: state.ui.currentTab,
  showExportDialog: state.ui.showExportDialog,
  notificationCount: state.ui.notifications.length,
});

export const selectActiveNotifications = (state: { ui: UIState }) => 
  state.ui.notifications.filter(n => !n.autoClose || (Date.now() - n.timestamp) < 5000);

// 通知相关工具函数
export const createSuccessNotification = (message: string, autoClose = true) => ({
  type: 'success' as const,
  message,
  autoClose,
});

export const createErrorNotification = (message: string, autoClose = false) => ({
  type: 'error' as const,
  message,
  autoClose,
});

export const createWarningNotification = (message: string, autoClose = true) => ({
  type: 'warning' as const,
  message,
  autoClose,
});

export const createInfoNotification = (message: string, autoClose = true) => ({
  type: 'info' as const,
  message,
  autoClose,
});

export default uiSlice.reducer;
