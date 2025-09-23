# 导入所需的库
from enum import Enum  # 用于创建枚举类型
import random  # 用于随机选择和洗牌

# 定义大阿尔卡那牌的枚举
class MajorArcana(Enum):
    """
    包含22张大阿尔卡那牌的枚举。
    每张牌都有一个唯一的名称和对应的整数值。
    """
    愚人 = 0
    魔术师 = 1
    女祭司 = 2
    女皇 = 3
    皇帝 = 4
    教皇 = 5
    恋人 = 6
    战车 = 7
    力量 = 8
    隐士 = 9
    命运之轮 = 10
    正义 = 11
    倒吊人 = 12
    死神 = 13
    节制 = 14
    恶魔 = 15
    高塔 = 16
    星星 = 17
    月亮 = 18
    太阳 = 19
    审判 = 20
    世界 = 21

# 定义小阿尔卡那牌的枚举
class MinorArcana(Enum):
    """
    包含56张小阿尔卡那牌的枚举，分为四个牌组：权杖、圣杯、宝剑和金币。
    """
    # 权杖牌 (Wands) - 代表能量、行动和创造力
    权杖一 = "权杖一"
    权杖二 = "权杖二"
    权杖三 = "权杖三"
    权杖四 = "权杖四"
    权杖五 = "权杖五"
    权杖六 = "权杖六"
    权杖七 = "权杖七"
    权杖八 = "权杖八"
    权杖九 = "权杖九"
    权杖十 = "权杖十"
    权杖侍从 = "权杖侍从"
    权杖骑士 = "权杖骑士"
    权杖皇后 = "权杖皇后"
    权杖国王 = "权杖国王"
    
    # 圣杯牌 (Cups) - 代表情感、关系和直觉
    圣杯一 = "圣杯一"
    圣杯二 = "圣杯二"
    圣杯三 = "圣杯三"
    圣杯四 = "圣杯四"
    圣杯五 = "圣杯五"
    圣杯六 = "圣杯六"
    圣杯七 = "圣杯七"
    圣杯八 = "圣杯八"
    圣杯九 = "圣杯九"
    圣杯十 = "圣杯十"
    圣杯侍从 = "圣杯侍从"
    圣杯骑士 = "圣杯骑士"
    圣杯皇后 = "圣杯皇后"
    圣杯国王 = "圣杯国王"
    
    # 宝剑牌 (Swords) - 代表思想、挑战和决策
    宝剑一 = "宝剑一"
    宝剑二 = "宝剑二"
    宝剑三 = "宝剑三"
    宝剑四 = "宝剑四"
    宝剑五 = "宝剑五"
    宝剑六 = "宝剑六"
    宝剑七 = "宝剑七"
    宝剑八 = "宝剑八"
    宝剑九 = "宝剑九"
    宝剑十 = "宝剑十"
    宝剑侍从 = "宝剑侍从"
    宝剑骑士 = "宝剑骑士"
    宝剑皇后 = "宝剑皇后"
    宝剑国王 = "宝剑国王"
    
    # 金币牌 (Pentacles) - 代表物质、财富和事业
    金币一 = "金币一"
    金币二 = "金币二"
    金币三 = "金币三"
    金币四 = "金币四"
    金币五 = "金币五"
    金币六 = "金币六"
    金币七 = "金币七"
    金币八 = "金币八"
    金币九 = "金币九"
    金币十 = "金币十"
    金币侍从 = "金币侍从"
    金币骑士 = "金币骑士"
    金币皇后 = "金币皇后"
    金币国王 = "金币国王"

