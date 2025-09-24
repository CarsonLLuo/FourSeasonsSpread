/**
 * 塔罗牌模型
 * 从Python版本迁移到JavaScript
 */

// 大阿尔卡纳枚举
const MajorArcana = {
  愚人: { id: 0, name: '愚人' },
  魔术师: { id: 1, name: '魔术师' },
  女祭司: { id: 2, name: '女祭司' },
  女皇: { id: 3, name: '女皇' },
  皇帝: { id: 4, name: '皇帝' },
  教皇: { id: 5, name: '教皇' },
  恋人: { id: 6, name: '恋人' },
  战车: { id: 7, name: '战车' },
  力量: { id: 8, name: '力量' },
  隐士: { id: 9, name: '隐士' },
  命运之轮: { id: 10, name: '命运之轮' },
  正义: { id: 11, name: '正义' },
  倒吊人: { id: 12, name: '倒吊人' },
  死神: { id: 13, name: '死神' },
  节制: { id: 14, name: '节制' },
  恶魔: { id: 15, name: '恶魔' },
  高塔: { id: 16, name: '高塔' },
  星星: { id: 17, name: '星星' },
  月亮: { id: 18, name: '月亮' },
  太阳: { id: 19, name: '太阳' },
  审判: { id: 20, name: '审判' },
  世界: { id: 21, name: '世界' }
};

// 小阿尔卡纳枚举
const MinorArcana = {
  // 权杖牌组
  权杖一: { suit: 'wands', rank: 1, name: '权杖一' },
  权杖二: { suit: 'wands', rank: 2, name: '权杖二' },
  权杖三: { suit: 'wands', rank: 3, name: '权杖三' },
  权杖四: { suit: 'wands', rank: 4, name: '权杖四' },
  权杖五: { suit: 'wands', rank: 5, name: '权杖五' },
  权杖六: { suit: 'wands', rank: 6, name: '权杖六' },
  权杖七: { suit: 'wands', rank: 7, name: '权杖七' },
  权杖八: { suit: 'wands', rank: 8, name: '权杖八' },
  权杖九: { suit: 'wands', rank: 9, name: '权杖九' },
  权杖十: { suit: 'wands', rank: 10, name: '权杖十' },
  权杖侍从: { suit: 'wands', rank: 'page', name: '权杖侍从' },
  权杖骑士: { suit: 'wands', rank: 'knight', name: '权杖骑士' },
  权杖皇后: { suit: 'wands', rank: 'queen', name: '权杖皇后' },
  权杖国王: { suit: 'wands', rank: 'king', name: '权杖国王' },

  // 圣杯牌组
  圣杯一: { suit: 'cups', rank: 1, name: '圣杯一' },
  圣杯二: { suit: 'cups', rank: 2, name: '圣杯二' },
  圣杯三: { suit: 'cups', rank: 3, name: '圣杯三' },
  圣杯四: { suit: 'cups', rank: 4, name: '圣杯四' },
  圣杯五: { suit: 'cups', rank: 5, name: '圣杯五' },
  圣杯六: { suit: 'cups', rank: 6, name: '圣杯六' },
  圣杯七: { suit: 'cups', rank: 7, name: '圣杯七' },
  圣杯八: { suit: 'cups', rank: 8, name: '圣杯八' },
  圣杯九: { suit: 'cups', rank: 9, name: '圣杯九' },
  圣杯十: { suit: 'cups', rank: 10, name: '圣杯十' },
  圣杯侍从: { suit: 'cups', rank: 'page', name: '圣杯侍从' },
  圣杯骑士: { suit: 'cups', rank: 'knight', name: '圣杯骑士' },
  圣杯皇后: { suit: 'cups', rank: 'queen', name: '圣杯皇后' },
  圣杯国王: { suit: 'cups', rank: 'king', name: '圣杯国王' },

  // 宝剑牌组
  宝剑一: { suit: 'swords', rank: 1, name: '宝剑一' },
  宝剑二: { suit: 'swords', rank: 2, name: '宝剑二' },
  宝剑三: { suit: 'swords', rank: 3, name: '宝剑三' },
  宝剑四: { suit: 'swords', rank: 4, name: '宝剑四' },
  宝剑五: { suit: 'swords', rank: 5, name: '宝剑五' },
  宝剑六: { suit: 'swords', rank: 6, name: '宝剑六' },
  宝剑七: { suit: 'swords', rank: 7, name: '宝剑七' },
  宝剑八: { suit: 'swords', rank: 8, name: '宝剑八' },
  宝剑九: { suit: 'swords', rank: 9, name: '宝剑九' },
  宝剑十: { suit: 'swords', rank: 10, name: '宝剑十' },
  宝剑侍从: { suit: 'swords', rank: 'page', name: '宝剑侍从' },
  宝剑骑士: { suit: 'swords', rank: 'knight', name: '宝剑骑士' },
  宝剑皇后: { suit: 'swords', rank: 'queen', name: '宝剑皇后' },
  宝剑国王: { suit: 'swords', rank: 'king', name: '宝剑国王' },

  // 金币牌组
  金币一: { suit: 'pentacles', rank: 1, name: '金币一' },
  金币二: { suit: 'pentacles', rank: 2, name: '金币二' },
  金币三: { suit: 'pentacles', rank: 3, name: '金币三' },
  金币四: { suit: 'pentacles', rank: 4, name: '金币四' },
  金币五: { suit: 'pentacles', rank: 5, name: '金币五' },
  金币六: { suit: 'pentacles', rank: 6, name: '金币六' },
  金币七: { suit: 'pentacles', rank: 7, name: '金币七' },
  金币八: { suit: 'pentacles', rank: 8, name: '金币八' },
  金币九: { suit: 'pentacles', rank: 9, name: '金币九' },
  金币十: { suit: 'pentacles', rank: 10, name: '金币十' },
  金币侍从: { suit: 'pentacles', rank: 'page', name: '金币侍从' },
  金币骑士: { suit: 'pentacles', rank: 'knight', name: '金币骑士' },
  金币皇后: { suit: 'pentacles', rank: 'queen', name: '金币皇后' },
  金币国王: { suit: 'pentacles', rank: 'king', name: '金币国王' }
};

