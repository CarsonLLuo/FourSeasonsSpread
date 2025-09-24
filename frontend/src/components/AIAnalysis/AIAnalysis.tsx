/**
 * AI分析结果组件
 * 显示AI分析的详细内容和洞察
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Psychology as AIIcon,
  Lightbulb as InsightIcon,
  Download as ExportIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { AIAnalysisProps } from '../../types';

// 样式化组件
const AnalysisContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
}));

const AnalysisTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}));

const TabPanel = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));

const AnalysisText = styled(Typography)(({ theme }) => ({
  lineHeight: 1.7,
  fontSize: '0.95rem',
  color: theme.palette.text.primary,
  whiteSpace: 'pre-wrap',
}));

// Markdown渲染容器
const MarkdownContainer = styled(Box)(({ theme }) => ({
  lineHeight: 1.7,
  fontSize: '0.95rem',
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

const InsightBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
  padding: theme.spacing(2),
  borderRadius: '12px',
  border: '1px solid #e1bee7',
  marginTop: theme.spacing(1),
}));

const LoadingBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  gap: '16px',
});

const EmptyBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
}));

// MarkdownText组件用于渲染markdown内容
interface MarkdownTextProps {
  content: string;
}

const MarkdownText: React.FC<MarkdownTextProps> = ({ content }) => {
  return (
    <MarkdownContainer>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </MarkdownContainer>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
    >
      {value === index && <TabPanel>{children}</TabPanel>}
    </div>
  );
};

const AIAnalysis: React.FC<AIAnalysisProps> = ({ results, isAnalyzing, onExport }) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 渲染加载状态
  if (isAnalyzing) {
    return (
      <AnalysisContainer elevation={2}>
        <AnalysisTitle variant="h6">
          <AIIcon />
          AI分析中...
        </AnalysisTitle>
        <LoadingBox>
          <CircularProgress size={40} />
          <Typography color="textSecondary">
            正在为您的四季牌阵进行深度分析，请稍候...
          </Typography>
        </LoadingBox>
      </AnalysisContainer>
    );
  }

  // 渲染空状态
  if (!results) {
    return (
      <AnalysisContainer elevation={2}>
        <AnalysisTitle variant="h6">
          <AIIcon />
          AI智能分析
        </AnalysisTitle>
        <EmptyBox>
          <Typography variant="body1" color="textSecondary">
            🔮 抽牌完成后，点击"AI智能分析"获取专业解读
          </Typography>
        </EmptyBox>
      </AnalysisContainer>
    );
  }

  return (
    <AnalysisContainer elevation={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <AnalysisTitle variant="h6">
          <AIIcon />
          AI分析结果
        </AnalysisTitle>
        {onExport && (
          <Button
            onClick={onExport}
            startIcon={<ExportIcon />}
            variant="outlined"
            size="small"
          >
            导出分析报告
          </Button>
        )}
      </Box>

      {/* 时间戳 */}
      <Box sx={{ mb: 2 }}>
        <Chip
          label={`分析时间: ${new Date(results.timestamp).toLocaleString()}`}
          size="small"
          variant="outlined"
        />
      </Box>

      {/* 标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="AI分析结果标签页">
          <Tab label="📝 详细分析" />
          <Tab label="💡 核心洞察" />
          <Tab label="🌟 季节建议" />
        </Tabs>
      </Box>

      {/* 详细分析 */}
      <CustomTabPanel value={tabValue} index={0}>
        <MarkdownText content={results.fullAnalysis} />
      </CustomTabPanel>

      {/* 核心洞察 */}
      <CustomTabPanel value={tabValue} index={1}>
        <InsightBox>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InsightIcon color="primary" />
            核心洞察
          </Typography>
          <MarkdownText content={`✨ ${results.insight}`} />
        </InsightBox>
      </CustomTabPanel>

      {/* 季节建议 */}
      <CustomTabPanel value={tabValue} index={2}>
        <MarkdownText content={results.seasonalAdvice} />
      </CustomTabPanel>

      <Divider sx={{ my: 2 }} />
      
      {/* 免责声明 */}
      <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
        ℹ️ 本分析结果基于AI智能解读，仅供参考和自我反思使用，请结合实际情况理性对待。
      </Typography>
    </AnalysisContainer>
  );
};

export default AIAnalysis;