# 定义卡牌类
class Card:
    """
    代表一张塔罗牌，包含牌的枚举成员和是否逆位的信息。
    """
    def __init__(self, card_enum, is_reversed=False):
        """
        初始化一张牌。
        :param card_enum: 牌的枚举成员 (来自 MajorArcana 或 MinorArcana)
        :param is_reversed: 布尔值，表示牌是否为逆位
        """
        self.card = card_enum
        self.is_reversed = is_reversed
    
    @property
    def name(self):
        """
        获取卡牌的完整名称，包括正位或逆位状态。
        :return: 字符串，例如 "魔术师 (正位)" 或 "权杖一 (逆位)"
        """
        # 根据牌的类型获取基础名称
        if isinstance(self.card, MajorArcana):
            base_name = self.card.name
        else:
            base_name = self.card.value
        # 判断并添加正逆位标识
        position = "逆位" if self.is_reversed else "正位"
        return f"{base_name} ({position})"

# 初始化塔罗牌牌组
def initialize_tarot_decks():
    """
    创建并分类所有的塔罗牌。
    :return: 一个元组，包含五个列表：大阿尔卡那，权杖，圣杯，宝剑和金币。
    """
    # 创建大阿尔卡那牌组
    major_arcana = list(MajorArcana)
    
    # 创建小阿尔卡那牌组并按花色分类
    minor_arcana = list(MinorArcana)
    wands = [card for card in minor_arcana if card.value.startswith('权杖')]
    cups = [card for card in minor_arcana if card.value.startswith('圣杯')]
    swords = [card for card in minor_arcana if card.value.startswith('宝剑')]
    pentacles = [card for card in minor_arcana if card.value.startswith('金币')]
    
    return major_arcana, wands, cups, swords, pentacles

# 从牌组中抽一张牌
def draw_card(deck):
    """
    从指定的牌组中抽取最上面的一张牌，并随机决定其正逆位。
    :param deck: 一个卡牌列表
    :return: 一个 Card 对象
    """
    card_enum = deck.pop()  # 从牌组中移除并返回最后一张牌
    is_reversed = random.choice([True, False])  # 随机决定正位或逆位
    return Card(card_enum, is_reversed)

# 洗牌并抽取一个完整的牌阵
def shuffle_and_draw():
    """
    执行完整的抽牌流程：初始化牌组，洗牌，然后抽取一个"四季牌阵"。
    :return: 一个字典，包含五张抽出的牌，对应牌阵中的五个位置。
    """
    major_arcana, wands, cups, swords, pentacles = initialize_tarot_decks()
    
    # 分别洗乱每个牌组
    random.shuffle(major_arcana)
    random.shuffle(wands)
    random.shuffle(cups)
    random.shuffle(swords)
    random.shuffle(pentacles)
    
    # 按照"四季牌阵"的规则从不同牌组中抽取牌
    # 1号位（春）：权杖，代表能量和新开始
    # 2号位（夏）：圣杯，代表情感和关系
    # 3号位（秋）：宝剑，代表思想和挑战
    # 4号位（冬）：金币，代表物质和收获
    # 5号位（核心）：大阿尔卡那，代表核心主题和灵性指引
    reading = {
        1: draw_card(wands),      
        2: draw_card(cups),       
        3: draw_card(swords),     
        4: draw_card(pentacles),  
        5: draw_card(major_arcana) 
    }
    
    return reading

# 显示抽牌结果
def display_reading():
    """
    执行抽牌并以可读的格式打印出"四季牌阵"的结果。
    按照正确的牌阵布局显示：
          4
      1   5   3
          2
    """
    reading = shuffle_and_draw()
    
    print("\n=== 四季牌阵 ===")
    print()
    print(f"            4号位置 (事业财富)")
    print(f"            {reading[4].name}")
    print()
    print(f"1号位置 (能量和能力)        5号位置 (灵性成长)        3号位置 (思考能力)")
    print(f"{reading[1].name}        {reading[5].name}        {reading[3].name}")
    print()  
    print(f"            2号位置 (情感状况)")
    print(f"            {reading[2].name}")

# 主程序入口
if __name__ == "__main__":
    print("今天是秋分，让我们来抽取四季牌阵...")
    display_reading()
