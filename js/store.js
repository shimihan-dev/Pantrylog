/**
 * PantryLog - State Store & LocalStorage Manager
 */

const STORAGE_KEY = 'pantrylog_items_v1';

// Initial sample data tailored to user's decanting liquid condiments use case
const DEFAULT_ITEMS = [
  {
    id: 'item-1',
    name: '진간장 (대용량)',
    brand: '샘표',
    category: '기름/장류',
    initialCapacity: 1800,
    currentCapacity: 920,
    unit: 'mL',
    minThreshold: 400,
    decantAmount: 200,
    location: '주방 찬장 하부장',
    notes: '소분용 양념병(200mL) 비면 주기적으로 채워넣음',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'item-2',
    name: '통참깨 참기름',
    brand: '오뚜기',
    category: '기름/장류',
    initialCapacity: 500,
    currentCapacity: 160,
    unit: 'mL',
    minThreshold: 150,
    decantAmount: 100,
    location: '양념 소분대',
    notes: '소분용 작은 기름병(100mL) 사용 중',
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'item-3',
    name: '국산 들기름',
    brand: '시골방아',
    category: '기름/장류',
    initialCapacity: 350,
    currentCapacity: 80,
    unit: 'mL',
    minThreshold: 100,
    decantAmount: 80,
    location: '냉장고 문 포켓',
    notes: '들기름은 개봉 후 냉장 보관 필수',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-4',
    name: '미림 맛술',
    brand: '롯데',
    category: '조미료/소스',
    initialCapacity: 900,
    currentCapacity: 450,
    unit: 'mL',
    minThreshold: 200,
    decantAmount: 150,
    location: '주방 찬장 하부장',
    notes: '고기/생선 재울 때 대용량 소분 사용',
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'item-5',
    name: '요리 올리고당',
    brand: '백설',
    category: '조미료/소스',
    initialCapacity: 1200,
    currentCapacity: 250,
    unit: 'g',
    minThreshold: 300,
    decantAmount: 200,
    location: '주방 찬장',
    notes: '소스 용기에 200g씩 짜서 소분',
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'item-6',
    name: '프리미엄 참치액',
    brand: '한라',
    category: '조미료/소스',
    initialCapacity: 900,
    currentCapacity: 180,
    unit: 'mL',
    minThreshold: 250,
    decantAmount: 150,
    location: '주방 찬장',
    notes: '국물 요리용 핵심 조미료, 소분병에 담아 조리 시 바로 사용',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'item-7',
    name: '양조식초 2배',
    brand: '오뚜기',
    category: '조미료/소스',
    initialCapacity: 1800,
    currentCapacity: 1400,
    unit: 'mL',
    minThreshold: 400,
    decantAmount: 250,
    location: '주방 찬장 하부장',
    notes: '세척 및 무침용 드레싱병 소분',
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'item-8',
    name: '카놀라유 식용유',
    brand: '해표',
    category: '기름/장류',
    initialCapacity: 1500,
    currentCapacity: 600,
    unit: 'mL',
    minThreshold: 350,
    decantAmount: 250,
    location: '주방 찬장 하부장',
    notes: '오일 디스펜서 병에 250mL 주입',
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'item-9',
    name: '까나리 액젓',
    brand: '하선정',
    category: '조미료/소스',
    initialCapacity: 800,
    currentCapacity: 120,
    unit: 'mL',
    minThreshold: 200,
    decantAmount: 100,
    location: '주방 찬장',
    notes: '김치 및 나물무침 용',
    updatedAt: new Date().toISOString()
  }
];

export class PantryStore {
  constructor() {
    this.items = this.loadItems();
  }

