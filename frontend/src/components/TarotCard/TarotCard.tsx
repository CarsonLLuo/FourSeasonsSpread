/**
 * 塔罗牌组件
 * 显示单张塔罗牌，支持动画效果和点击交互
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Box, Typography, Chip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TarotCardProps } from '../../types';
import TarotImageService from '../../services/tarotImageService';

// 样式化组件
const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => !['isEmpty', 'isCore', 'isReversed', 'hasImage'].includes(prop as string),
})<{
  isEmpty?: boolean;
  isCore?: boolean;
  isReversed?: boolean;
  hasImage?: boolean;
}>(({ theme, isEmpty, isCore, isReversed, hasImage }) => ({
  minHeight: hasImage ? '200px' : '120px',
  maxHeight: hasImage ? '300px' : 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: hasImage ? 'flex-start' : 'center',
  padding: hasImage ? theme.spacing(1) : theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  background: isEmpty 
    ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    : hasImage 
      ? '#ffffff'
      : isCore 
        ? 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: isEmpty 
    ? '2px dashed #dee2e6'
    : isCore 
      ? '2px solid #0984e3'
      : '2px solid #dee2e6',
  color: isEmpty 
    ? theme.palette.text.secondary
    : isCore && !hasImage
      ? '#ffffff'
      : theme.palette.text.primary,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: isCore ? '#74b9ff' : theme.palette.primary.main,
  },
  '&:active': {
    transform: 'translateY(-2px)',
  },
  ...(isReversed && !hasImage && {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(180deg, transparent 0%, rgba(255,0,0,0.1) 100%)',
      borderRadius: 'inherit',
      pointerEvents: 'none',
    },
  }),
}));

const CardContent = styled(Box)({
  textAlign: 'center',
  width: '100%',
});

const CardName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.95rem',
  marginBottom: theme.spacing(1),
  lineHeight: 1.3,
}));

const CardPosition = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  opacity: 0.8,
  marginBottom: theme.spacing(1),
  fontWeight: 500,
}));

const ReversedChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  fontSize: '0.7rem',
  height: '20px',
  backgroundColor: 'rgba(255, 0, 0, 0.1)',
  color: '#d32f2f',
  border: '1px solid rgba(255, 0, 0, 0.3)',
}));

const EmptyIcon = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  opacity: 0.5,
  marginBottom: theme.spacing(1),
}));

// 塔罗牌图片容器
const CardImageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '180px',
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const CardImage = styled('img')<{ isReversed?: boolean }>(({ theme, isReversed }) => ({
  width: '100%',
  height: 'auto',
  maxHeight: '200px',
  objectFit: 'contain',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  ...(isReversed && {
    transform: 'rotate(180deg)',
    filter: 'hue-rotate(15deg) brightness(0.9)',
  }),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '150px',
  width: '100%',
}));

const CompactCardInfo = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(0.5),
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '6px',
  marginTop: theme.spacing(0.5),
}));

// 位置名称映射
const positionNames: { [key: number]: string } = {
  1: '1号位 (行动力)',
  2: '2号位 (情感状态)', 
  3: '3号位 (理性思维)',
  4: '4号位 (事业财务)',
  5: '5号位 (灵性成长)',
};

// 位置图标映射
const positionIcons: { [key: number]: string } = {
  1: '⚡',
  2: '💝',
  3: '🧠',
  4: '📊',
  5: '✨',
};

// 动画变体
const cardVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    rotateY: -90,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.6,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.98,
  },
};

const TarotCard: React.FC<TarotCardProps> = ({
  card,
  position,
  isEmpty = false,
  isCore = false,
  onClick,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // 加载塔罗牌图片
  useEffect(() => {
    if (card && !isEmpty) {
      setImageLoading(true);
      setImageError(false);
      
      TarotImageService.getImageWithFallback(card)
        .then((url) => {
          setImageUrl(url);
          setImageLoading(false);
        })
        .catch(() => {
          setImageError(true);
          setImageLoading(false);
          setImageUrl(TarotImageService.getCardImageUrl(card));
        });
    }
  }, [card, isEmpty]);
  // 渲染空牌
  const renderEmptyCard = () => (
    <CardContent>
      <CardPosition variant="caption">
        {positionNames[position]}
      </CardPosition>
      <EmptyIcon>
        {positionIcons[position]}
      </EmptyIcon>
      <CardName variant="body2" color="textSecondary">
        待揭示
      </CardName>
    </CardContent>
  );

  // 渲染塔罗牌图片
  const renderCardImage = () => {
    if (!card || isEmpty) return null;

    if (imageLoading) {
      return (
        <LoadingContainer>
          <CircularProgress size={40} />
        </LoadingContainer>
      );
    }

    if (imageUrl) {
      return (
        <CardImageContainer>
          <CardImage
            src={imageUrl}
            alt={card.baseName}
            isReversed={card.isReversed}
            onError={() => {
              setImageError(true);
              setImageUrl(TarotImageService.getCardImageUrl(card));
            }}
          />
          <CompactCardInfo>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
              {card.baseName}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', opacity: 0.8 }}>
              {card.isReversed ? '逆位' : '正位'}
            </Typography>
          </CompactCardInfo>
        </CardImageContainer>
      );
    }

    return null;
  };

  // 渲染牌面内容（文字版本）
  const renderCardContent = () => {
    if (!card) return renderEmptyCard();

    // 如果有图片，只显示位置信息
    if (imageUrl && !imageLoading) {
      return (
        <Box sx={{ width: '100%', textAlign: 'center', mb: 1 }}>
          <CardPosition variant="caption">
            {positionNames[position]}
          </CardPosition>
        </Box>
      );
    }

    // 没有图片时显示完整文字信息
    return (
      <CardContent>
        <CardPosition variant="caption">
          {positionNames[position]}
        </CardPosition>
        <CardName variant="body1">
          {card.baseName}
        </CardName>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          {card.isReversed ? '逆位' : '正位'}
        </Typography>
        {card.isReversed && (
          <ReversedChip 
            label="逆" 
            size="small"
            variant="outlined"
          />
        )}
      </CardContent>
    );
  };

  const hasImage = Boolean(imageUrl && !imageLoading && card && !isEmpty);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      style={{ width: '100%' }}
    >
      <StyledCard
        isEmpty={isEmpty}
        isCore={isCore}
        isReversed={card?.isReversed}
        hasImage={hasImage}
        onClick={onClick}
        elevation={isEmpty ? 1 : 3}
      >
        {renderCardContent()}
        {renderCardImage()}
        {card?.isReversed && hasImage && (
          <ReversedChip 
            label="逆" 
            size="small"
            variant="outlined"
          />
        )}
      </StyledCard>
    </motion.div>
  );
};

export default TarotCard;