/**
 * 塔罗牌类
 */
class Card {
  constructor(cardData, isReversed = false) {
    this.cardData = cardData;
    this.isReversed = isReversed;
  }

  /**
   * 获取牌面完整名称
   */
  get name() {
    const position = this.isReversed ? '逆位' : '正位';
    return `${this.cardData.name} (${position})`;
  }

  /**
   * 获取牌面基础名称（不含正逆位）
   */
  get baseName() {
    return this.cardData.name;
  }

  /**
   * 判断是否为大阿尔卡纳
   */
  get isMajorArcana() {
    return this.cardData.hasOwnProperty('id');
  }

  /**
   * 获取牌组（仅小阿尔卡纳）
   */
  get suit() {
    return this.isMajorArcana ? null : this.cardData.suit;
  }

  /**
   * 获取塔罗牌图片URL
   */
  get imageUrl() {
    // 使用多个图片源作为备选
    return this.getImageFromMultipleSources();
  }

  /**
   * 从多个图片源获取塔罗牌图片
   */
  getImageFromMultipleSources() {
    // 主要使用 RWS 塔罗牌图片 API
    const primaryUrl = this.getRWSImageUrl();
    
    // 如果主要源不可用，使用备用源
    const fallbackUrl = this.getFallbackImageUrl();
    
    return primaryUrl;
  }

  /**
   * 获取 RWS (Rider-Waite-Smith) 图片URL
   */
  getRWSImageUrl() {
    // 使用标准的RWS塔罗牌图片命名规则
    if (this.isMajorArcana) {
      // 大阿尔卡纳: 00-愚人, 01-魔术师, ..., 21-世界
      const cardNames = {
        0: 'fool', 1: 'magician', 2: 'high_priestess', 3: 'empress', 4: 'emperor',
        5: 'hierophant', 6: 'lovers', 7: 'chariot', 8: 'strength', 9: 'hermit',
        10: 'wheel_of_fortune', 11: 'justice', 12: 'hanged_man', 13: 'death',
        14: 'temperance', 15: 'devil', 16: 'tower', 17: 'star', 18: 'moon',
        19: 'sun', 20: 'judgement', 21: 'world'
      };
      const cardName = cardNames[this.cardData.id] || `major_${this.cardData.id}`;
      return `https://www.sacred-texts.com/tarot/pkt/img/ar${String(this.cardData.id).padStart(2, '0')}.jpg`;
    } else {
      // 小阿尔卡纳
      const suitMap = {
        'wands': 'wands',
        'cups': 'cups',
        'swords': 'swords', 
        'pentacles': 'pentacles'
      };
      const suit = suitMap[this.cardData.suit] || this.cardData.suit;
      const rank = this.cardData.rank;
      
      // 使用通用的塔罗牌图片格式
      let rankName = rank;
      if (rank === 'page') rankName = 'page';
      else if (rank === 'knight') rankName = 'knight';
      else if (rank === 'queen') rankName = 'queen';
      else if (rank === 'king') rankName = 'king';
      else rankName = rank;
      
      return `https://www.sacred-texts.com/tarot/pkt/img/${suit.substring(0,2)}${String(rank).padStart(2, '0')}.jpg`;
    }
  }

  /**
   * 获取备用图片URL
   */
  getFallbackImageUrl() {
    // 使用一个通用的塔罗牌背面图片作为备用
    return 'https://via.placeholder.com/300x500/4A90E2/FFFFFF?text=' + 
           encodeURIComponent(this.baseName);
  }

  /**
   * 获取逆位图片URL（可以是旋转处理或使用特定逆位图片）
   */
  get imageUrlReversed() {
    // 对于逆位，我们可以使用CSS transform来翻转图片
    // 或者使用专门的逆位图片（如果API提供）
    return this.imageUrl;
  }

  /**
   * 转换为JSON格式
   */
  toJSON() {
    return {
      name: this.name,
      baseName: this.baseName,
      isReversed: this.isReversed,
      isMajorArcana: this.isMajorArcana,
      suit: this.suit,
      cardData: this.cardData,
      imageUrl: this.imageUrl,
      imageUrlReversed: this.imageUrlReversed
    };
  }
}

module.exports = {
  MajorArcana,
  MinorArcana,
  Card
};
