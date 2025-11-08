// ===== Global State =====
const state = {
    currentCategory: 'hotels',
    data: null,
    filteredData: null,
    currentLanguage: 'vi'
};

// ===== DOM Elements =====
const elements = {
    contentPanel: document.getElementById('contentPanel'),
    closePanel: document.getElementById('closePanel'),
    panelTitle: document.getElementById('panelTitle'),
    panelContent: document.getElementById('panelContent'),
    searchInput: document.getElementById('searchInput'),
    navItems: document.querySelectorAll('.nav-item[data-category]'),
    langBtns: document.querySelectorAll('.lang-btn')
};

// ===== Category Titles =====
const categoryTitles = {
    vi: {
        hotels: 'Khách Sạn Phan Thiết',
        attractions: 'Điểm Du Lịch',
        heritage: 'Di Tích Lịch Sử',
        scenery: 'Danh Thắng',
        info: 'Thông Tin',
        map: 'Bản Đồ'
    },
    en: {
        hotels: 'Phan Thiet Hotels',
        attractions: 'Tourist Attractions',
        heritage: 'Historical Sites',
        scenery: 'Scenic Spots',
        info: 'Information',
        map: 'Map'
    }
};

// ===== Initialize App =====
async function init() {
    try {
        showLoading();
        await loadData();
        setupEventListeners();
        loadCategory('hotels'); // Default category
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    }
}

// ===== Load Data from JSON =====
async function loadData() {
    try {
        const response = await fetch('data/hotels.json');
        if (!response.ok) throw new Error('Failed to load data');
        state.data = await response.json();
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Navigation items click
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            handleNavClick(category);
        });
    });

    // Close panel
    elements.closePanel.addEventListener('click', closePanel);

    // Search input
    elements.searchInput.addEventListener('input', handleSearch);

    // Language toggle
    elements.langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.currentTarget.dataset.lang;
            changeLanguage(lang);
        });
    });

    // Click outside panel to close (optional)
    document.addEventListener('click', (e) => {
        if (elements.contentPanel.classList.contains('active')) {
            const clickedOutside = !elements.contentPanel.contains(e.target) &&
                                 !e.target.closest('.nav-item[data-category]');
            if (clickedOutside && !e.target.closest('.action-btn')) {
                // Uncomment below to enable close on outside click
                // closePanel();
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.contentPanel.classList.contains('active')) {
            closePanel();
        }
    });
}

// ===== Navigation Click Handler =====
function handleNavClick(category) {
    // Update active state
    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.category === category) {
            item.classList.add('active');
        }
    });

    // Load category
    loadCategory(category);
    openPanel();
}

// ===== Load Category =====
function loadCategory(category) {
    state.currentCategory = category;
    state.filteredData = state.data[category] || [];
    
    // Update panel title
    elements.panelTitle.textContent = categoryTitles[state.currentLanguage][category] || category;
    
    // Clear search
    elements.searchInput.value = '';
    
    // Render content
    renderContent();
}

// ===== Render Content =====
function renderContent() {
    const data = state.filteredData;
    
    if (!data || data.length === 0) {
        showEmptyState();
        return;
    }

    const html = `
        <div class="content-grid">
            ${data.map(item => createCard(item)).join('')}
        </div>
    `;
    
    elements.panelContent.innerHTML = html;
    
    // Add click listeners to cards
    attachCardListeners();
}

// ===== Create Card HTML =====
function createCard(item) {
    const lang = state.currentLanguage;
    const title = item.name[lang] || item.name.vi;
    const description = item.description[lang] || item.description.vi;
    const rating = item.rating || 0;
    const price = item.price ? formatPrice(item.price, lang) : '';
    
    return `
        <div class="content-card" data-id="${item.id}">
            <div class="card-image">
                ${item.image ? 
                    `<img src="${item.image}" alt="${title}" onerror="this.parentElement.innerHTML='<span class=\\'card-placeholder\\'>📷</span>'">` :
                    `<span class="card-placeholder">📷</span>`
                }
            </div>
            <div class="card-content">
                <h3 class="card-title">${title}</h3>
                <p class="card-description">${description}</p>
                ${rating || price ? `
                    <div class="card-footer">
                        ${rating ? `
                            <div class="card-rating">
                                <span>⭐</span>
                                <span>${rating.toFixed(1)}</span>
                            </div>
                        ` : '<div></div>'}
                        ${price ? `<div class="card-price">${price}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ===== Format Price =====
function formatPrice(price, lang) {
    if (lang === 'vi') {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(price);
    } else {
        const usdPrice = price / 24000; // Approximate conversion
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(usdPrice);
    }
}

// ===== Attach Card Listeners =====
function attachCardListeners() {
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            handleCardClick(id);
        });
    });
}

// ===== Card Click Handler =====
function handleCardClick(id) {
    const item = state.filteredData.find(item => item.id === id);
    if (item) {
        console.log('Card clicked:', item);
        // Here you would typically:
        // 1. Navigate to VR view
        // 2. Load 360 panorama
        // 3. Show detailed information
        alert(`Navigating to: ${item.name.vi}\nThis would load the VR view in production.`);
    }
}

// ===== Search Handler =====
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const allData = state.data[state.currentCategory] || [];
    
    if (!query) {
        state.filteredData = allData;
    } else {
        state.filteredData = allData.filter(item => {
            const nameVi = item.name.vi.toLowerCase();
            const nameEn = item.name.en.toLowerCase();
            const descVi = item.description.vi.toLowerCase();
            const descEn = item.description.en.toLowerCase();
            
            return nameVi.includes(query) || 
                   nameEn.includes(query) ||
                   descVi.includes(query) ||
                   descEn.includes(query);
        });
    }
    
    renderContent();
}

// ===== Language Change =====
function changeLanguage(lang) {
    state.currentLanguage = lang;
    
    // Update active button
    elements.langBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update panel title
    elements.panelTitle.textContent = categoryTitles[lang][state.currentCategory];
    
    // Re-render content
    renderContent();
}

// ===== Panel Controls =====
function openPanel() {
    elements.contentPanel.classList.add('active');
}

function closePanel() {
    elements.contentPanel.classList.remove('active');
}

// ===== UI States =====
function showLoading() {
    elements.panelContent.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu...</p>
        </div>
    `;
}

function showEmptyState() {
    const lang = state.currentLanguage;
    const messages = {
        vi: {
            title: 'Không có dữ liệu',
            description: 'Không tìm thấy kết quả nào phù hợp.'
        },
        en: {
            title: 'No Data',
            description: 'No matching results found.'
        }
    };
    
    elements.panelContent.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <h3>${messages[lang].title}</h3>
            <p>${messages[lang].description}</p>
        </div>
    `;
}

function showError(message) {
    elements.panelContent.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h3>Lỗi</h3>
            <p>${message}</p>
        </div>
    `;
}

// ===== Utility Functions =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize search with debouncing
elements.searchInput.addEventListener('input', debounce(handleSearch, 300));

// ===== Start Application =====
document.addEventListener('DOMContentLoaded', init);

// ===== Export for potential use in other modules =====
window.VR360App = {
    state,
    loadCategory,
    openPanel,
    closePanel,
    changeLanguage
};