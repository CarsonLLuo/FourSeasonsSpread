/**
 * 四季牌阵 React 主应用
 * 传统塔罗智慧与现代AI技术的完美结合
 */

import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { motion } from 'framer-motion';

// Redux相关
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store';
import { drawCards, selectCurrentReading, selectIsDrawing, selectReadingError } from './store/slices/readingSlice';
import { 
  analyzeComplete, 
  selectAnalysisResults, 
  selectIsAnalyzing, 
  selectAnalysisError,
  resetAnalysis 
} from './store/slices/analysisSlice';
import { 
  setApiKey, 
  getConfigStatus, 
  selectIsConfigured, 
  selectConfigError 
} from './store/slices/configSlice';
import { 
  addNotification, 
  removeNotification, 
  selectNotifications,
  createSuccessNotification,
  createErrorNotification,
} from './store/slices/uiSlice';

// 组件
import CardLayout from './components/CardLayout';
import ControlPanel from './components/ControlPanel';
import AIAnalysis from './components/AIAnalysis';
import ConfigPanel from './components/ConfigPanel';
import DailyTarot from './components/DailyTarot';

// 样式化组件
const AppContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: theme.spacing(2),
}));

const MainHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3, 0),
  marginBottom: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontWeight: 700,
  fontSize: '2.5rem',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
}));

const HeaderSubtitle = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '1.1rem',
  fontWeight: 400,
}));

const ModeToggleContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(1),
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButton-root': {
    color: 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    borderRadius: '16px',
    padding: theme.spacing(1.5, 3),
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    '&.Mui-selected': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      },
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
}));


