"""
四季牌阵Streamlit Web应用程序
现代化的Web界面，支持AI智能分析
"""

import streamlit as st
import pandas as pd
from datetime import datetime
import time
from typing import Dict, Optional
import asyncio
import threading

from config import Config
from ai_analyzer import TarotAIAnalyzer
from 四季牌阵 import shuffle_and_draw, Card

# 页面配置
st.set_page_config(
    page_title="🔮 四季牌阵 - AI智能占卜",
    page_icon="🔮",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 自定义CSS样式
st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 2rem 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    
    .card-container {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 15px;
        margin: 1rem 0;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    
    .card-position {
        font-size: 0.9rem;
        color: #666;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    
    .card-name {
        font-size: 1.1rem;
        font-weight: bold;
        color: #333;
        background: white;
        padding: 1rem;
        border-radius: 8px;
        border: 2px solid #ddd;
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .card-empty {
        color: #999;
        background: #f8f9fa;
        border: 2px dashed #ddd;
        font-style: italic;
    }
    
    .core-card {
        background: linear-gradient(135deg, #74b9ff, #0984e3);
        color: white;
        border-color: #0984e3 !important;
    }
    
    .status-success {
        color: #00b894;
        font-weight: bold;
    }
    
    .status-warning {
        color: #fdcb6e;
        font-weight: bold;
    }
    
    .status-error {
        color: #e17055;
        font-weight: bold;
    }
    
    .analysis-section {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin: 1rem 0;
    }
    
    /* 增强抽牌按钮样式 */
    .stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
        border: none !important;
        color: white !important;
        font-weight: bold !important;
        font-size: 1.2rem !important;
        padding: 1rem 2rem !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3) !important;
        transition: all 0.3s ease !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
    }
    
    .stButton > button[kind="primary"]:hover {
        background: linear-gradient(135deg, #c0392b, #a93226) !important;
        box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4) !important;
        transform: translateY(-2px) !important;
    }
    
    .stButton > button[kind="primary"]:active {
        transform: translateY(0px) !important;
        box-shadow: 0 2px 10px rgba(231, 76, 60, 0.3) !important;
    }
    
    /* 脉冲动画效果 */
    @keyframes pulse {
        0% { box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3); }
        50% { box-shadow: 0 4px 20px rgba(231, 76, 60, 0.5); }
        100% { box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3); }
    }
    
    .stButton > button[kind="primary"] {
        animation: pulse 2s infinite;
    }
</style>
""", unsafe_allow_html=True)

class StreamlitTarotApp:
    """Streamlit四季牌阵应用程序类"""
    
    def __init__(self):
        """初始化应用程序"""
        self.analyzer = TarotAIAnalyzer()
        self.initialize_session_state()
    
    def initialize_session_state(self):
        """初始化会话状态"""
        if 'current_reading' not in st.session_state:
            st.session_state.current_reading = None
        if 'api_configured' not in st.session_state:
            st.session_state.api_configured = Config.is_configured()
        if 'analysis_results' not in st.session_state:
            st.session_state.analysis_results = None
        if 'user_question' not in st.session_state:
            st.session_state.user_question = ""
    
    def safe_rerun(self):
        """安全的重新运行方法，兼容不同版本的Streamlit"""
        try:
            if hasattr(st, 'experimental_rerun'):
                st.experimental_rerun()
            elif hasattr(st, 'rerun'):
                st.rerun()
            else:
                # 如果都不可用，使用query params触发重新加载
                st.experimental_set_query_params(refresh=str(time.time()))
        except Exception as e:
            st.warning(f"页面刷新失败，请手动刷新浏览器: {e}")
    
    def render_header(self):
        """渲染页面标题"""
        st.markdown("""
        <div class="main-header">
            <h1>🔮 四季牌阵 - AI智能占卜 🔮</h1>
            <p>传统塔罗智慧与现代AI技术的完美结合</p>
        </div>
        """, unsafe_allow_html=True)
    
    def render_sidebar(self):
        """渲染侧边栏配置"""
        st.sidebar.header("⚙️ 配置设置")
        
        # API配置状态
        if st.session_state.api_configured:
            st.sidebar.success("✅ AI分析已就绪")
        else:
            st.sidebar.warning("⚠️ 需要配置API密钥")
        
        # API配置区域
        with st.sidebar.expander("🔑 API配置", expanded=not st.session_state.api_configured):
            api_key = st.text_input(
                "aihubmix API密钥",
                type="password",
                help="请输入您的aihubmix API密钥"
            )
            
            model = st.selectbox(
                "AI模型选择",
                options=["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo-preview"],
                index=0,
                help="选择用于分析的AI模型"
            )
            
            if st.button("💾 保存配置"):
                if api_key:
                    Config.set_api_key(api_key)
                    Config.DEFAULT_MODEL = model
                    st.session_state.api_configured = True
                    st.sidebar.success("配置保存成功！")
                    time.sleep(0.5)  # 让用户看到成功消息
                    self.safe_rerun()
                else:
                    st.sidebar.error("请输入有效的API密钥")
        
        # 使用说明
        with st.sidebar.expander("📖 使用说明"):
            st.markdown("""
            **四季牌阵特殊性：**
            - 传统上仅在四个节气使用（春分、夏至、秋分、冬至）
            - 这四天是能量转换的关键时刻
            
            **使用步骤：**
            1. 点击"抽取四季牌阵"
            2. 查看牌阵结果
            3. 输入问题（可选）
            4. 点击"AI智能分析"
            
            **牌阵布局：**
            - 1号位：行动力（权杖）
            - 2号位：情感状态（圣杯）
            - 3号位：理性思维（宝剑）
            - 4号位：事业财务（金币）
            - 5号位：灵性成长（大阿尔卡纳）
            """)
    
    def render_card_layout(self):
        """渲染牌阵布局"""
        st.subheader("🎴 四季牌阵")
        
        if st.session_state.current_reading is None:
            st.info("点击下方按钮开始抽牌")
            # 显示空牌阵
            self.render_empty_layout()
        else:
            # 显示已抽取的牌阵
            self.render_active_layout()
    
    def render_empty_layout(self):
        """渲染空牌阵布局"""
        st.markdown("### 💫 你的四季牌阵正在等待...")
        
        # 使用列布局创建十字形排列
        col1, col2, col3 = st.columns([1, 1, 1])
        
        # 上排（4号位置）
        with col2:
            st.markdown("""
            <div class="card-container">
                <div class="card-position">4号位置 (事业财务)</div>
                <div class="card-name card-empty">📊 待揭示</div>
            </div>
            """, unsafe_allow_html=True)
        
        # 中排（1、5、3号位置）
        col1, col2, col3 = st.columns([1, 1, 1])
        with col1:
            st.markdown("""
            <div class="card-container">
                <div class="card-position">1号位置 (行动力)</div>
                <div class="card-name card-empty">⚡ 待揭示</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown("""
            <div class="card-container">
                <div class="card-position">5号位置 (灵性成长)</div>
                <div class="card-name card-empty">✨ 核心奥秘</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown("""
            <div class="card-container">
                <div class="card-position">3号位置 (理性思维)</div>
                <div class="card-name card-empty">🧠 待揭示</div>
            </div>
            """, unsafe_allow_html=True)
        
        # 下排（2号位置）
        col1, col2, col3 = st.columns([1, 1, 1])
        with col2:
            st.markdown("""
            <div class="card-container">
                <div class="card-position">2号位置 (情感状态)</div>
                <div class="card-name card-empty">💝 待揭示</div>
            </div>
            """, unsafe_allow_html=True)
    
    def render_active_layout(self):
        """渲染已抽取的牌阵布局"""
        reading = st.session_state.current_reading
        
        # 上排（4号位置）
        col1, col2, col3 = st.columns([1, 1, 1])
        with col2:
            st.markdown(f"""
            <div class="card-container">
                <div class="card-position">4号位置 (事业财务)</div>
                <div class="card-name">{reading[4].name}</div>
            </div>
            """, unsafe_allow_html=True)
        
        # 中排（1、5、3号位置）
        col1, col2, col3 = st.columns([1, 1, 1])
        with col1:
            st.markdown(f"""
            <div class="card-container">
                <div class="card-position">1号位置 (行动力)</div>
                <div class="card-name">{reading[1].name}</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"""
            <div class="card-container">
                <div class="card-position">5号位置 (灵性成长)</div>
                <div class="card-name core-card">{reading[5].name}</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown(f"""
            <div class="card-container">
                <div class="card-position">3号位置 (理性思维)</div>
                <div class="card-name">{reading[3].name}</div>
            </div>
            """, unsafe_allow_html=True)
        
        # 下排（2号位置）
        col1, col2, col3 = st.columns([1, 1, 1])
        with col2:
            st.markdown(f"""
            <div class="card-container">
                <div class="card-position">2号位置 (情感状态)</div>
                <div class="card-name">{reading[2].name}</div>
            </div>
            """, unsafe_allow_html=True)
        
        # 显示抽牌时间
        st.caption(f"抽牌时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    def render_control_panel(self):
        """渲染控制面板"""
        st.subheader("🎯 开始占卜")
        
        # 主要抽牌按钮区域 - 使用更大的布局
        if st.session_state.current_reading is None:
            # 如果还没有抽牌，显示大的抽牌按钮
            st.markdown("### 🔮 准备好了吗？点击下方红色按钮开始你的四季牌阵占卜")
            
            # 创建一个居中的大按钮
            col1, col2, col3 = st.columns([1, 2, 1])
            with col2:
                if st.button("🔮 开始抽取四季牌阵 🔮", 
                           type="primary", 
                           use_container_width=True,
                           help="一键抽取完整的四季牌阵（5张牌）"):
                    self.draw_cards()
            
            st.markdown("---")
            st.info("💡 点击上方按钮将同时抽取所有5张牌，无需多次点击")
            
        else:
            # 如果已经抽牌，显示分析和重新抽牌选项
            st.success("✅ 四季牌阵已抽取完成！")
            
            # 分析和重新抽牌按钮
            col1, col2 = st.columns(2)
            
            with col1:
                api_enabled = st.session_state.api_configured
                if st.button("🤖 AI智能分析", 
                           disabled=not api_enabled,
                           use_container_width=True,
                           type="secondary"):
                    self.start_ai_analysis()
            
            with col2:
                if st.button("🔄 重新抽牌", 
                           use_container_width=True):
                    st.session_state.current_reading = None
                    st.session_state.analysis_results = None
                    self.safe_rerun()
            
            # 状态提示
            if not st.session_state.api_configured:
                st.warning("⚠️ 请在侧边栏配置API密钥以使用AI分析功能")
            else:
                st.info("💡 可以进行AI智能分析，或重新抽牌开始新的占卜")
        
        # 可选的用户问题输入（折叠状态）
        with st.expander("🤔 想要针对特定问题占卜？（可选）", expanded=False):
            user_question = st.text_area(
                "输入你的具体问题",
                value=st.session_state.user_question,
                height=80,
                help="如果有特定问题，AI分析时会结合你的问题给出更精准的建议",
                placeholder="例如：我在感情方面应该注意什么？"
            )
            st.session_state.user_question = user_question
    
    def draw_cards(self):
        """抽取四季牌阵"""
        try:
            # 显示开始信息
            st.info("🎲 准备抽取四季牌阵...")
            
            # 导入模块调试
            try:
                from 四季牌阵 import shuffle_and_draw, Card
                st.success("✅ 模块导入成功")
            except ImportError as e:
                st.error(f"❌ 模块导入失败: {e}")
                return
            
            with st.spinner("🎲 正在抽取四季牌阵..."):
                time.sleep(1)  # 增加仪式感
                
                # 调用抽牌函数
                st.info("📝 调用 shuffle_and_draw() 函数...")
                reading = shuffle_and_draw()
                st.info(f"📝 抽牌函数返回: {type(reading)}")
                
                # 确保reading不为空
                if not reading:
                    raise ValueError("抽牌结果为空")
                
                st.info(f"📝 抽取到的牌阵包含 {len(reading)} 张牌")
                
                # 验证reading包含所有必需的位置
                required_positions = [1, 2, 3, 4, 5]
                for pos in required_positions:
                    if pos not in reading:
                        raise ValueError(f"缺少{pos}号位置的牌")
                    else:
                        st.info(f"📝 位置 {pos}: {reading[pos].name}")
                
                # 更新session state
                st.session_state.current_reading = reading
                st.session_state.analysis_results = None
                
                st.success("✅ Session state 更新成功")
            
            st.success("✅ 抽牌完成！")
            st.balloons()
            
            # 强制重新运行以更新界面
            time.sleep(1)
            self.safe_rerun()
            
        except Exception as e:
            st.error(f"❌ 抽牌失败: {str(e)}")
            import traceback
            st.error(f"详细错误: {traceback.format_exc()}")
            # 重置状态
            st.session_state.current_reading = None
            st.session_state.analysis_results = None
    
    def start_ai_analysis(self):
        """开始AI分析"""
        if not st.session_state.current_reading:
            st.error("请先抽牌")
            return
        
        if not st.session_state.api_configured:
            st.error("请先配置API密钥")
            return
        
        try:
            with st.spinner("🤖 AI正在分析中，请稍候..."):
                # 获取分析结果
                analysis_result = self.analyzer.analyze_reading(
                    st.session_state.current_reading, 
                    st.session_state.user_question
                )
                
                insight = self.analyzer.get_quick_insight(st.session_state.current_reading)
                advice_result = self.analyzer.get_seasonal_advice(st.session_state.current_reading)
                
                st.session_state.analysis_results = {
                    'full_analysis': analysis_result.get("full_analysis", "分析失败"),
                    'insight': insight,
                    'seasonal_advice': advice_result.get("seasonal_advice", "建议获取失败"),
                    'timestamp': datetime.now()
                }
            
            st.success("✅ AI分析完成！")
            time.sleep(0.5)
            self.safe_rerun()
            
        except Exception as e:
            st.error(f"❌ AI分析失败: {str(e)}")
            import traceback
            st.error(f"详细错误: {traceback.format_exc()}")
    
    def render_analysis_results(self):
        """渲染分析结果"""
        if st.session_state.analysis_results is None:
            return
        
        results = st.session_state.analysis_results
        
        st.subheader("🔮 AI分析结果")
        
        # 创建标签页
        tab1, tab2, tab3 = st.tabs(["📝 详细分析", "💡 核心洞察", "🌟 季节建议"])
        
        with tab1:
            st.markdown('<div class="analysis-section">', unsafe_allow_html=True)
            st.write(results['full_analysis'])
            st.markdown('</div>', unsafe_allow_html=True)
        
        with tab2:
            st.markdown('<div class="analysis-section">', unsafe_allow_html=True)
            st.info(f"✨ {results['insight']}")
            st.markdown('</div>', unsafe_allow_html=True)
        
        with tab3:
            st.markdown('<div class="analysis-section">', unsafe_allow_html=True)
            st.write(results['seasonal_advice'])
            st.markdown('</div>', unsafe_allow_html=True)
        
        # 显示分析时间
        st.caption(f"分析时间: {results['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 导出功能
        if st.button("📥 导出分析结果"):
            self.export_results()
    
    def export_results(self):
        """导出分析结果"""
        if not st.session_state.analysis_results or not st.session_state.current_reading:
            return
        
        results = st.session_state.analysis_results
        reading = st.session_state.current_reading
        
        # 创建导出内容
        export_content = f"""
=== 四季牌阵占卜结果 ===
时间: {results['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}

=== 牌阵结果 ===
1号位置 (行动力): {reading[1].name}
2号位置 (情感状态): {reading[2].name}
3号位置 (理性思维): {reading[3].name}
4号位置 (事业财务): {reading[4].name}
5号位置 (灵性成长): {reading[5].name}

=== 用户问题 ===
{st.session_state.user_question if st.session_state.user_question else '无'}

=== 核心洞察 ===
{results['insight']}

=== 详细分析 ===
{results['full_analysis']}

=== 季节建议 ===
{results['seasonal_advice']}

=== 免责声明 ===
本分析结果仅供参考，请结合实际情况理性对待。
        """
        
        st.download_button(
            label="下载分析报告 (.txt)",
            data=export_content,
            file_name=f"四季牌阵分析_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt",
            mime="text/plain"
        )
    
    def run(self):
        """运行应用程序"""
        # 渲染页面组件
        self.render_header()
        self.render_sidebar()
        
        # 主内容区域
        self.render_card_layout()
        
        st.divider()
        
        self.render_control_panel()
        
        st.divider()
        
        self.render_analysis_results()
        
        # 页脚
        st.markdown("---")
        st.markdown("""
        <div style='text-align: center; color: #666; font-size: 0.9rem;'>
            🔮 四季牌阵 - AI智能占卜系统 | 
            基于传统塔罗智慧与现代AI技术 | 
            仅供娱乐和自我反思使用
        </div>
        """, unsafe_allow_html=True)

def main():
    """主函数"""
    app = StreamlitTarotApp()
    app.run()

if __name__ == "__main__":
    main()
