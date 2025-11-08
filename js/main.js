// ===== Global State =====
const state = {
    currentCategory: 'hotels',
    data: null,
    filteredData: null,
    currentLanguage: 'vi',
    vrViewer: null
};

// ===== VR360 Viewer Initialization =====
function initVRViewer() {
    try {
        // Initialize Pannellum VR viewer
        state.vrViewer = pannellum.viewer('panorama', {
            type: 'equirectangular',
            // Sample panorama - thay bằng ảnh 360 thực tế của bạn
            panorama: 'https://pannellum.org/images/alma.jpg',
            autoLoad: true,
            autoRotate: -2, // Tự động xoay chậm
            showControls: true,
            showFullscreenCtrl: true,
            showZoomCtrl: true,
            mouseZoom: true,
            compass: true,
            hfov: 100, // Field of view
            pitch: 0,
            yaw: 0,
            minHfov: 50,
            maxHfov: 120
        });
        
        console.log('VR360 viewer initialized successfully');
    } catch (error) {
        console.error('Error initializing VR viewer:', error);
    }
}

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
        hotels: 'DANH SÁCH KHÁCH SẠN TẠI PHAN THIẾT',
        attractions: 'ĐIỂM DU LỊCH',
        heritage: 'DI TÍCH LỊCH SỬ',
        scenery: 'DANH THẮNG',
        info: 'THÔNG TIN',
        map: 'BẢN ĐỒ'
    },
    en: {
        hotels: 'LIST OF HOTELS IN PHAN THIET',
        attractions: 'TOURIST ATTRACTIONS',
        heritage: 'HISTORICAL SITES',
        scenery: 'SCENIC SPOTS',
        info: 'INFORMATION',
        map: 'MAP'
    }
};

// ===== Toggle Fullscreen =====
function toggleFullscreen() {
    const panoramaContainer = document.getElementById('panorama');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        // Enter fullscreen
        if (panoramaContainer.requestFullscreen) {
            panoramaContainer.requestFullscreen();
        } else if (panoramaContainer.webkitRequestFullscreen) {
            panoramaContainer.webkitRequestFullscreen();
        } else if (panoramaContainer.mozRequestFullScreen) {
            panoramaContainer.mozRequestFullScreen();
        } else if (panoramaContainer.msRequestFullscreen) {
            panoramaContainer.msRequestFullscreen();
        }
        
        // Add active class
        if (fullscreenBtn) {
            fullscreenBtn.classList.add('active');
        }
    } else {
        exitFullscreen();
    }
}

// ===== Exit Fullscreen =====
function exitFullscreen() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    // Exit fullscreen
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    
    // Remove active class
    if (fullscreenBtn) {
        fullscreenBtn.classList.remove('active');
    }
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const expandIcon = document.querySelector('.fullscreen-expand-icon');
    const compressIcon = document.querySelector('.fullscreen-compress-icon');
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                            document.mozFullScreenElement || document.msFullscreenElement);
    
    if (fullscreenBtn) {
        if (isFullscreen) {
            fullscreenBtn.classList.add('active');
            // Show compress icon, hide expand icon
            if (expandIcon) expandIcon.style.display = 'none';
            if (compressIcon) compressIcon.style.display = 'block';
        } else {
            fullscreenBtn.classList.remove('active');
            // Show expand icon, hide compress icon
            if (expandIcon) expandIcon.style.display = 'block';
            if (compressIcon) compressIcon.style.display = 'none';
        }
    }
}

