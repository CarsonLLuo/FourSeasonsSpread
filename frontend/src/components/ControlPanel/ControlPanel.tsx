/**
 * 控制面板组件
 * 处理抽牌、AI分析和重置操作
 */

import React from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  Casino as DiceIcon,
  Psychology as AIIcon,
  Refresh as RefreshIcon,
  AutoAwesome as MagicIcon,
} from '@mui/icons-material';
import { ControlPanelProps } from '../../types';

// 样式化组件
const ControlContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid #e9ecef',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
  color: 'white',
  fontWeight: 600,
  fontSize: '1.1rem',
  padding: theme.spacing(1.5, 3),
  borderRadius: '12px',
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #c0392b, #a93226)',
    boxShadow: '0 6px 20px rgba(231, 76, 60, 0.4)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0px)',
    boxShadow: '0 2px 10px rgba(231, 76, 60, 0.3)',
  },
  '&:disabled': {
    background: '#bdc3c7',
    color: '#7f8c8d',
    boxShadow: 'none',
    transform: 'none',
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  fontWeight: 600,
  padding: theme.spacing(1, 2),
  borderRadius: '8px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #2980b9, #1f5f8b)',
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    background: '#bdc3c7',
    color: '#7f8c8d',
    transform: 'none',
  },
}));


const StatusAlert = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: '8px',
}));

const LoadingBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
});

const InfoText = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
  marginTop: theme.spacing(1),
  fontStyle: 'italic',
}));

// 动画变体
const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
  },
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  isDrawing,
  hasReading,
  isConfigured,
  onDraw,
  onAnalyze,
  onReset,
}) => {
  // 渲染主要抽牌按钮
  const renderDrawSection = () => {
    if (!hasReading) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <SectionTitle variant="h6">
            <MagicIcon />
            开始占卜
          </SectionTitle>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            准备好了吗？点击下方按钮开始你的四季牌阵占卜
          </Typography>

          <motion.div
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
          >
            <motion.div animate={!isDrawing ? pulseAnimation : {}}>
              <PrimaryButton
                onClick={onDraw}
                disabled={isDrawing}
                startIcon={isDrawing ? <CircularProgress size={20} color="inherit" /> : <DiceIcon />}
                size="large"
                fullWidth
              >
                {isDrawing ? '正在抽取牌阵...' : '🔮 抽取四季牌阵 🔮'}
              </PrimaryButton>
            </motion.div>
          </motion.div>

          <InfoText>
            一键抽取完整的四季牌阵（5张牌），无需多次点击
          </InfoText>
        </Box>
      );
    }

    return null;
  };

  // 渲染操作按钮区域
  const renderActionSection = () => {
    if (!hasReading) return null;

    return (
      <Box>
        <SectionTitle variant="h6">
          <AIIcon />
          分析与操作
        </SectionTitle>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <SecondaryButton
            onClick={onAnalyze}
            disabled={!isConfigured}
            startIcon={<AIIcon />}
            sx={{ flex: 1 }}
            variant="contained"
          >
            AI智能分析
          </SecondaryButton>
          
          <SecondaryButton
            onClick={onReset}
            startIcon={<RefreshIcon />}
            sx={{ 
              flex: 1,
              borderColor: '#e74c3c',
              color: '#e74c3c',
              '&:hover': {
                borderColor: '#c0392b',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
              },
            }}
            variant="outlined"
          >
            重新抽牌
          </SecondaryButton>
        </Box>

        {/* 状态提示 */}
        {renderStatusAlerts()}
      </Box>
    );
  };

  // 渲染状态提示
  const renderStatusAlerts = () => {
    const alerts = [];

    if (hasReading && !isConfigured) {
      alerts.push(
        <StatusAlert key="config" severity="warning" variant="outlined">
          ⚠️ 请在右侧配置面板设置API密钥以使用AI分析功能
        </StatusAlert>
      );
    }

    if (hasReading && isConfigured) {
      alerts.push(
        <StatusAlert key="ready" severity="success" variant="outlined">
          ✅ 四季牌阵已就绪！可以进行AI智能分析
        </StatusAlert>
      );
    }

    if (isDrawing) {
      alerts.push(
        <StatusAlert key="drawing" severity="info" variant="outlined">
          <LoadingBox>
            <CircularProgress size={16} />
            正在为您抽取神秘的四季牌阵...
          </LoadingBox>
        </StatusAlert>
      );
    }

    return alerts;
  };

  return (
    <ControlContainer elevation={2}>
      {renderDrawSection()}
      
      {hasReading && (
        <>
          <Divider sx={{ my: 3 }} />
          {renderActionSection()}
        </>
      )}
    </ControlContainer>
  );
};

export default ControlPanel;
