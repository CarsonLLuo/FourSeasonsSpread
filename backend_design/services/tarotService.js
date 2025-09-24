/**
 * 塔罗牌服务
 * 处理抽牌逻辑和牌阵生成
 */

const { MajorArcana, MinorArcana, Card } = require('../models/Card');

class TarotService {
  /**
   * 初始化塔罗牌牌组
   * @returns {Object} 包含各牌组的对象
   */
  static initializeTarotDecks() {
    // 创建大阿尔卡纳牌组
    const majorArcana = Object.values(MajorArcana);
    
    // 创建小阿尔卡纳牌组并按花色分类
    const allMinorArcana = Object.values(MinorArcana);
    const wands = allMinorArcana.filter(card => card.suit === 'wands');
    const cups = allMinorArcana.filter(card => card.suit === 'cups');
    const swords = allMinorArcana.filter(card => card.suit === 'swords');
    const pentacles = allMinorArcana.filter(card => card.suit === 'pentacles');
    
    return {
      majorArcana: [...majorArcana],
      wands: [...wands],
      cups: [...cups],
      swords: [...swords],
      pentacles: [...pentacles]
    };
  }

  /**
   * 洗牌算法（Fisher-Yates洗牌）
   * @param {Array} array 要洗牌的数组
   * @returns {Array} 洗牌后的数组
   */
  static shuffleDeck(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 从牌组中抽取一张牌
   * @param {Array} deck 牌组数组
   * @returns {Card} 抽取的塔罗牌对象
   */
  static drawCard(deck) {
    if (deck.length === 0) {
      throw new Error('牌组为空，无法抽牌');
    }
    
    const cardData = deck.pop();
    const isReversed = Math.random() < 0.5; // 50%概率逆位
    return new Card(cardData, isReversed);
  }

  /**
   * 抽取单张塔罗牌（日常占卜使用）
   * @returns {Object} 包含单张牌的结果对象
   */
  static drawSingleCard() {
    try {
      // 创建完整的78张塔罗牌组
      const decks = this.initializeTarotDecks();
      const allCards = [
        ...decks.majorArcana,
        ...decks.wands,
        ...decks.cups,
        ...decks.swords,
        ...decks.pentacles
      ];

      // 洗牌
      const shuffledDeck = this.shuffleDeck(allCards);
      
      // 随机抽取一张牌
      const cardData = shuffledDeck[Math.floor(Math.random() * shuffledDeck.length)];
      const isReversed = Math.random() < 0.3; // 30%概率逆位（相比四季牌阵降低逆位概率）
      const card = new Card(cardData, isReversed);

      return {
        success: true,
        card: card.toJSON(),
        timestamp: new Date().toISOString(),
        spreadType: '日常单抽'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 抽取完整的四季牌阵
   * @returns {Object} 包含5张牌的牌阵对象
   */
  static shuffleAndDraw() {
    try {
      // 初始化并洗牌各牌组
      const decks = this.initializeTarotDecks();
      
      const majorArcana = this.shuffleDeck(decks.majorArcana);
      const wands = this.shuffleDeck(decks.wands);
      const cups = this.shuffleDeck(decks.cups);
      const swords = this.shuffleDeck(decks.swords);
      const pentacles = this.shuffleDeck(decks.pentacles);

      // 按照四季牌阵规则抽牌
      const reading = {
        1: this.drawCard(wands),       // 1号位：权杖 - 行动力
        2: this.drawCard(cups),        // 2号位：圣杯 - 情感状态
        3: this.drawCard(swords),      // 3号位：宝剑 - 理性思维
        4: this.drawCard(pentacles),   // 4号位：金币 - 事业财务
        5: this.drawCard(majorArcana)  // 5号位：大阿尔卡纳 - 灵性成长
      };

      return {
        success: true,
        reading,
        timestamp: new Date().toISOString(),
        spreadType: '四季牌阵'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 获取牌阵布局信息
   * @returns {Object} 牌阵布局描述
   */
  static getSpreadInfo() {
    return {
      name: '四季牌阵',
      description: '传统塔罗牌阵，用于季节性指导和生活层面分析',
      positions: {
        1: {
          name: '行动力',
          suit: '权杖牌组',
          meaning: '关于意志、创造与行动层面',
          season: '春'
        },
        2: {
          name: '情感状态',
          suit: '圣杯牌组',
          meaning: '关于情绪、感觉与感性层面',
          season: '夏'
        },
        3: {
          name: '理性思维',
          suit: '宝剑牌组',
          meaning: '关于理性、思维与关系层面',
          season: '秋'
        },
        4: {
          name: '事业财务',
          suit: '金币牌组',
          meaning: '关于感官、现实与物质层面',
          season: '冬'
        },
        5: {
          name: '灵性成长',
          suit: '大阿尔卡纳',
          meaning: '关于灵魂课题和精神成长',
          season: '核心'
        }
      },
      layout: {
        description: '十字形布局',
        pattern: `
            4
        1   5   3
            2
        `
      },
      traditionalUse: '传统上仅在四个节气使用（春分、夏至、秋分、冬至）'
    };
  }

  /**
   * 验证抽牌结果的完整性
   * @param {Object} reading 抽牌结果
   * @returns {Object} 验证结果
   */
  static validateReading(reading) {
    const requiredPositions = [1, 2, 3, 4, 5];
    const errors = [];

    for (const position of requiredPositions) {
      if (!reading[position]) {
        errors.push(`缺少${position}号位置的牌`);
      } else if (!(reading[position] instanceof Card)) {
        errors.push(`${position}号位置的牌格式无效`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 将抽牌结果转换为API响应格式
   * @param {Object} reading 抽牌结果
   * @returns {Object} 格式化的响应数据
   */
  static formatReadingForResponse(reading) {
    const formattedReading = {};
    
    for (const position in reading) {
      if (reading[position] instanceof Card) {
        formattedReading[position] = reading[position].toJSON();
      }
    }

    return {
      reading: formattedReading,
      spreadInfo: this.getSpreadInfo(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = TarotService;
