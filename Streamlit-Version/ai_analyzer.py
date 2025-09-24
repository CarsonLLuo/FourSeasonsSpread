"""
AI塔罗牌分析器
使用aihubmix API调用LLM进行四季牌阵的深度分析
"""

import json
import requests
from typing import Dict, List, Optional, Any
from config import Config
from 四季牌阵 import Card, MajorArcana, MinorArcana

class TarotAIAnalyzer:
    """AI塔罗牌分析器"""
    
    def __init__(self):
        """初始化分析器"""
        self.config = Config
        
    def _make_api_request(self, prompt: str, max_tokens: int = None) -> Optional[str]:
        """
        向aihubmix API发送请求
        
        Args:
            prompt: 发送给AI的提示词
            max_tokens: 最大token数量
            
        Returns:
            AI的回复内容，失败时返回None
        """
        if not self.config.is_configured():
            raise ValueError("API密钥未配置，请先设置aihubmix API密钥")
        
        try:
            # 准备请求数据
            data = {
                "model": self.config.DEFAULT_MODEL,
                "messages": [
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": max_tokens or self.config.MAX_TOKENS,
                "temperature": self.config.TEMPERATURE
            }
            
            # 发送请求
            response = requests.post(
                f"{self.config.API_BASE_URL}/chat/completions",
                headers=self.config.get_api_headers(),
                json=data,
                timeout=30
            )
            
            # 检查响应状态
            if response.status_code == 200:
                result = response.json()
                return result.get('choices', [{}])[0].get('message', {}).get('content', '')
            else:
                print(f"API请求失败: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            print("API请求超时")
            return None
        except requests.exceptions.RequestException as e:
            print(f"API请求异常: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"JSON解析错误: {e}")
            return None
        except Exception as e:
            print(f"未知错误: {e}")
            return None
    
    def _get_system_prompt(self) -> str:
        """获取系统提示词，定义AI的角色和任务"""
        return """你是一位经验丰富的塔罗牌占卜师和心灵导师，专精于四季牌阵的解读。

你的专业特长包括：
1. 深度理解塔罗牌的象征意义和灵性内涵
2. 精通四季牌阵的布局和各位置的含义
3. 能够将牌面含义与现实生活情况相结合
4. 提供富有洞察力和启发性的指导建议
5. 用温暖、智慧的语言与咨询者沟通

四季牌阵说明：
- 1号位置（权杖牌组）：行动力 - 关于意志、创造与行动层面
- 2号位置（圣杯牌组）：情感状态 - 关于情绪、感觉与感性层面  
- 3号位置（宝剑牌组）：理性思维 - 关于理性、思维与关系层面
- 4号位置（金币牌组）：事业财务 - 关于感官、现实与物质层面
- 5号位置（大阿尔卡纳）：心灵成长 - 关于灵魂课题和精神成长

请用专业、温暖、富有洞察力的语言进行解读，避免过于绝对化的预言，而是提供启发性的指导。"""

    def _format_cards_for_prompt(self, reading: Dict[int, Card]) -> str:
        """
        将抽牌结果格式化为适合AI分析的文本
        
        Args:
            reading: 抽牌结果字典
            
        Returns:
            格式化后的卡牌信息文本
        """
        card_info = []
        position_names = {
            1: "1号位置（权杖牌组-行动力）",
            2: "2号位置（圣杯牌组-情感状态）", 
            3: "3号位置（宝剑牌组-理性思维）",
            4: "4号位置（金币牌组-事业财务）",
            5: "5号位置（大阿尔卡纳-心灵成长）"
        }
        
        for position in [5, 1, 2, 3, 4]:  # 按重要性排序
            card = reading[position]
            card_info.append(f"{position_names[position]}：{card.name}")
        
        return "\n".join(card_info)
    
    def analyze_reading(self, reading: Dict[int, Card], user_question: str = None) -> Dict[str, str]:
        """
        分析四季牌阵并生成详细解读
        
        Args:
            reading: 抽牌结果字典
            user_question: 用户的具体问题（已弃用，保留参数兼容性）
            
        Returns:
            包含各种分析结果的字典
        """
        cards_text = self._format_cards_for_prompt(reading)
        
        # 构建分析提示词（不再包含用户问题）
        question_part = ""
        
        prompt = f"""请对以下四季牌阵进行深度分析：

{cards_text}

请从以下几个方面分析接下来季节的能量流动：

1. 整体概述：这个牌阵传达的核心信息和季节主题
2. 逐位解读：每个位置的牌面含义及其对应生活层面的能量指导
3. 牌面关联：不同位置之间的相互关系和能量流动模式
4. 实用建议：基于牌阵给出的具体行动建议和注意事项
5. 灵性指引：这个季度的精神成长方向和内在智慧

请用专业而温暖的语言，为咨询者提供富有启发性的季节性指导。"""

        # 调用AI获取分析结果
        analysis = self._make_api_request(prompt)
        
        if analysis:
            return {
                "full_analysis": analysis,
                "cards_summary": cards_text,
                "status": "success"
            }
        else:
            return {
                "full_analysis": "抱歉，AI分析服务暂时不可用。请检查网络连接和API配置。",
                "cards_summary": cards_text,
                "status": "error"
            }
    
    def get_quick_insight(self, reading: Dict[int, Card]) -> str:
        """
        获取快速洞察，简短的一句话总结
        
        Args:
            reading: 抽牌结果字典
            
        Returns:
            简短的洞察文本
        """
        cards_text = self._format_cards_for_prompt(reading)
        
        prompt = f"""基于以下四季牌阵结果，请给出一句话的核心洞察：

{cards_text}

请用一句富有诗意和启发性的话语来概括这个牌阵的核心信息。"""

        insight = self._make_api_request(prompt, max_tokens=100)
        return insight if insight else "静心聆听内在的声音，答案会在适当的时候显现。"
    
    def get_seasonal_advice(self, reading: Dict[int, Card]) -> Dict[str, str]:
        """
        获取季节性建议，针对每个生活层面的具体指导
        
        Args:
            reading: 抽牌结果字典
            
        Returns:
            包含各个层面建议的字典
        """
        cards_text = self._format_cards_for_prompt(reading)
        
        prompt = f"""基于以下四季牌阵，请为每个生活层面提供简洁的季节性建议：

{cards_text}

请分别为以下五个方面给出1-2句具体的行动建议：
1. 行动力建议
2. 情感状态建议  
3. 理性思维建议
4. 事业财务建议
5. 心灵成长建议

格式要求：每个建议控制在50字以内，语言温暖而具有指导性。"""

        advice = self._make_api_request(prompt, max_tokens=800)
        
        if advice:
            return {
                "seasonal_advice": advice,
                "status": "success"
            }
        else:
            return {
                "seasonal_advice": "在这个特殊的时刻，相信自己的直觉，跟随内心的指引前行。",
                "status": "error"
            }

# 测试功能
if __name__ == "__main__":
    # 简单的测试
    print("=== AI塔罗牌分析器测试 ===")
    
    if not Config.is_configured():
        print("❌ 请先配置API密钥！")
        print("运行: python config.py 查看配置说明")
    else:
        print("✅ API配置已就绪")
        print("AI分析器初始化完成，可以在GUI中使用。")
