import { PantryStore } from './store.js';

// Initialize Pantry Store
const store = new PantryStore();

// Application State
const state = {
  category: 'all',
  status: 'all',
  search: '',
  sortBy: 'percentage-asc',
  selectedDecantItemId: null
};

// DOM Element References
const pantryGrid = document.getElementById('pantryGrid');
const searchInput = document.getElementById('searchInput');
const categoryTabs = document.getElementById('categoryTabs');
const statusFilter = document.getElementById('statusFilter');
const sortBySelect = document.getElementById('sortBy');

// Stat Counters
const statTotalCount = document.getElementById('statTotalCount');
const statOkCount = document.getElementById('statOkCount');
const statWarningCount = document.getElementById('statWarningCount');
const statCriticalCount = document.getElementById('statCriticalCount');
const shoppingBadgeCount = document.getElementById('shoppingBadgeCount');

// Modals
const itemModalBackdrop = document.getElementById('itemModalBackdrop');
const itemModalTitle = document.getElementById('itemModalTitle');
const itemForm = document.getElementById('itemForm');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeItemModalBtn = document.getElementById('closeItemModalBtn');
const cancelItemModalBtn = document.getElementById('cancelItemModalBtn');

const decantModalBackdrop = document.getElementById('decantModalBackdrop');
const decantItemDesc = document.getElementById('decantItemDesc');
const decantItemId = document.getElementById('decantItemId');
const customDecantInput = document.getElementById('customDecantInput');
const closeDecantModalBtn = document.getElementById('closeDecantModalBtn');
const cancelDecantBtn = document.getElementById('cancelDecantBtn');
const confirmDecantBtn = document.getElementById('confirmDecantBtn');

const shoppingModalBackdrop = document.getElementById('shoppingModalBackdrop');
const shoppingListBtn = document.getElementById('shoppingListBtn');
const shoppingListContainer = document.getElementById('shoppingListContainer');
const closeShoppingModalBtn = document.getElementById('closeShoppingModalBtn');
const closeShoppingFooterBtn = document.getElementById('closeShoppingFooterBtn');
const copyShoppingListBtn = document.getElementById('copyShoppingListBtn');
const shareShoppingListBtn = document.getElementById('shareShoppingListBtn');

const resetSampleDataBtn = document.getElementById('resetSampleDataBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const toastContainer = document.getElementById('toastContainer');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  renderApp();
});

// Setup All Event Listeners
function setupEventListeners() {
  // Search
  searchInput.addEventListener('input', (e) => {
    state.search = e.target.value.toLowerCase().trim();
    renderApp();
  });

  // Category Tabs
  categoryTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;

    categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.category = btn.dataset.category;
    renderApp();
  });

  // Status Filter
  statusFilter.addEventListener('change', (e) => {
    state.status = e.target.value;
    renderApp();
  });

  // Sort
  sortBySelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderApp();
  });

  // Reset Sample Data
  resetSampleDataBtn.addEventListener('click', () => {
    if (confirm('모든 데이터를 대표 식료품 샘플 데이터로 초기화하시겠습니까?')) {
      store.resetToDefault();
      showToast('샘플 데이터로 초기화되었습니다.', 'success');
      renderApp();
    }
  });

  // Add Item Modal Triggers
  openAddModalBtn.addEventListener('click', () => openItemModal());
  closeItemModalBtn.addEventListener('click', closeItemModal);
  cancelItemModalBtn.addEventListener('click', closeItemModal);
  itemForm.addEventListener('submit', handleItemFormSubmit);

  // Decant Modal Triggers
  closeDecantModalBtn.addEventListener('click', closeDecantModal);
  cancelDecantBtn.addEventListener('click', closeDecantModal);
  confirmDecantBtn.addEventListener('click', handleConfirmDecant);

  // Preset Decant Buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      customDecantInput.value = btn.dataset.amount;
    });
  });

  // Shopping List Modal Triggers & Copy/Share
  shoppingListBtn.addEventListener('click', openShoppingModal);
  closeShoppingModalBtn.addEventListener('click', closeShoppingModal);
  closeShoppingFooterBtn.addEventListener('click', closeShoppingModal);
  if (copyShoppingListBtn) copyShoppingListBtn.addEventListener('click', handleCopyShoppingList);
  if (shareShoppingListBtn) shareShoppingListBtn.addEventListener('click', handleShareShoppingList);

  // Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Close Modals when clicking Backdrop
  [itemModalBackdrop, decantModalBackdrop, shoppingModalBackdrop].forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
      }
    });
  });
}

