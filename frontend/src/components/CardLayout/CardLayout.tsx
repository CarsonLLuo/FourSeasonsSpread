/**
 * 四季牌阵布局组件
 * 显示十字形的五张牌布局
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { CardLayoutProps } from '../../types';
import TarotCard from '../TarotCard';

// 样式化组件
const LayoutContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
    pointerEvents: 'none',
  },
}));

const LayoutTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 700,
  fontSize: '1.5rem',
}));

const CardGrid = styled(Box)({
  position: 'relative',
  zIndex: 1,
});

const CrossPattern = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'repeat(3, 1fr)',
  gap: '16px',
  maxWidth: '600px',
  margin: '0 auto',
  aspectRatio: '1',
});

const CardSlot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'slotPosition'
})<{ slotPosition: 'top' | 'left' | 'center' | 'right' | 'bottom' | 'empty' }>(
  ({ slotPosition }) => {
    const gridAreas = {
      top: '1 / 2 / 2 / 3',
      left: '2 / 1 / 3 / 2', 
      center: '2 / 2 / 3 / 3',
      right: '2 / 3 / 3 / 4',
      bottom: '3 / 2 / 4 / 3',
      empty: '1 / 1 / 2 / 2', // 占位
    };
    
    return {
      gridArea: gridAreas[slotPosition],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  }
);

const ConnectionLine = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  background: `linear-gradient(90deg, ${theme.palette.primary.main}40, transparent, ${theme.palette.primary.main}40)`,
  height: '2px',
  borderRadius: '1px',
  zIndex: 0,
}));

const VerticalLine = styled(ConnectionLine)({
  width: '2px',
  height: '100px',
  background: 'linear-gradient(0deg, #667eea40, transparent, #667eea40)',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
});

const HorizontalLine = styled(ConnectionLine)({
  width: '100px',
  height: '2px',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
});

const EmptyTimestamp = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(2),
  color: theme.palette.text.secondary,
  fontStyle: 'italic',
}));

const DrawTimestamp = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(2),
  fontSize: '0.85rem',
  color: theme.palette.text.secondary,
}));

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
    },
  },
};

const CardLayout: React.FC<CardLayoutProps> = ({ reading, onCardClick }) => {
  const hasReading = reading !== null;

  // 渲染空布局
  const renderEmptyLayout = () => (
    <LayoutContainer elevation={3}>
      <LayoutTitle variant="h4">
        🔮 你的四季牌阵正在等待... 🔮
      </LayoutTitle>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <CardGrid>
          <CrossPattern>
            {/* 上排：4号位置 */}
            <CardSlot slotPosition="top">
              <TarotCard
                card={null}
                position={4}
                isEmpty={true}
                onClick={() => onCardClick?.(4)}
              />
            </CardSlot>

            {/* 中排：1、5、3号位置 */}
            <CardSlot slotPosition="left">
              <TarotCard
                card={null}
                position={1}
                isEmpty={true}
                onClick={() => onCardClick?.(1)}
              />
            </CardSlot>

            <CardSlot slotPosition="center">
              <TarotCard
                card={null}
                position={5}
                isEmpty={true}
                isCore={true}
                onClick={() => onCardClick?.(5)}
              />
            </CardSlot>

            <CardSlot slotPosition="right">
              <TarotCard
                card={null}
                position={3}
                isEmpty={true}
                onClick={() => onCardClick?.(3)}
              />
            </CardSlot>

            {/* 下排：2号位置 */}
            <CardSlot slotPosition="bottom">
              <TarotCard
                card={null}
                position={2}
                isEmpty={true}
                onClick={() => onCardClick?.(2)}
              />
            </CardSlot>
          </CrossPattern>

          {/* 连接线 */}
          <HorizontalLine variants={lineVariants} />
          <VerticalLine variants={lineVariants} />
        </CardGrid>
      </motion.div>

      <EmptyTimestamp variant="body2">
        点击"抽取四季牌阵"开始你的占卜之旅
      </EmptyTimestamp>
    </LayoutContainer>
  );

  // 渲染已抽取的牌阵
  const renderActiveLayout = () => (
    <LayoutContainer elevation={3}>
      <LayoutTitle variant="h4">
        🔮 四季牌阵 🔮
      </LayoutTitle>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <CardGrid>
          <CrossPattern>
            {/* 上排：4号位置 */}
            <CardSlot slotPosition="top">
              <TarotCard
                card={reading![4]}
                position={4}
                onClick={() => onCardClick?.(4)}
              />
            </CardSlot>

            {/* 中排：1、5、3号位置 */}
            <CardSlot slotPosition="left">
              <TarotCard
                card={reading![1]}
                position={1}
                onClick={() => onCardClick?.(1)}
              />
            </CardSlot>

            <CardSlot slotPosition="center">
              <TarotCard
                card={reading![5]}
                position={5}
                isCore={true}
                onClick={() => onCardClick?.(5)}
              />
            </CardSlot>

            <CardSlot slotPosition="right">
              <TarotCard
                card={reading![3]}
                position={3}
                onClick={() => onCardClick?.(3)}
              />
            </CardSlot>

            {/* 下排：2号位置 */}
            <CardSlot slotPosition="bottom">
              <TarotCard
                card={reading![2]}
                position={2}
                onClick={() => onCardClick?.(2)}
              />
            </CardSlot>
          </CrossPattern>

          {/* 连接线 */}
          <motion.div variants={lineVariants}>
            <HorizontalLine />
          </motion.div>
          <motion.div variants={lineVariants}>
            <VerticalLine />
          </motion.div>
        </CardGrid>
      </motion.div>

      <DrawTimestamp variant="body2">
        抽牌时间: {new Date().toLocaleString()}
      </DrawTimestamp>
    </LayoutContainer>
  );

  return hasReading ? renderActiveLayout() : renderEmptyLayout();
};

export default CardLayout;
