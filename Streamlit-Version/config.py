"""
四季牌阵AI分析配置文件
配置aihubmix API设置
"""

import os
from typing import Optional

class Config:
    """配置类，管理API设置和应用参数"""
    
    # aihubmix API配置
    API_BASE_URL: str = "https://aihubmix.com/v1"
    API_KEY: Optional[str] = None
    
    # 默认模型配置
    DEFAULT_MODEL: str = "gpt-4o-mini"
    
    # API请求参数
    MAX_TOKENS: int = 1500
    TEMPERATURE: float = 0.7
    
    # GUI配置
    WINDOW_TITLE: str = "四季牌阵 - AI智能分析"
    WINDOW_SIZE: tuple = (1200, 800)
    
    # 颜色主题
    COLORS = {
        "primary": "#2C3E50",      # 深蓝灰色
        "secondary": "#E74C3C",    # 红色
        "accent": "#F39C12",       # 橙色
        "background": "#ECF0F1",   # 浅灰色
        "text": "#2C3E50",         # 深色文字
        "card_bg": "#FFFFFF",      # 卡牌背景
        "button": "#3498DB",       # 按钮颜色
        "button_hover": "#2980B9", # 按钮悬停色
    }
    
    @classmethod
    def load_from_env(cls):
        """从环境变量加载配置"""
        cls.API_KEY = os.getenv('AIHUBMIX_API_KEY')
        
        # 可选的环境变量覆盖
        if os.getenv('AIHUBMIX_BASE_URL'):
            cls.API_BASE_URL = os.getenv('AIHUBMIX_BASE_URL')
        
        if os.getenv('AIHUBMIX_MODEL'):
            cls.DEFAULT_MODEL = os.getenv('AIHUBMIX_MODEL')
    
    @classmethod
    def set_api_key(cls, api_key: str):
        """设置API密钥"""
        cls.API_KEY = api_key
    
    @classmethod
    def is_configured(cls) -> bool:
        """检查是否已正确配置API密钥"""
        return cls.API_KEY is not None and cls.API_KEY.strip() != ""
    
    @classmethod
    def get_api_headers(cls) -> dict:
        """获取API请求头"""
        if not cls.is_configured():
            raise ValueError("API密钥未设置，请先配置aihubmix API密钥")
        
        return {
            "Authorization": f"Bearer {cls.API_KEY}",
            "Content-Type": "application/json"
        }

# 在模块导入时自动尝试从环境变量加载配置
Config.load_from_env()

# 示例配置文件内容，用户可以取消注释并填入自己的API密钥
EXAMPLE_CONFIG = """
# 将你的aihubmix API密钥填入下方
# API_KEY = "your_aihubmix_api_key_here"

# 或者设置环境变量：
# export AIHUBMIX_API_KEY="your_aihubmix_api_key_here"

# 可选配置：
# API_BASE_URL = "https://aihubmix.com/v1"  # 自定义API端点
# DEFAULT_MODEL = "gpt-3.5-turbo"          # 使用的默认模型
"""

if __name__ == "__main__":
    # 配置检查脚本
    print("=== 四季牌阵AI分析配置检查 ===")
    print(f"API基础URL: {Config.API_BASE_URL}")
    print(f"默认模型: {Config.DEFAULT_MODEL}")
    print(f"API密钥状态: {'已配置' if Config.is_configured() else '未配置'}")
    
    if not Config.is_configured():
        print("\n❌ 请配置你的aihubmix API密钥！")
        print("方式1: 设置环境变量")
        print("export AIHUBMIX_API_KEY='your_api_key_here'")
        print("\n方式2: 直接在代码中设置")
        print("Config.set_api_key('your_api_key_here')")
        print("\n配置完成后重新运行此脚本进行验证。")
    else:
        print("✅ 配置检查通过！可以使用AI分析功能。")