// Render Entire Application UI
function renderApp() {
  renderSummaryStats();
  renderPantryGrid();
}

// Render Summary Counters
function renderSummaryStats() {
  const stats = store.getSummaryStats();
  statTotalCount.textContent = stats.total;
  statOkCount.textContent = stats.okCount;
  statWarningCount.textContent = stats.warningCount;
  statCriticalCount.textContent = stats.criticalCount;
  shoppingBadgeCount.textContent = stats.shoppingCount;

  if (stats.shoppingCount > 0) {
    shoppingBadgeCount.style.display = 'flex';
  } else {
    shoppingBadgeCount.style.display = 'none';
  }
}

// Render Pantry Item Cards Grid
function renderPantryGrid() {
  let items = store.getItems();

  // 1. Category Filter
  if (state.category !== 'all') {
    items = items.filter(item => item.category === state.category);
  }

  // 2. Status Filter
  if (state.status !== 'all') {
    items = items.filter(item => {
      const status = PantryStore.getItemStatus(item);
      return status.code === state.status;
    });
  }

  // 3. Search Filter
  if (state.search) {
    items = items.filter(item =>
      item.name.toLowerCase().includes(state.search) ||
      (item.brand && item.brand.toLowerCase().includes(state.search)) ||
      (item.location && item.location.toLowerCase().includes(state.search)) ||
      (item.notes && item.notes.toLowerCase().includes(state.search))
    );
  }

  // 4. Sorting
  items.sort((a, b) => {
    const pctA = a.initialCapacity > 0 ? (a.currentCapacity / a.initialCapacity) : 0;
    const pctB = b.initialCapacity > 0 ? (b.currentCapacity / b.initialCapacity) : 0;

    switch (state.sortBy) {
      case 'percentage-asc':
        return pctA - pctB;
      case 'percentage-desc':
        return pctB - pctA;
      case 'name-asc':
        return a.name.localeCompare(b.name, 'ko');
      case 'updated-desc':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      default:
        return 0;
    }
  });

  // Handle Empty State
  if (items.length === 0) {
    pantryGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">조건에 맞는 식료품이 없습니다</h3>
        <p class="empty-desc">검색어나 카테고리 필터를 변경하거나 새로운 식료품을 등록해 보세요.</p>
        <button onclick="document.getElementById('openAddModalBtn').click()" class="btn btn-primary">
          <i class="fa-solid fa-plus"></i> 신규 식료품 등록하기
        </button>
      </div>
    `;
    return;
  }

  // Render Cards
  pantryGrid.innerHTML = items.map(item => createPantryCardHTML(item)).join('');

  // Attach Event Listeners to Card Buttons
  items.forEach(item => {
    // One-Click Decant Button
    const decantBtn = document.getElementById(`btn-decant-${item.id}`);
    if (decantBtn) {
      decantBtn.addEventListener('click', () => handleOneClickDecant(item.id));
    }

    // Custom Decant Options Modal Button
    const decantOptBtn = document.getElementById(`btn-decant-opt-${item.id}`);
    if (decantOptBtn) {
      decantOptBtn.addEventListener('click', () => openDecantModal(item.id));
    }

    // Quick Edit Button
    const editBtn = document.getElementById(`btn-edit-${item.id}`);
    if (editBtn) {
      editBtn.addEventListener('click', () => openItemModal(item.id));
    }

    // Refill Button
    const refillBtn = document.getElementById(`btn-refill-${item.id}`);
    if (refillBtn) {
      refillBtn.addEventListener('click', () => handleRefillItem(item.id));
    }

    // Delete Button
    const deleteBtn = document.getElementById(`btn-delete-${item.id}`);
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => handleDeleteItem(item.id));
    }
  });
}

// Generate Pantry Card HTML
function createPantryCardHTML(item) {
  const status = PantryStore.getItemStatus(item);
  const percentage = Math.max(0, Math.min(100, Math.round((item.currentCapacity / item.initialCapacity) * 100)));
  const decantAmount = item.decantAmount || 100;

  let pctColorClass = 'percentage-ok';
  if (status.code === 'critical') pctColorClass = 'percentage-critical';
  else if (status.code === 'warning') pctColorClass = 'percentage-warning';

  return `
    <div class="pantry-card status-${status.code}" id="card-${item.id}">
      <div>
        <div class="card-top">
          <div>
            <div class="card-brand">${escapeHTML(item.brand || item.category)}</div>
            <h3 class="card-title">${escapeHTML(item.name)}</h3>
            <div class="card-location">
              <i class="fa-solid fa-location-dot"></i> ${escapeHTML(item.location || '주방 찬장')}
            </div>
          </div>
          <span class="status-badge ${status.badgeClass}">
            ${status.emoji} ${status.label}
          </span>
        </div>

        <!-- Capacity Progress Box -->
        <div class="capacity-box">
          <div class="capacity-info">
            <div>
              <span class="capacity-text">${item.currentCapacity.toLocaleString()}</span>
              <span class="capacity-unit">/ ${item.initialCapacity.toLocaleString()} ${item.unit}</span>
            </div>
            <div class="capacity-percentage ${pctColorClass}">${percentage}%</div>
          </div>

          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${status.progressClass}" style="width: ${percentage}%;"></div>
          </div>
        </div>

        ${item.notes ? `<p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;"><i class="fa-solid fa-note-sticky"></i> ${escapeHTML(item.notes)}</p>` : ''}
      </div>

      <!-- Card Action Row -->
      <div class="card-actions">
        <button id="btn-decant-${item.id}" class="btn btn-decant">
          <i class="fa-solid fa-wine-bottle"></i> 소분하기 (${decantAmount}${item.unit} 차감)
        </button>

        <div class="card-subactions">
          <button id="btn-decant-opt-${item.id}" class="icon-btn" title="맞춤 소분 용량 선택">
            <i class="fa-solid fa-sliders"></i>
          </button>
          
          <div class="flex gap-2">
            <button id="btn-refill-${item.id}" class="icon-btn" title="완충 / 본품 꽉 채움 (Refill)">
              <i class="fa-solid fa-arrows-rotate"></i>
            </button>
            <button id="btn-edit-${item.id}" class="icon-btn" title="정보 및 잔여량 직접 수정">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button id="btn-delete-${item.id}" class="icon-btn danger" title="삭제">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// One-Click Decant Handler
function handleOneClickDecant(id) {
  const item = store.getItemById(id);
  if (!item) return;

  const decantAmt = item.decantAmount || 100;
  if (item.currentCapacity <= 0) {
    showToast(`'${item.name}'의 본품 잔여량이 이미 0${item.unit}입니다!`, 'warning');
    return;
  }

  const updated = store.decantItem(id);
  if (updated) {
    const newStatus = PantryStore.getItemStatus(updated);
    showToast(`'${updated.name}' 소분 완료! (-${decantAmt}${updated.unit})`, 'success');
    
    if (newStatus.code === 'critical') {
      showToast(`⚠️ '${updated.name}' 본품 재고가 최소 기준 이하입니다. 구매 필요!`, 'danger');
    }
    renderApp();
  }
}

// Open Decant Options Modal
function openDecantModal(id) {
  const item = store.getItemById(id);
  if (!item) return;

  state.selectedDecantItemId = id;
  decantItemId.value = id;
  decantItemDesc.innerHTML = `
    <strong>[${escapeHTML(item.name)}]</strong> 소분용 병에 주입할 용량을 지정하세요.<br>
    현재 본품 잔여량: <strong style="color:#2dd4bf;">${item.currentCapacity} ${item.unit}</strong> / ${item.initialCapacity} ${item.unit}
  `;
  customDecantInput.value = item.decantAmount || 100;
  decantModalBackdrop.classList.add('active');
}

function closeDecantModal() {
  decantModalBackdrop.classList.remove('active');
  state.selectedDecantItemId = null;
}

function handleConfirmDecant() {
  const id = state.selectedDecantItemId;
  const amount = Number(customDecantInput.value);

  if (!id || !amount || amount <= 0) {
    alert('올바른 소분 용량을 입력하세요.');
    return;
  }

  const updated = store.decantItem(id, amount);
  if (updated) {
    showToast(`'${updated.name}' ${amount}${updated.unit} 소분 차감 적용 완료!`, 'success');
    closeDecantModal();
    renderApp();
  }
}

// Open Add or Edit Item Modal
function openItemModal(id = null) {
  itemForm.reset();

  if (id) {
    const item = store.getItemById(id);
    if (!item) return;

    itemModalTitle.textContent = '식료품 정보 및 용량 수정';
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemBrand').value = item.brand || '';
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemInitialCap').value = item.initialCapacity;
    document.getElementById('itemCurrentCap').value = item.currentCapacity;
    document.getElementById('itemUnit').value = item.unit;
    document.getElementById('itemMinThreshold').value = item.minThreshold;
    document.getElementById('itemDecantAmount').value = item.decantAmount || 100;
    document.getElementById('itemLocation').value = item.location || '';
    document.getElementById('itemNotes').value = item.notes || '';
  } else {
    itemModalTitle.textContent = '신규 식료품 등록';
    document.getElementById('itemId').value = '';
    document.getElementById('itemInitialCap').value = 1000;
    document.getElementById('itemCurrentCap').value = 1000;
    document.getElementById('itemMinThreshold').value = 300;
    document.getElementById('itemDecantAmount').value = 200;
  }

  itemModalBackdrop.classList.add('active');
}

function closeItemModal() {
  itemModalBackdrop.classList.remove('active');
}

function handleItemFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('itemId').value;
  const formData = {
    name: document.getElementById('itemName').value,
    brand: document.getElementById('itemBrand').value,
    category: document.getElementById('itemCategory').value,
    initialCapacity: document.getElementById('itemInitialCap').value,
    currentCapacity: document.getElementById('itemCurrentCap').value,
    unit: document.getElementById('itemUnit').value,
    minThreshold: document.getElementById('itemMinThreshold').value,
    decantAmount: document.getElementById('itemDecantAmount').value,
    location: document.getElementById('itemLocation').value,
    notes: document.getElementById('itemNotes').value
  };

  if (id) {
    store.updateItem(id, formData);
    showToast(`'${formData.name}' 정보가 업데이트되었습니다.`, 'success');
  } else {
    store.addItem(formData);
    showToast(`신규 식료품 '${formData.name}'이(가) 등록되었습니다.`, 'success');
  }

  closeItemModal();
  renderApp();
}

// Refill Item
function handleRefillItem(id) {
  const item = store.getItemById(id);
  if (!item) return;

  if (confirm(`'${item.name}' 본품을 다시 새로 구매하여 ${item.initialCapacity}${item.unit}로 꽉 채우시겠습니까?`)) {
    store.refillItem(id);
    showToast(`'${item.name}' 본품 재고 완충 완료!`, 'success');
    renderApp();
  }
}

// Delete Item
function handleDeleteItem(id) {
  const item = store.getItemById(id);
  if (!item) return;

  if (confirm(`정말로 '${item.name}'을(를) 재고 목록에서 삭제하시겠습니까?`)) {
    store.deleteItem(id);
    showToast(`'${item.name}'이(가) 삭제되었습니다.`, 'info');
    renderApp();
  }
}

// Shopping List Modal Functions
function openShoppingModal() {
  const items = store.getItems();
  const shoppingItems = items.filter(item => {
    const status = PantryStore.getItemStatus(item);
    return status.code === 'critical' || status.code === 'warning';
  });

  if (shoppingItems.length === 0) {
    shoppingListContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <i class="fa-solid fa-circle-check" style="font-size: 2.5rem; color: #10b981; margin-bottom: 0.5rem;"></i>
        <p style="font-weight: 700; color: var(--text-primary);">구매가 필요한 식료품이 없습니다!</p>
        <p style="font-size: 0.85rem;">모든 본품 재고가 충분합니다.</p>
      </div>
    `;
    if (copyShoppingListBtn) copyShoppingListBtn.disabled = true;
    if (shareShoppingListBtn) shareShoppingListBtn.disabled = true;
  } else {
    if (copyShoppingListBtn) copyShoppingListBtn.disabled = false;
    if (shareShoppingListBtn) shareShoppingListBtn.disabled = false;
    shoppingListContainer.innerHTML = shoppingItems.map(item => {
      const status = PantryStore.getItemStatus(item);
      return `
        <div class="shopping-item">
          <div class="shopping-info">
            <span class="status-badge ${status.badgeClass}">${status.emoji}</span>
            <div>
              <div class="shopping-name">${escapeHTML(item.name)}</div>
              <div class="shopping-meta">
                현재 ${item.currentCapacity} ${item.unit} / 최소기준 ${item.minThreshold} ${item.unit} (${escapeHTML(item.location || '주방')})
              </div>
            </div>
          </div>
          <button onclick="window.refillFromShopping('${item.id}')" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
            <i class="fa-solid fa-cart-check"></i> 구매완충
          </button>
        </div>
      `;
    }).join('');
  }

  shoppingModalBackdrop.classList.add('active');
}

window.refillFromShopping = function(id) {
  handleRefillItem(id);
  openShoppingModal(); // refresh modal
};

function closeShoppingModal() {
  shoppingModalBackdrop.classList.remove('active');
}

// Generate formatted shopping list plain text
function getFormattedShoppingListText() {
  const items = store.getItems();
  const shoppingItems = items.filter(item => {
    const status = PantryStore.getItemStatus(item);
    return status.code === 'critical' || status.code === 'warning';
  });

  if (shoppingItems.length === 0) {
    return null;
  }

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let text = `🛒 [PantryLog] 구매 필요 장보기 목록\n`;
  text += `----------------------------------------\n`;

  shoppingItems.forEach((item, index) => {
    const brandStr = item.brand ? ` [${item.brand}]` : '';
    const locStr = item.location ? ` | 보관: ${item.location}` : '';
    text += `${index + 1}. ${item.name}${brandStr}\n`;
    text += `   - 현재: ${item.currentCapacity} ${item.unit} / 최소기준: ${item.minThreshold} ${item.unit}${locStr}\n`;
  });

  text += `----------------------------------------\n`;
  text += `총 ${shoppingItems.length}개 품목 (작성일: ${todayStr})`;

  return text;
}

// Copy shopping list to clipboard
async function handleCopyShoppingList() {
  const text = getFormattedShoppingListText();
  if (!text) {
    showToast('구매가 필요한 식료품 목록이 비어있습니다.', 'warning');
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showToast('📋 장보기 목록이 클립보드에 복사되었습니다!', 'success');
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    showToast('클립보드 복사 중 오류가 발생했습니다.', 'danger');
  }
}

// Share shopping list using Web Share API or Clipboard Fallback
async function handleShareShoppingList() {
  const text = getFormattedShoppingListText();
  if (!text) {
    showToast('구매가 필요한 식료품 목록이 비어있습니다.', 'warning');
    return;
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'PantryLog 장보기 목록',
        text: text
      });
      showToast('📤 장보기 목록 공유 완료!', 'success');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
        handleCopyShoppingList();
      }
    }
  } else {
    handleCopyShoppingList();
  }
}

// Toast Notification System
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'warning') icon = 'fa-triangle-exclamation';
  if (type === 'danger') icon = 'fa-circle-xmark';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHTML(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Theme Toggle System
function initTheme() {
  const savedTheme = localStorage.getItem('pantrylog_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun" style="color: #d97706;"></i> <span>라이트 모드</span>';
  } else {
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon" style="color: #a7f3d0;"></i> <span>다크 모드</span>';
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('pantrylog_theme', isLight ? 'light' : 'dark');
  if (isLight) {
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun" style="color: #d97706;"></i> <span>라이트 모드</span>';
    showToast('☀️ 라이트 모드로 전환되었습니다.', 'info');
  } else {
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon" style="color: #a7f3d0;"></i> <span>다크 모드</span>';
    showToast('🌙 다크 모드로 전환되었습니다.', 'info');
  }
}

// Helper: Escape HTML string to prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
