/**
 * 日常塔罗抽牌组件
 * 专门用于单张牌的日常占卜功能
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fade,
  Grow,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Psychology as AIIcon,
  AutoAwesome as MagicIcon,
  Help as QuestionIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
} from '@mui/icons-material';

import TarotCard from '../TarotCard/TarotCard';
import { Card as TarotCardType } from '../../types';
import TarotImageService from '../../services/tarotImageService';
import { TarotAPI, AnalysisAPI, handleApiError } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// 样式化组件
const MainContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '24px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid rgba(102, 126, 234, 0.1)',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '1.1rem',
  fontWeight: 400,
}));

const QuestionSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    background: 'rgba(102, 126, 234, 0.05)',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const CardSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  minHeight: '400px',
}));

const DrawButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: '20px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
  },
  '&:disabled': {
    background: theme.palette.grey[300],
    boxShadow: 'none',
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  justifyContent: 'center',
  marginTop: theme.spacing(2),
}));

const ResultSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const InterpretationCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
  border: '1px solid rgba(102, 126, 234, 0.2)',
  boxShadow: 'none',
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6, 2),
  color: theme.palette.text.secondary,
}));

const CardPlaceholder = styled(Box)(({ theme }) => ({
  width: '200px',
  height: '300px',
  border: '2px dashed #dee2e6',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(102, 126, 234, 0.05)',
  color: theme.palette.text.secondary,
  fontSize: '1.1rem',
  gap: theme.spacing(2),
}));

// Markdown渲染容器
const MarkdownContainer = styled(Box)(({ theme }) => ({
  lineHeight: 1.7,
  fontSize: '1rem',
  color: theme.palette.text.primary,
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    margin: `${theme.spacing(2)} 0 ${theme.spacing(1)} 0`,
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  '& h1': { fontSize: '1.5rem' },
  '& h2': { fontSize: '1.3rem' },
  '& h3': { fontSize: '1.1rem' },
  '& h4': { fontSize: '1rem' },
  '& p': {
    margin: `${theme.spacing(1)} 0`,
    lineHeight: 1.7,
  },
  '& ul, & ol': {
    paddingLeft: theme.spacing(3),
    margin: `${theme.spacing(1)} 0`,
  },
  '& li': {
    marginBottom: theme.spacing(0.5),
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2),
    margin: `${theme.spacing(1)} 0`,
    fontStyle: 'italic',
    background: 'rgba(0,0,0,0.02)',
    padding: theme.spacing(1),
    borderRadius: '0 4px 4px 0',
  },
  '& code': {
    backgroundColor: theme.palette.grey[100],
    padding: '2px 4px',
    borderRadius: '3px',
    fontSize: '0.9em',
    fontFamily: 'monospace',
  },
  '& pre': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: '8px',
    overflow: 'auto',
    margin: `${theme.spacing(1)} 0`,
  },
  '& pre code': {
    backgroundColor: 'transparent',
    padding: 0,
  },
  '& strong': {
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  '& em': {
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    margin: `${theme.spacing(1)} 0`,
  },
  '& th, & td': {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1),
    textAlign: 'left',
  },
  '& th': {
    backgroundColor: theme.palette.grey[50],
    fontWeight: 600,
  },
}));

// 接口定义
interface DailyTarotProps {
  isConfigured?: boolean;
}

interface DailyReading {
  card: TarotCardType;
  question: string;
  timestamp: string;
}

const DailyTarot: React.FC<DailyTarotProps> = ({
  isConfigured = false,
}) => {
  const [question, setQuestion] = useState<string>('');
  const [currentReading, setCurrentReading] = useState<DailyReading | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [showCard, setShowCard] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');

  // 抽牌动画效果
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
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotateY: 90,
      transition: {
        duration: 0.5,
        ease: "easeIn" as const,
      },
    },
  };

  // 抽牌API调用
  const handleDrawCard = async () => {
    if (!question.trim()) {
      alert('请先输入您想要咨询的问题');
      return;
    }

    setIsDrawing(true);
    setShowCard(false);

    try {
      // 调用真实的API
      const result = await TarotAPI.drawSingleCard(question.trim());
      
      const newReading: DailyReading = {
        card: result.card,
        question: question.trim(),
        timestamp: result.timestamp,
      };

      setCurrentReading(newReading);
      setShowCard(true);
    } catch (error) {
      console.error('抽牌失败:', error);
      const errorMessage = handleApiError(error);
      alert(`抽牌失败: ${errorMessage}`);
    } finally {
      setIsDrawing(false);
    }
  };

  // 重新抽牌
  const handleRedraw = () => {
    setCurrentReading(null);
    setShowCard(false);
    setQuestion('');
    setAnalysisResult('');
  };

  // 进行AI分析
  const handleAnalyze = async () => {
    if (!currentReading) return;

    if (!isConfigured) {
      alert('AI分析功能需要先配置API密钥，请在右侧配置面板中设置');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult('');

    try {
      const result = await AnalysisAPI.analyzeSingleCard(currentReading.card, currentReading.question);
      
      // 组合分析结果
      const fullAnalysis = result.interpretation || result.fullText || '';
      setAnalysisResult(fullAnalysis);
    } catch (error) {
      console.error('AI分析失败:', error);
      const errorMessage = handleApiError(error);
      alert(`AI分析失败: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 导出结果
  const handleExport = () => {
    if (!currentReading) return;

    const content = `
=== 日常塔罗占卜结果 ===
时间: ${new Date(currentReading.timestamp).toLocaleString()}
问题: ${currentReading.question}

抽取的牌: ${currentReading.card.name}

${analysisResult ? `=== AI解读 ===\n${analysisResult}` : ''}

=== 免责声明 ===
本分析结果仅供参考，请结合实际情况理性对待。
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `日常塔罗占卜_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <MainContainer elevation={0}>
      {/* 标题区域 */}
      <HeaderSection>
        <MainTitle variant="h4">
          <MagicIcon sx={{ fontSize: '2rem' }} />
          日常塔罗指引
        </MainTitle>
        <Subtitle variant="body1">
          静心默念您的问题，让塔罗为您指明方向
        </Subtitle>
      </HeaderSection>

      {/* 问题输入区域 */}
      <QuestionSection>
        <StyledTextField
          fullWidth
          label="请输入您想要咨询的问题"
          placeholder="例如：我今天应该专注于什么？我在感情方面需要注意什么？"
          multiline
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isDrawing}
          InputProps={{
            startAdornment: <QuestionIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </QuestionSection>

      {/* 抽牌区域 */}
      <CardSection>
        <AnimatePresence mode="wait">
          {!currentReading ? (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CardPlaceholder>
                {isDrawing ? (
                  <>
                    <CircularProgress size={48} />
                    <Typography>正在为您抽取塔罗牌...</Typography>
                  </>
                ) : (
                  <>
                    <MagicIcon sx={{ fontSize: '3rem', opacity: 0.5 }} />
                    <Typography>点击下方按钮开始抽牌</Typography>
                  </>
                )}
              </CardPlaceholder>
            </motion.div>
          ) : (
            <motion.div
              key="card"
              variants={cardVariants}
              initial="hidden"
              animate={showCard ? "visible" : "hidden"}
              exit="exit"
              style={{ width: '200px' }}
            >
              <TarotCard
                card={currentReading.card}
                position={1}
                isEmpty={false}
                isCore={true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 操作按钮 */}
        <ActionButtons>
          {!currentReading ? (
            <DrawButton
              variant="contained"
              onClick={handleDrawCard}
              disabled={isDrawing || !question.trim()}
              startIcon={<MagicIcon />}
            >
              {isDrawing ? '抽取中...' : '开始抽牌'}
            </DrawButton>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={handleRedraw}
                startIcon={<RefreshIcon />}
                sx={{ borderRadius: '20px' }}
              >
                重新抽牌
              </Button>
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !isConfigured}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <AIIcon />}
                sx={{ borderRadius: '20px' }}
              >
                {isAnalyzing ? '分析中...' : 'AI解读'}
              </Button>
              {analysisResult && (
                <Button
                  variant="outlined"
                  onClick={handleExport}
                  startIcon={<ExportIcon />}
                  sx={{ borderRadius: '20px' }}
                >
                  导出结果
                </Button>
              )}
            </>
          )}
        </ActionButtons>
      </CardSection>

      {/* 解读结果区域 */}
      {currentReading && (
        <ResultSection>
          <Divider sx={{ mb: 3 }} />
          
          {/* 问题回顾 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              您的问题
            </Typography>
            <Chip
              label={currentReading.question}
              variant="outlined"
              sx={{ 
                maxWidth: '100%',
                height: 'auto',
                '& .MuiChip-label': {
                  display: 'block',
                  whiteSpace: 'normal',
                  textAlign: 'left',
                  padding: '8px 12px',
                },
              }}
            />
          </Box>

          {/* AI分析结果 */}
          {analysisResult && (
            <Fade in={Boolean(analysisResult)}>
              <InterpretationCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'primary.main',
                    fontWeight: 600,
                  }}>
                    <AIIcon />
                    AI塔罗解读
                  </Typography>
                  <MarkdownContainer>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {analysisResult}
                    </ReactMarkdown>
                  </MarkdownContainer>
                </CardContent>
              </InterpretationCard>
            </Fade>
          )}

          {/* 抽牌信息 */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              抽牌时间: {new Date(currentReading.timestamp).toLocaleString()}
            </Typography>
          </Box>
        </ResultSection>
      )}
    </MainContainer>
  );
};

export default DailyTarot;