// ===== Initialize App =====
async function init() {
    try {
        // Initialize VR viewer first
        initVRViewer();
        
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

    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

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
                <div class="card-description">
                    <span class="card-description-text">${description}</span><span class="read-more" style="display: none;"></span>
                </div>
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
    
    // Apply truncation logic for card descriptions
    applyDescriptionTruncation();
    
    // Synchronize initial row heights
    synchronizeRowHeights();
}

// ===== Synchronize Row Heights =====
function synchronizeRowHeights() {
    // Skip on mobile
    if (window.innerWidth <= 480) return;
    
    const cards = Array.from(document.querySelectorAll('.content-card'));
    if (cards.length === 0) return;
    
    // Reset all heights first
    cards.forEach(card => card.style.height = '');
    
    // Group cards by row
    const rows = {};
    cards.forEach(card => {
        const top = card.offsetTop;
        if (!rows[top]) {
            rows[top] = [];
        }
        rows[top].push(card);
    });
    
    // Set equal height for each row
    Object.values(rows).forEach(rowCards => {
        let maxHeight = 0;
        rowCards.forEach(card => {
            const cardHeight = card.scrollHeight;
            if (cardHeight > maxHeight) {
                maxHeight = cardHeight;
            }
        });
        
        rowCards.forEach(card => {
            card.style.height = maxHeight + 'px';
        });
    });
}

// ===== Apply Description Truncation Logic =====
function applyDescriptionTruncation() {
    const cards = document.querySelectorAll('.content-card');
    const isMobile = window.innerWidth <= 480;
    
    cards.forEach(card => {
        const title = card.querySelector('.card-title');
        const descriptionEl = card.querySelector('.card-description');
        const descriptionText = card.querySelector('.card-description-text');
        const readMore = card.querySelector('.read-more');
        
        if (!title || !descriptionEl || !descriptionText || !readMore) return;
        
        // DON'T reset expanded state - keep it if it exists
        const wasExpanded = descriptionEl.classList.contains('expanded');
        
        // On mobile, always use 2 lines
        if (isMobile) {
            if (!wasExpanded) {
                descriptionText.style.webkitLineClamp = '2';
            }
            title.classList.remove('two-lines');
        } else {
            // Check if title is 2 lines on desktop/tablet
            const titleLineHeight = parseFloat(getComputedStyle(title).lineHeight);
            const titleHeight = title.scrollHeight;
            const titleLines = Math.round(titleHeight / titleLineHeight);
            
            // Adjust description line clamp based on title lines (only if not expanded)
            if (!wasExpanded) {
                if (titleLines >= 2) {
                    title.classList.add('two-lines');
                    descriptionText.style.webkitLineClamp = '2';
                } else {
                    title.classList.remove('two-lines');
                    descriptionText.style.webkitLineClamp = '3';
                }
            }
        }
        
        // Wait for DOM update before checking truncation
        setTimeout(() => {
            // If already has click handler, skip
            if (readMore.dataset.hasHandler === 'true') return;
            
            const descTextHeight = descriptionText.scrollHeight;
            const descTextVisibleHeight = descriptionText.clientHeight;
            
            if (descTextHeight > descTextVisibleHeight || wasExpanded) {
                descriptionEl.classList.add('truncated');
                readMore.style.display = 'inline';
                readMore.textContent = wasExpanded ? 'rút gọn' : 'xem thêm';
                readMore.dataset.hasHandler = 'true';
                
                // Add click handler for "xem thêm" / "rút gọn"
                readMore.onclick = (e) => {
                    e.stopPropagation();
                    
                    const isExpanded = descriptionEl.classList.contains('expanded');
                    
                    if (isExpanded) {
                        // Collapse
                        descriptionEl.classList.remove('expanded');
                        descriptionEl.classList.add('truncated');
                        readMore.textContent = 'xem thêm';
                        // Reset row height after collapse animation
                        setTimeout(() => resetRowHeight(card), 50);
                    } else {
                        // Expand
                        descriptionEl.classList.add('expanded');
                        descriptionEl.classList.remove('truncated');
                        readMore.textContent = 'rút gọn';
                        // Adjust row height after expand animation
                        setTimeout(() => adjustRowHeight(card), 50);
                    }
                };
            } else {
                descriptionEl.classList.remove('truncated');
                readMore.style.display = 'none';
            }
        }, 50);
    });
}

// ===== Get Cards in Same Row =====
function getCardsInSameRow(targetCard) {
    const allCards = Array.from(document.querySelectorAll('.content-card'));
    const targetTop = targetCard.offsetTop;
    
    // Find all cards with the same offsetTop (same row)
    return allCards.filter(card => Math.abs(card.offsetTop - targetTop) < 5);
}

// ===== Adjust Row Height =====
function adjustRowHeight(expandedCard) {
    // Get all cards in the same row
    const rowCards = getCardsInSameRow(expandedCard);
    
    // Remove inline height first to get natural height
    rowCards.forEach(card => {
        card.style.height = '';
    });
    
    // Wait a bit for the description to expand
    setTimeout(() => {
        // Find the tallest card in the row
        let maxHeight = 0;
        rowCards.forEach(card => {
            const cardHeight = card.scrollHeight;
            if (cardHeight > maxHeight) {
                maxHeight = cardHeight;
            }
        });
        
        // Set all cards in the row to the same height
        rowCards.forEach(card => {
            card.style.height = maxHeight + 'px';
        });
    }, 100);
}

// ===== Reset Row Height =====
function resetRowHeight(collapsedCard) {
    // Get all cards in the same row
    const rowCards = getCardsInSameRow(collapsedCard);
    
    // Wait for collapse animation to complete
    setTimeout(() => {
        // Check if any card in the row is still expanded
        const hasExpandedCard = rowCards.some(card => {
            const desc = card.querySelector('.card-description');
            return desc && desc.classList.contains('expanded');
        });
        
        if (!hasExpandedCard) {
            // Remove inline height to recalculate natural heights
            rowCards.forEach(card => {
                card.style.height = '';
            });
            
            // Wait for DOM to update, then synchronize heights
            setTimeout(() => {
                let maxHeight = 0;
                rowCards.forEach(card => {
                    const cardHeight = card.scrollHeight;
                    if (cardHeight > maxHeight) {
                        maxHeight = cardHeight;
                    }
                });
                
                rowCards.forEach(card => {
                    card.style.height = maxHeight + 'px';
                });
            }, 50);
        } else {
            // Recalculate height if there are still expanded cards
            adjustRowHeight(collapsedCard);
        }
    }, 100);
}

// ===== Card Click Handler =====
function handleCardClick(id) {
    const item = state.filteredData.find(item => item.id === id);
    if (item) {
        console.log('Card clicked:', item);
        
        // Close the panel to show VR view
        closePanel();
        
        // Load VR panorama if available
        if (state.vrViewer && item.panoramaUrl) {
            loadVRPanorama(item);
        } else {
            // Fallback if no panorama URL
            console.log('No panorama URL for this location');
            // You can show a message or use default panorama
        }
    }
}

// ===== Load VR Panorama =====
function loadVRPanorama(item) {
    try {
        if (!state.vrViewer) {
            console.error('VR viewer not initialized');
            return;
        }
        
        // Load new panorama
        state.vrViewer.loadScene(item.id, {
            type: 'equirectangular',
            panorama: item.panoramaUrl,
            pitch: item.pitch || 0,
            yaw: item.yaw || 0,
            hfov: item.hfov || 100
        });
        
        console.log(`Loaded panorama for: ${item.name.vi}`);
    } catch (error) {
        console.error('Error loading panorama:', error);
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

// Re-apply truncation on window resize
window.addEventListener('resize', debounce(applyDescriptionTruncation, 200));

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

