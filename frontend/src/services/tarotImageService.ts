/**
 * 塔罗牌图片服务
 * 提供塔罗牌图片URL和备用图片处理
 */

import { Card } from '../types';

// 塔罗牌图片API配置
const IMAGE_SOURCES = {
  // 使用 RWS-API (Rider-Waite-Smith API)
  RWS_API: 'https://rws-cards-api.herokuapp.com/api/v1/cards',
  // 备用图片源
  FALLBACK: 'https://via.placeholder.com',
  // 本地图片源（如果需要）
  LOCAL: '/images/tarot'
};

// 塔罗牌名称映射（中文 -> 英文）
const CARD_NAME_MAP: { [key: string]: string } = {
  // 大阿尔卡纳
  '愚人': 'ar00',
  '魔术师': 'ar01', 
  '女祭司': 'ar02',
  '女皇': 'ar03',
  '皇帝': 'ar04',
  '教皇': 'ar05',
  '恋人': 'ar06',
  '战车': 'ar07',
  '力量': 'ar08',
  '隐士': 'ar09',
  '命运之轮': 'ar10',
  '正义': 'ar11',
  '倒吊人': 'ar12',
  '死神': 'ar13',
  '节制': 'ar14',
  '恶魔': 'ar15',
  '高塔': 'ar16',
  '星星': 'ar17',
  '月亮': 'ar18',
  '太阳': 'ar19',
  '审判': 'ar20',
  '世界': 'ar21',
  
  // 小阿尔卡纳 - 权杖
  '权杖一': 'waac',
  '权杖二': 'wa02',
  '权杖三': 'wa03',
  '权杖四': 'wa04',
  '权杖五': 'wa05',
  '权杖六': 'wa06',
  '权杖七': 'wa07',
  '权杖八': 'wa08',
  '权杖九': 'wa09',
  '权杖十': 'wa10',
  '权杖侍从': 'wapa',
  '权杖骑士': 'wakn',
  '权杖皇后': 'waqu',
  '权杖国王': 'waki',
  
  // 小阿尔卡纳 - 圣杯
  '圣杯一': 'cuac',
  '圣杯二': 'cu02',
  '圣杯三': 'cu03',
  '圣杯四': 'cu04',
  '圣杯五': 'cu05',
  '圣杯六': 'cu06',
  '圣杯七': 'cu07',
  '圣杯八': 'cu08',
  '圣杯九': 'cu09',
  '圣杯十': 'cu10',
  '圣杯侍从': 'cupa',
  '圣杯骑士': 'cukn',
  '圣杯皇后': 'cuqu',
  '圣杯国王': 'cuki',
  
  // 小阿尔卡纳 - 宝剑
  '宝剑一': 'swac',
  '宝剑二': 'sw02',
  '宝剑三': 'sw03',
  '宝剑四': 'sw04',
  '宝剑五': 'sw05',
  '宝剑六': 'sw06',
  '宝剑七': 'sw07',
  '宝剑八': 'sw08',
  '宝剑九': 'sw09',
  '宝剑十': 'sw10',
  '宝剑侍从': 'swpa',
  '宝剑骑士': 'swkn',
  '宝剑皇后': 'swqu',
  '宝剑国王': 'swki',
  
  // 小阿尔卡纳 - 金币
  '金币一': 'peac',
  '金币二': 'pe02',
  '金币三': 'pe03',
  '金币四': 'pe04',
  '金币五': 'pe05',
  '金币六': 'pe06',
  '金币七': 'pe07',
  '金币八': 'pe08',
  '金币九': 'pe09',
  '金币十': 'pe10',
  '金币侍从': 'pepa',
  '金币骑士': 'pekn',
  '金币皇后': 'pequ',
  '金币国王': 'peki'
};

/**
 * 塔罗牌图片服务类
 */
export class TarotImageService {
  
  /**
   * 获取塔罗牌图片URL
   */
  static getCardImageUrl(card: Card): string {
    try {
      // 获取主要图片URL
      const primaryUrl = this.getPrimaryImageUrl(card);
      return primaryUrl;
    } catch (error) {
      console.warn('获取塔罗牌图片失败:', error);
      return this.getFallbackImageUrl(card);
    }
  }

  /**
   * 获取主要图片URL
   */
  private static getPrimaryImageUrl(card: Card): string {
    const cardCode = CARD_NAME_MAP[card.baseName];
    
    if (!cardCode) {
      console.warn(`未找到塔罗牌 "${card.baseName}" 的图片映射`);
      return this.getFallbackImageUrl(card);
    }

    // 使用Sacred Texts的塔罗牌图片
    return `https://www.sacred-texts.com/tarot/pkt/img/${cardCode}.jpg`;
  }

  /**
   * 获取备用图片URL
   */
  private static getFallbackImageUrl(card: Card): string {
    // 创建一个美观的占位图片
    const width = 300;
    const height = 500;
    const color = card.isReversed ? 'DC143C' : '4A90E2';
    const textColor = 'FFFFFF';
    const text = encodeURIComponent(card.baseName);
    
    return `${IMAGE_SOURCES.FALLBACK}/${width}x${height}/${color}/${textColor}?text=${text}`;
  }

  /**
   * 预加载图片
   */
  static preloadImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  /**
   * 获取图片with备用处理
   */
  static async getImageWithFallback(card: Card): Promise<string> {
    const primaryUrl = this.getPrimaryImageUrl(card);
    
    // 尝试预加载主要图片
    const isLoaded = await this.preloadImage(primaryUrl);
    
    if (isLoaded) {
      return primaryUrl;
    } else {
      console.warn(`塔罗牌图片加载失败: ${primaryUrl}`);
      return this.getFallbackImageUrl(card);
    }
  }

  /**
   * 批量预加载塔罗牌图片
   */
  static async preloadCardImages(cards: Card[]): Promise<void> {
    const promises = cards.map(card => {
      const url = this.getPrimaryImageUrl(card);
      return this.preloadImage(url);
    });
    
    await Promise.all(promises);
    console.log(`预加载完成 ${cards.length} 张塔罗牌图片`);
  }

  /**
   * 获取塔罗牌背面图片
   */
  static getCardBackImageUrl(): string {
    return 'https://www.sacred-texts.com/tarot/pkt/img/cardback.jpg';
  }

  /**
   * 获取逆位图片样式
   */
  static getReversedImageStyle(): React.CSSProperties {
    return {
      transform: 'rotate(180deg)',
      filter: 'hue-rotate(15deg) brightness(0.9)'
    };
  }
}

export default TarotImageService;