  loadItems() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveItems(DEFAULT_ITEMS);
        return DEFAULT_ITEMS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load pantry items from LocalStorage', e);
      return DEFAULT_ITEMS;
    }
  }

  saveItems(items = this.items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save pantry items to LocalStorage', e);
    }
  }

  getItems() {
    return this.items;
  }

  getItemById(id) {
    return this.items.find(item => item.id === id);
  }

  addItem(itemData) {
    const newItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: itemData.name.trim(),
      brand: itemData.brand ? itemData.brand.trim() : '',
      category: itemData.category || '조미료/소스',
      initialCapacity: Number(itemData.initialCapacity) || 1000,
      currentCapacity: Number(itemData.currentCapacity) !== undefined ? Number(itemData.currentCapacity) : Number(itemData.initialCapacity),
      unit: itemData.unit || 'mL',
      minThreshold: Number(itemData.minThreshold) || 200,
      decantAmount: Number(itemData.decantAmount) || 100,
      location: itemData.location ? itemData.location.trim() : '주방 찬장',
      notes: itemData.notes ? itemData.notes.trim() : '',
      updatedAt: new Date().toISOString()
    };

    this.items.unshift(newItem);
    this.saveItems();
    return newItem;
  }

  updateItem(id, updateData) {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return null;

    this.items[index] = {
      ...this.items[index],
      ...updateData,
      initialCapacity: Number(updateData.initialCapacity !== undefined ? updateData.initialCapacity : this.items[index].initialCapacity),
      currentCapacity: Number(updateData.currentCapacity !== undefined ? updateData.currentCapacity : this.items[index].currentCapacity),
      minThreshold: Number(updateData.minThreshold !== undefined ? updateData.minThreshold : this.items[index].minThreshold),
      decantAmount: Number(updateData.decantAmount !== undefined ? updateData.decantAmount : this.items[index].decantAmount),
      updatedAt: new Date().toISOString()
    };

    // Ensure capacity doesn't go below 0
    if (this.items[index].currentCapacity < 0) {
      this.items[index].currentCapacity = 0;
    }

    this.saveItems();
    return this.items[index];
  }

  deleteItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveItems();
  }

  /**
   * Decant (소분하기): Subtract specified or default decantAmount from currentCapacity
   */
  decantItem(id, customAmount = null) {
    const item = this.getItemById(id);
    if (!item) return null;

    const amountToSubtract = customAmount !== null ? Number(customAmount) : Number(item.decantAmount || 100);
    const newCapacity = Math.max(0, item.currentCapacity - amountToSubtract);

    return this.updateItem(id, { currentCapacity: newCapacity });
  }

  /**
   * Refill (원복 / 재충전): Reset current capacity to initial capacity
   */
  refillItem(id) {
    const item = this.getItemById(id);
    if (!item) return null;

    return this.updateItem(id, { currentCapacity: item.initialCapacity });
  }

  /**
   * Reset store to initial default sample data
   */
  resetToDefault() {
    this.items = [...DEFAULT_ITEMS];
    this.saveItems();
    return this.items;
  }

  /**
   * Calculate Item Status:
   * - 'critical' (🔴 구매 필요): currentCapacity <= minThreshold
   * - 'warning' (🟡 부족): minThreshold < currentCapacity <= minThreshold * 1.5 (or percentage <= 30%)
   * - 'ok' (🟢 충분): currentCapacity > minThreshold * 1.5
   */
  static getItemStatus(item) {
    const current = Number(item.currentCapacity);
    const min = Number(item.minThreshold);
    const initial = Number(item.initialCapacity);
    const percentage = initial > 0 ? (current / initial) * 100 : 0;

    if (current <= min) {
      return {
        code: 'critical',
        label: '구매 필요',
        badgeClass: 'badge-danger',
        emoji: '🔴',
        progressClass: 'progress-danger'
      };
    } else if (current <= min * 1.5 || percentage <= 35) {
      return {
        code: 'warning',
        label: '부족',
        badgeClass: 'badge-warning',
        emoji: '🟡',
        progressClass: 'progress-warning'
      };
    } else {
      return {
        code: 'ok',
        label: '충분',
        badgeClass: 'badge-success',
        emoji: '🟢',
        progressClass: 'progress-success'
      };
    }
  }

  /**
   * Get Dashboard Summary Statistics
   */
  getSummaryStats() {
    let okCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    this.items.forEach(item => {
      const status = PantryStore.getItemStatus(item);
      if (status.code === 'critical') criticalCount++;
      else if (status.code === 'warning') warningCount++;
      else okCount++;
    });

    return {
      total: this.items.length,
      okCount,
      warningCount,
      criticalCount,
      shoppingCount: criticalCount + warningCount
    };
  }
}