// 主题配置
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#764ba2',
      dark: '#5a67d8',
    },
    secondary: {
      main: '#e74c3c',
      light: '#c0392b',
      dark: '#a93226',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

// 占卜模式类型
type DivinationMode = 'daily' | 'seasonal';

// 主应用组件内容
const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // 占卜模式状态
  const [divinationMode, setDivinationMode] = React.useState<DivinationMode>('daily');
  
  // 选择器
  const currentReading = useAppSelector(selectCurrentReading);
  const isDrawing = useAppSelector(selectIsDrawing);
  const readingError = useAppSelector(selectReadingError);
  
  const analysisResults = useAppSelector(selectAnalysisResults);
  const isAnalyzing = useAppSelector(selectIsAnalyzing);
  const analysisError = useAppSelector(selectAnalysisError);
  
  const isConfigured = useAppSelector(selectIsConfigured);
  const configError = useAppSelector(selectConfigError);
  
  const notifications = useAppSelector(selectNotifications);

  // 初始化时获取配置状态
  useEffect(() => {
    dispatch(getConfigStatus());
  }, [dispatch]);

  // 错误处理
  useEffect(() => {
    if (readingError) {
      dispatch(addNotification(createErrorNotification(readingError)));
    }
  }, [readingError, dispatch]);

  useEffect(() => {
    if (analysisError) {
      dispatch(addNotification(createErrorNotification(analysisError)));
    }
  }, [analysisError, dispatch]);

  useEffect(() => {
    if (configError) {
      dispatch(addNotification(createErrorNotification(configError)));
    }
  }, [configError, dispatch]);

  // 事件处理器
  const handleDraw = () => {
    dispatch(drawCards());
    dispatch(resetAnalysis()); // 重置之前的分析结果
  };

  const handleAnalyze = () => {
    if (currentReading) {
      dispatch(analyzeComplete({ reading: currentReading }));
    }
  };

  const handleReset = () => {
    handleDraw(); // 重新抽牌
  };

  const handleSaveConfig = async ({ apiKey, model }: { apiKey: string; model: string }) => {
    try {
      await dispatch(setApiKey(apiKey)).unwrap();
      dispatch(addNotification(createSuccessNotification('配置保存成功！AI分析功能已可用')));
    } catch (error: any) {
      throw new Error(error || '配置保存失败');
    }
  };

  const handleExport = () => {
    if (!currentReading || !analysisResults) return;

    const content = `
=== 四季牌阵占卜结果 ===
时间: ${new Date().toLocaleString()}

=== 牌阵结果 ===
1号位置 (行动力): ${currentReading[1].name}
2号位置 (情感状态): ${currentReading[2].name}
3号位置 (理性思维): ${currentReading[3].name}
4号位置 (事业财务): ${currentReading[4].name}
5号位置 (灵性成长): ${currentReading[5].name}

=== 核心洞察 ===
${analysisResults.insight}

=== 详细分析 ===
${analysisResults.fullAnalysis}

=== 季节建议 ===
${analysisResults.seasonalAdvice}

=== 免责声明 ===
本分析结果仅供参考，请结合实际情况理性对待。
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `四季牌阵分析_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    dispatch(addNotification(createSuccessNotification('分析报告已导出')));
  };

  const handleCloseNotification = (id: string) => {
    dispatch(removeNotification(id));
  };

  // 模式切换处理
  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: DivinationMode | null) => {
    if (newMode !== null) {
      setDivinationMode(newMode);
      // 切换模式时重置分析结果
      dispatch(resetAnalysis());
    }
  };

  return (
    <AppContainer>
      <Container maxWidth="xl">
        {/* 主标题 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <MainHeader>
              <HeaderTitle variant="h1">
                🔮 塔罗智慧 - AI占卜助手 🔮
              </HeaderTitle>
              <HeaderSubtitle variant="h6">
                传统塔罗智慧与现代AI技术的完美结合
              </HeaderSubtitle>
            </MainHeader>
          </motion.div>

          {/* 模式选择器 */}
          <motion.div variants={itemVariants}>
            <ModeToggleContainer elevation={0}>
              <StyledToggleButtonGroup
                value={divinationMode}
                exclusive
                onChange={handleModeChange}
                aria-label="占卜模式选择"
              >
                <ToggleButton value="daily" aria-label="日常单抽">
                  🌟 日常塔罗指引
                </ToggleButton>
                <ToggleButton value="seasonal" aria-label="四季牌阵">
                  🌸 四季牌阵占卜
                </ToggleButton>
              </StyledToggleButtonGroup>
            </ModeToggleContainer>
          </motion.div>

          {/* 主内容区域 */}
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* 左侧主要内容 */}
            <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
              {divinationMode === 'daily' ? (
                // 日常单抽模式
                <motion.div variants={itemVariants}>
                  <DailyTarot isConfigured={isConfigured} />
                </motion.div>
              ) : (
                // 四季牌阵模式
                <>
                  <motion.div variants={itemVariants}>
                    <Box sx={{ mb: 3 }}>
                      <CardLayout 
                        reading={currentReading}
                        onCardClick={(position) => console.log('点击了', position, '号位置')}
                      />
                    </Box>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Box sx={{ mb: 3 }}>
                      <ControlPanel
                        isDrawing={isDrawing}
                        hasReading={!!currentReading}
                        isConfigured={isConfigured}
                        onDraw={handleDraw}
                        onAnalyze={handleAnalyze}
                        onReset={handleReset}
                      />
                    </Box>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <AIAnalysis
                      results={analysisResults}
                      isAnalyzing={isAnalyzing}
                      onExport={handleExport}
                    />
                  </motion.div>
                </>
              )}
            </Box>

            {/* 右侧配置面板 */}
            <Box sx={{ width: { xs: '100%', md: '400px' }, flexShrink: 0 }}>
              <motion.div variants={itemVariants}>
                <ConfigPanel
                  isConfigured={isConfigured}
                  onSaveConfig={handleSaveConfig}
                />
              </motion.div>
            </Box>
          </Box>
        </motion.div>

        {/* 通知系统 */}
        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={true}
            autoHideDuration={notification.autoClose ? 5000 : null}
            onClose={() => handleCloseNotification(notification.id)}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={() => handleCloseNotification(notification.id)}
              severity={notification.type}
              variant="filled"
            >
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
      </Container>
    </AppContainer>
  );
};

// 主App组件
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;