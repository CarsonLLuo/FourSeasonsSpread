#!/usr/bin/env python3
"""
四季牌阵AI分析演示脚本
展示如何在命令行中使用AI分析功能
"""

from config import Config
from ai_analyzer import TarotAIAnalyzer
from 四季牌阵 import shuffle_and_draw

def demo_ai_analysis():
    """演示AI分析功能"""
    print("🔮 四季牌阵AI分析演示")
    print("="*40)
    
    # 检查API配置
    if not Config.is_configured():
        print("❌ 请先配置aihubmix API密钥")
        print("方法1：设置环境变量 AIHUBMIX_API_KEY")
        print("方法2：运行以下代码配置：")
        print("from config import Config")
        print("Config.set_api_key('your_api_key_here')")
        return
    
    print("✅ API配置检查通过")
    
    # 抽取四季牌阵
    print("\n📜 正在抽取四季牌阵...")
    reading = shuffle_and_draw()
    
    # 显示抽牌结果
    print("\n=== 四季牌阵结果 ===")
    position_names = {
        1: "1号位置 (行动力)",
        2: "2号位置 (情感状态)", 
        3: "3号位置 (理性思维)",
        4: "4号位置 (事业财务)",
        5: "5号位置 (心灵成长)"
    }
    
    for position in [5, 1, 2, 3, 4]:
        card = reading[position]
        print(f"{position_names[position]}：{card.name}")
    
    # 初始化AI分析器
    print("\n🤖 正在初始化AI分析器...")
    analyzer = TarotAIAnalyzer()
    
    # 获取快速洞察
    print("\n💡 正在获取核心洞察...")
    try:
        insight = analyzer.get_quick_insight(reading)
        print(f"\n✨ 核心洞察：{insight}")
    except Exception as e:
        print(f"❌ 获取洞察失败：{e}")
    
    # 获取季节建议
    print("\n🌟 正在获取季节建议...")
    try:
        advice_result = analyzer.get_seasonal_advice(reading)
        if advice_result["status"] == "success":
            print(f"\n{advice_result['seasonal_advice']}")
        else:
            print("❌ 获取建议失败")
    except Exception as e:
        print(f"❌ 获取建议失败：{e}")
    
    # 询问是否需要详细分析
    print("\n" + "="*40)
    user_input = input("是否需要完整的AI详细分析？(y/n): ").strip().lower()
    
    if user_input in ['y', 'yes', '是', '好']:
        # 获取用户问题
        question = input("请输入你的具体问题（可选，按回车跳过）: ").strip()
        
        print("\n📝 正在进行详细分析，请稍候...")
        try:
            analysis_result = analyzer.analyze_reading(reading, question)
            if analysis_result["status"] == "success":
                print("\n" + "="*50)
                print("🔮 AI详细分析结果")
                print("="*50)
                print(analysis_result["full_analysis"])
            else:
                print("❌ 详细分析失败")
        except Exception as e:
            print(f"❌ 详细分析失败：{e}")
    
    print("\n✨ 分析完成！感谢使用四季牌阵AI占卜系统。")

if __name__ == "__main__":
    try:
        demo_ai_analysis()
    except KeyboardInterrupt:
        print("\n\n程序被用户中断")
    except Exception as e:
        print(f"\n❌ 程序运行出错：{e}")
        print("请检查网络连接和API配置")
