/**
 * 配置面板组件
 * 处理API密钥设置和AI模型选择
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Divider,
  InputAdornment,
  IconButton,
  FormHelperText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Settings as SettingsIcon,
  Key as KeyIcon,
  Psychology as ModelIcon,
  Api as ApiIcon,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { ConfigPanelProps, ApiType } from '../../types';
import { ConfigAPI, handleApiError } from '../../services/api';

// 样式化组件
const ConfigContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid #e9ecef',
}));

const ConfigTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const StatusChip = styled(Chip)<{ status: 'configured' | 'unconfigured' }>(({ theme, status }) => ({
  marginLeft: theme.spacing(1),
  backgroundColor: status === 'configured' ? '#e8f5e8' : '#ffeaa7',
  color: status === 'configured' ? '#2d5a2d' : '#d63031',
  fontWeight: 500,
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const SaveButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #00b894, #00a085)',
  color: 'white',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: '8px',
  '&:hover': {
    background: 'linear-gradient(135deg, #00a085, #009579)',
  },
}));

const InfoText = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
}));

const ConfigPanel: React.FC<ConfigPanelProps> = ({ isConfigured, onSaveConfig }) => {
  const [apiType, setApiType] = useState<ApiType>(ApiType.AIHUBMIX);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 动态获取的数据
  const [apiTypes, setApiTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载API类型信息
  useEffect(() => {
    const loadApiInfo = async () => {
      try {
        setIsLoading(true);
        const apiTypesData = await ConfigAPI.getApiTypes();
        setApiTypes(apiTypesData.apiTypes);
        
        // 设置默认API类型
        if (apiTypesData.currentType) {
          setApiType(apiTypesData.currentType as ApiType);
        }
      } catch (error) {
        console.error('加载API信息失败:', error);
        setError('加载配置信息失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadApiInfo();
  }, []);

  // API类型改变处理
  const handleApiTypeChange = (newApiType: ApiType) => {
    setApiType(newApiType);
    
    // 根据API类型设置推荐的默认模型
    switch (newApiType) {
      case ApiType.AIHUBMIX:
        setModel('gpt-4o-mini');
        break;
      case ApiType.OPENAI:
        setModel('gpt-4o-mini');
        break;
      case ApiType.CLAUDE:
        setModel('claude-3-5-sonnet-20241022');
        break;
      case ApiType.GEMINI:
        setModel('gemini-pro');
        break;
      case ApiType.DEEPSEEK:
        setModel('deepseek-chat');
        break;
      default:
        setModel('gpt-4o-mini');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!apiKey.trim()) {
      setError('请输入有效的API密钥');
      return;
    }

    if (!model) {
      setError('请选择AI模型');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 使用新的API配置方法
      await ConfigAPI.setApiConfig(apiType, apiKey.trim(), model);
      setSuccess(`${apiType.toUpperCase()} API配置成功！AI分析功能已可用`);
      setApiKey(''); // 清空输入框
      
      // 调用原有的回调以保持兼容性
      if (onSaveConfig) {
        await onSaveConfig({ apiKey: apiKey.trim(), model });
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  // 获取模型输入提示文本
  const getModelHelperText = () => {
    switch (apiType) {
      case ApiType.AIHUBMIX:
        return '推荐：gpt-4o-mini（性价比高） | gpt-4o | claude-3-5-sonnet-20241022 | gemini-pro';
      case ApiType.OPENAI:
        return '推荐：gpt-4o-mini（成本低） | gpt-4o | gpt-4 | gpt-3.5-turbo';
      case ApiType.CLAUDE:
        return '推荐：claude-3-5-sonnet-20241022 | claude-3-opus-20240229 | claude-3-haiku-20240307';
      case ApiType.GEMINI:
        return '推荐：gemini-pro | gemini-pro-vision（支持图像）';
      case ApiType.DEEPSEEK:
        return '推荐：deepseek-chat | deepseek-coder（编程专用）';
      default:
        return '请输入对应API的模型名称';
    }
  };

  return (
    <ConfigContainer elevation={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ConfigTitle variant="h6">
          <SettingsIcon />
          配置设置
        </ConfigTitle>
        <StatusChip
          status={isConfigured ? 'configured' : 'unconfigured'}
          icon={isConfigured ? <CheckCircle /> : <Error />}
          label={isConfigured ? '✅ 已配置' : '⚠️ 需要配置'}
          size="small"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {isLoading ? (
        <Typography>加载配置信息...</Typography>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* API类型选择 */}
          <FormSection>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ApiIcon fontSize="small" />
              AI服务提供商
            </Typography>
            
            <FormControl fullWidth>
              <Select
                value={apiType}
                onChange={(e) => handleApiTypeChange(e.target.value as ApiType)}
                displayEmpty
                size="small"
              >
                {apiTypes.map((type) => (
                  <MenuItem key={type.type} value={type.type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{type.displayName}</Typography>
                      {type.type === apiType && <Chip label="当前" size="small" />}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                选择您的AI服务提供商
              </FormHelperText>
            </FormControl>
          </FormSection>

          {/* API密钥配置 */}
          <FormSection>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <KeyIcon fontSize="small" />
              {apiType.toUpperCase()} API密钥
            </Typography>
          
          <TextField
            fullWidth
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleApiKeyVisibility}
                    edge="end"
                    size="small"
                  >
                    {showApiKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText={`请输入您的${apiType.toUpperCase()} API密钥`}
          />
        </FormSection>

          {/* AI模型选择 */}
          <FormSection>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ModelIcon fontSize="small" />
              AI模型名称
            </Typography>
            
            <TextField
              fullWidth
              size="small"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="请输入模型名称，如：gpt-4o-mini"
              helperText={getModelHelperText()}
            />
          </FormSection>

        {/* 提交按钮 */}
        <FormSection>
          <SaveButton
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting || !apiKey.trim()}
          >
            {isSubmitting ? '保存中...' : '💾 保存配置'}
          </SaveButton>
        </FormSection>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* 成功提示 */}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
          )}
        </form>
      )}

      <Divider sx={{ my: 2 }} />

      {/* 使用说明 */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          📖 使用说明
        </Typography>
        
        <Box component="div" sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 1 }}>
          <strong>四季牌阵特殊性：</strong>
          <br />• 传统上仅在四个节气使用（春分、夏至、秋分、冬至）
          <br />• 这四天是能量转换的关键时刻
          <br />
          <br /><strong>牌阵布局：</strong>
          <br />• 1号位：行动力（权杖）
          <br />• 2号位：情感状态（圣杯）
          <br />• 3号位：理性思维（宝剑）
          <br />• 4号位：事业财务（金币）
          <br />• 5号位：灵性成长（大阿尔卡纳）
        </Box>
      </Box>
    </ConfigContainer>
  );
};

export default ConfigPanel;
