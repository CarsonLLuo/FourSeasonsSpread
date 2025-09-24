/**
 * 四季牌阵 React 应用类型定义
 */

// 塔罗牌数据结构
export interface CardData {
  id?: number;
  suit?: string;
  rank?: number | string;
  name: string;
  nameShort?: string;
  value?: string;
  desc?: string;
  meaning_up?: string;
  meaning_rev?: string;
}

// 塔罗牌类
export interface Card {
  name: string;
  baseName: string;
  isReversed: boolean;
  isMajorArcana: boolean;
  suit: string | null;
  cardData: CardData;
  imageUrl?: string;
  imageUrlReversed?: string;
}

// 抽牌结果
export interface Reading {
  [position: number]: Card;
}

// 牌阵位置信息
export interface SpreadPosition {
  name: string;
  suit: string;
  meaning: string;
  season: string;
}

// 牌阵信息
export interface SpreadInfo {
  name: string;
  description: string;
  positions: {
    [position: number]: SpreadPosition;
  };
  layout: {
    description: string;
    pattern: string;
  };
  traditionalUse: string;
}

// API响应基础结构
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 抽牌API响应
export interface DrawResponse {
  reading: Reading;
  spreadInfo: SpreadInfo;
  timestamp: string;
  drawTime: string;
}

// AI分析结果
export interface AnalysisResult {
  fullAnalysis: string;
  cardsSummary: string;
  insight: string;
  seasonalAdvice: string;
  timestamp: string;
  analysisType: 'complete' | 'full' | 'insight' | 'seasonal';
  analysisStatus?: {
    fullAnalysis: 'success' | 'error';
    seasonalAdvice: 'success' | 'error';
  };
}

// API类型枚举
export enum ApiType {
  AIHUBMIX = 'aihubmix',
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  OPENAI = 'openai',
  CLAUDE = 'claude'
}

// API类型信息
export interface ApiTypeInfo {
  type: ApiType;
  name: string;
  displayName: string;
  models: string[];
  defaultModel: string;
}

// 配置状态
export interface ConfigStatus {
  isConfigured: boolean;
  apiType: ApiType;
  apiTypeName: string;
  apiBaseUrl: string;
  currentModel: string;
  availableModels: string[];
  maxTokens: number;
  temperature: number;
  hasApiKey: boolean;
}

// Redux状态结构
export interface RootState {
  reading: ReadingState;
  analysis: AnalysisState;
  config: ConfigState;
  ui: UIState;
}

// 抽牌状态
export interface ReadingState {
  currentReading: Reading | null;
  isDrawing: boolean;
  drawTimestamp: string | null;
  error: string | null;
}

// 分析状态
export interface AnalysisState {
  results: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
}

// 配置状态
export interface ConfigState {
  apiKey: string | null;
  model: string;
  isConfigured: boolean;
  status: ConfigStatus | null;
  error: string | null;
}

// UI状态
export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  currentTab: 'analysis' | 'insight' | 'advice';
  showExportDialog: boolean;
  notifications: Notification[];
}

// 通知
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  autoClose?: boolean;
}

// 组件Props类型
export interface TarotCardProps {
  card: Card | null;
  position: number;
  isEmpty?: boolean;
  isCore?: boolean;
  onClick?: () => void;
}

export interface CardLayoutProps {
  reading: Reading | null;
  onCardClick?: (position: number) => void;
}

export interface ControlPanelProps {
  isDrawing: boolean;
  hasReading: boolean;
  isConfigured: boolean;
  onDraw: () => void;
  onAnalyze: () => void;
  onReset: () => void;
}

export interface AIAnalysisProps {
  results: AnalysisResult | null;
  isAnalyzing: boolean;
  onExport?: () => void;
}

export interface ConfigPanelProps {
  isConfigured: boolean;
  onSaveConfig: (config: { apiKey: string; model: string }) => void;
}

// 导出数据结构
export interface ExportData {
  reading: Reading;
  analysis: AnalysisResult;
  timestamp: string;
  spreadInfo: SpreadInfo;
}

// API错误类型
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// 动画配置
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

// 主题配置
export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  cardBg: string;
  button: string;
  buttonHover: string;
}

// 可用AI模型
export interface AIModel {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
}

// API端点配置
export interface ApiEndpoints {
  baseUrl: string;
  tarot: {
    draw: string;
    spreadInfo: string;
    cards: string;
    validate: string;
  };
  analysis: {
    complete: string;
    full: string;
    insight: string;
    seasonal: string;
    status: string;
  };
  config: {
    apiKey: string;
    status: string;
    validate: string;
    models: string;
    model: string;
    environment: string;
  };
  system: {
    health: string;
    api: string;
  };
}

// 事件类型
export type DrawCardEvent = () => void;
export type AnalyzeEvent = () => void;
export type ConfigSaveEvent = (config: { apiKey: string; model: string }) => void;
export type ExportEvent = () => void;
export type ResetEvent = () => void;
