// ===== Global State =====
const state = {
    currentCategory: 'hotels',
    data: null,
    tagsData: null,
    filteredData: null,
    currentLanguage: 'vi',
    vrViewer: null,
    selectedTags: [] // Array of selected tag IDs
};

// ===== VR360 Viewer Initialization =====
function initVRViewer() {
    try {
        state.vrViewer = pannellum.viewer('panorama', {
            type: 'equirectangular',
            panorama: 'https://pannellum.org/images/alma.jpg',
            autoLoad: true,
            autoRotate: -2,
            showControls: false,
            showFullscreenCtrl: false,
            showZoomCtrl: false,
            mouseZoom: true,
            compass: true,
            hfov: 100,
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
    langBtns: document.querySelectorAll('.lang-btn'),
    tagsSection: document.getElementById('tagsSection'),
    tagsToggleBtn: document.getElementById('tagsToggleBtn'),
    tagsBody: document.getElementById('tagsBody'),
    tagsGrid: document.getElementById('tagsGrid'),
    clearTags: document.getElementById('clearTags'),
    searchClearBtn: document.getElementById('searchClearBtn')
};

// ===== Map Modal Elements =====
const mapModal = document.getElementById('mapModal');
const closeMapModalBtn = document.getElementById('closeMapModal');

// ===== Action Buttons Elements =====
const actionButtons = document.getElementById('actionButtons');
const toggleButtonsBtn = document.getElementById('toggleButtonsBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

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
    const fullscreenElement = document.documentElement;

    if (!document.fullscreenElement && !document.webkitFullscreenElement &&
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        if (fullscreenElement.requestFullscreen) {
            fullscreenElement.requestFullscreen();
        } else if (fullscreenElement.webkitRequestFullscreen) {
            fullscreenElement.webkitRequestFullscreen();
        } else if (fullscreenElement.mozRequestFullScreen) {
            fullscreenElement.mozRequestFullScreen();
        } else if (fullscreenElement.msRequestFullscreen) {
            fullscreenElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// ===== Handle Fullscreen Change =====
function handleFullscreenChange() {
    const expandIcon = document.querySelector('.fullscreen-expand-icon');
    const compressIcon = document.querySelector('.fullscreen-compress-icon');
    const isFullscreen = !!(document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement);

    if (fullscreenBtn) {
        if (isFullscreen) {
            if (expandIcon) expandIcon.style.display = 'none';
            if (compressIcon) compressIcon.style.display = 'block';
            fullscreenBtn.setAttribute('title', 'Thu nhỏ');
        } else {
            if (expandIcon) expandIcon.style.display = 'block';
            if (compressIcon) compressIcon.style.display = 'none';
            fullscreenBtn.setAttribute('title', 'Toàn màn hình');
        }
    }
}

// ===== Initialize App =====
async function init() {
    try {
        initVRViewer();
        showLoading();
        await loadData();
        await loadTagsData();
        setupEventListeners();
        loadCategory('hotels');
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

// ===== Load Tags Data =====
async function loadTagsData() {
    try {
        const response = await fetch('data/tags.json');
        if (!response.ok) throw new Error('Failed to load tags');
        state.tagsData = await response.json();
    } catch (error) {
        console.error('Error loading tags:', error);
        state.tagsData = { tags: [] };
    }
}

// ===== Render Tags =====
function renderTags() {
    if (!state.tagsData || !state.tagsData.tags || !elements.tagsGrid) return;
    
    const lang = state.currentLanguage;
    const html = state.tagsData.tags.map(tag => {
        const isActive = state.selectedTags.includes(tag.id);
        return `
            <button class="tag-item ${isActive ? 'active' : ''}" 
                    data-tag-id="${tag.id}" 
                    style="--tag-color: ${tag.color}">
                <i class="fas ${tag.icon}"></i>
                <span>${tag.name[lang]}</span>
            </button>
        `;
    }).join('');
    
    elements.tagsGrid.innerHTML = html;
    attachTagListeners();
}

// ===== Attach Tag Listeners =====
function attachTagListeners() {
    const tagItems = document.querySelectorAll('.tag-item');
    tagItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const tagId = e.currentTarget.dataset.tagId;
            toggleTag(tagId);
        });
    });
}

// ===== Toggle Tag =====
function toggleTag(tagId) {
    const index = state.selectedTags.indexOf(tagId);
    
    if (index === -1) {
        // Add tag
        state.selectedTags.push(tagId);
    } else {
        // Remove tag
        state.selectedTags.splice(index, 1);
    }
    
    // Update UI
    renderTags();
    updateClearTagsButton();
    applyTagsFilter();
}

// ===== Update Clear Tags Button =====
function updateClearTagsButton() {
    if (elements.clearTags) {
        elements.clearTags.style.display = state.selectedTags.length > 0 ? 'flex' : 'none';
    }
}

// ===== Clear All Tags =====
function clearAllTags() {
    state.selectedTags = [];
    renderTags();
    updateClearTagsButton();
    loadCategory(state.currentCategory);
}

// ===== Apply Tags Filter =====
function applyTagsFilter() {
    const allData = state.data[state.currentCategory] || [];
    
    if (state.selectedTags.length === 0) {
        // No tags selected, show all
        state.filteredData = allData;
    } else {
        // Filter hotels that have ALL selected tags
        state.filteredData = allData.filter(item => {
            if (!item.tags || !Array.isArray(item.tags)) return false;
            
            // Check if item has all selected tags
            return state.selectedTags.every(tagId => item.tags.includes(tagId));
        });
    }
    
    renderContent();
}

// ===== Toggle Tags Section =====
function toggleTagsSection() {
    if (elements.tagsSection) {
        if (state.currentCategory === 'hotels') {
            elements.tagsSection.classList.add('active');
        } else {
            elements.tagsSection.classList.remove('active');
        }
    }
}

// ===== Toggle Tags Collapse =====
function toggleTagsCollapse() {
    if (elements.tagsSection) {
        elements.tagsSection.classList.toggle('collapsed');
    }
}

// ===== Clear Search =====
function clearSearch() {
    if (elements.searchInput) {
        elements.searchInput.value = '';
        elements.searchClearBtn.style.display = 'none';
        handleSearch({ target: elements.searchInput });
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Tags toggle
    if (elements.tagsToggleBtn) {
        elements.tagsToggleBtn.addEventListener('click', toggleTagsCollapse);
    }
    
    // Clear tags
    if (elements.clearTags) {
        elements.clearTags.addEventListener('click', clearAllTags);
    }
    
    // Search clear button
    if (elements.searchClearBtn) {
        elements.searchClearBtn.addEventListener('click', clearSearch);
    }
    
    // Search input - show/hide clear button
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', (e) => {
            if (elements.searchClearBtn) {
                elements.searchClearBtn.style.display = e.target.value ? 'flex' : 'none';
            }
        });
    }

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
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // Fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Search input
    elements.searchInput.addEventListener('input', handleSearch);

    // Language toggle
    elements.langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.currentTarget.dataset.lang;
            changeLanguage(lang);
        });
    });

    // Click outside panel to close
    document.addEventListener('click', (e) => {
        if (elements.contentPanel.classList.contains('active')) {
            const clickedOutside = !elements.contentPanel.contains(e.target) &&
                !e.target.closest('.nav-item[data-category]');
            if (clickedOutside && !e.target.closest('.action-btn')) {
                // closePanel();
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (mapModal && mapModal.classList.contains('active')) {
                closeMapModal();
            } else if (elements.contentPanel.classList.contains('active')) {
                closePanel();
            }
        }
    });

    // Map modal close button
    if (closeMapModalBtn) {
        closeMapModalBtn.addEventListener('click', closeMapModal);
    }

    // Close map modal when clicking outside
    if (mapModal) {
        mapModal.addEventListener('click', (e) => {
            if (e.target === mapModal) {
                closeMapModal();
            }
        });
    }

    // Toggle action buttons
    if (toggleButtonsBtn) {
        toggleButtonsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleActionButtons();
        });
    }
}

// ===== Navigation Click Handler =====
function handleNavClick(category) {
    if (category === 'map') {
        openMapModal();
        elements.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.category === 'map') {
                item.classList.add('active');
            }
        });
        return;
    }

    const clickedButton = Array.from(elements.navItems).find(
        item => item.dataset.category === category
    );

    if (clickedButton && clickedButton.classList.contains('active') &&
        elements.contentPanel.classList.contains('active')) {
        closePanel();
        clickedButton.classList.remove('active');
        return;
    }

    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.category === category) {
            item.classList.add('active');
        }
    });

    loadCategory(category);
    openPanel();
}

// ===== Load Category =====
function loadCategory(category) {
    state.currentCategory = category;
    state.filteredData = state.data[category] || [];

    elements.panelTitle.textContent = categoryTitles[state.currentLanguage][category] || category;

    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.searchClearBtn) elements.searchClearBtn.style.display = 'none';
    
    // Reset tags
    state.selectedTags = [];
    
    // Toggle tags section visibility
    toggleTagsSection();
    
    // Render tags if hotel category
    if (category === 'hotels') {
        renderTags();
        updateClearTagsButton();
    }

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
            `<img src="${item.image}" alt="${title}" onerror="this.parentElement.innerHTML='<span class=\\'card-placeholder\\'><i class=\\"fas fa-camera\\"></i></span>'">` :
            `<span class="card-placeholder"><i class="fas fa-camera"></i></span>`
        }
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${title}</h3>
                    ${rating ? `
                        <div class="card-rating">
                            <i class="fas fa-star"></i>
                            <span>${rating.toFixed(1)}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="card-description">
                    <span class="card-description-text">${description}</span><span class="read-more" style="display: none;"></span>
                </div>
                ${price ? `<div class="card-price">${price}</div>` : ''}
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
        const usdPrice = price / 24000;
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

    applyDescriptionTruncation();
    synchronizeRowHeights();
}

// ===== Synchronize Row Heights =====
function synchronizeRowHeights() {
    if (window.innerWidth <= 480) return;

    const cards = Array.from(document.querySelectorAll('.content-card'));
    if (cards.length === 0) return;

    cards.forEach(card => card.style.height = '');

    const rows = {};
    cards.forEach(card => {
        const top = card.offsetTop;
        if (!rows[top]) {
            rows[top] = [];
        }
        rows[top].push(card);
    });

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

        const wasExpanded = descriptionEl.classList.contains('expanded');

        if (isMobile) {
            if (!wasExpanded) {
                descriptionText.style.webkitLineClamp = '2';
            }
            title.classList.remove('two-lines');
        } else {
            const titleLineHeight = parseFloat(getComputedStyle(title).lineHeight);
            const titleHeight = title.scrollHeight;
            const titleLines = Math.round(titleHeight / titleLineHeight);

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

        setTimeout(() => {
            if (readMore.dataset.hasHandler === 'true') return;

            const descTextHeight = descriptionText.scrollHeight;
            const descTextVisibleHeight = descriptionText.clientHeight;

            if (descTextHeight > descTextVisibleHeight || wasExpanded) {
                descriptionEl.classList.add('truncated');
                readMore.style.display = 'inline';
                readMore.textContent = wasExpanded ? 'rút gọn' : 'xem thêm';
                readMore.dataset.hasHandler = 'true';

                readMore.onclick = (e) => {
                    e.stopPropagation();

                    const isExpanded = descriptionEl.classList.contains('expanded');

                    if (isExpanded) {
                        descriptionEl.classList.remove('expanded');
                        descriptionEl.classList.add('truncated');
                        readMore.textContent = 'xem thêm';
                        setTimeout(() => resetRowHeight(card), 50);
                    } else {
                        descriptionEl.classList.add('expanded');
                        descriptionEl.classList.remove('truncated');
                        readMore.textContent = 'rút gọn';
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
    return allCards.filter(card => Math.abs(card.offsetTop - targetTop) < 5);
}

// ===== Adjust Row Height =====
function adjustRowHeight(expandedCard) {
    const rowCards = getCardsInSameRow(expandedCard);

    rowCards.forEach(card => {
        card.style.height = '';
    });

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
    }, 100);
}

// ===== Reset Row Height =====
function resetRowHeight(collapsedCard) {
    const rowCards = getCardsInSameRow(collapsedCard);

    setTimeout(() => {
        const hasExpandedCard = rowCards.some(card => {
            const desc = card.querySelector('.card-description');
            return desc && desc.classList.contains('expanded');
        });

        if (!hasExpandedCard) {
            rowCards.forEach(card => {
                card.style.height = '';
            });

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
            adjustRowHeight(collapsedCard);
        }
    }, 100);
}

// ===== Card Click Handler =====
function handleCardClick(id) {
    const item = state.filteredData.find(item => item.id === id);
    if (item) {
        console.log('Card clicked:', item);
        closePanel();

        if (state.vrViewer && item.panoramaUrl) {
            loadVRPanorama(item);
        } else {
            console.log('No panorama URL for this location');
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
        // Re-apply tags filter if any tags selected
        if (state.selectedTags.length > 0) {
            applyTagsFilter();
            return;
        }
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
        
        // Apply tags filter to search results
        if (state.selectedTags.length > 0) {
            state.filteredData = state.filteredData.filter(item => {
                if (!item.tags || !Array.isArray(item.tags)) return false;
                return state.selectedTags.every(tagId => item.tags.includes(tagId));
            });
        }
    }

    renderContent();
}

// ===== Language Change =====
function changeLanguage(lang) {
    state.currentLanguage = lang;

    elements.langBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });

    elements.panelTitle.textContent = categoryTitles[lang][state.currentCategory];
    
    // Re-render tags with new language
    if (state.currentCategory === 'hotels') {
        renderTags();
    }

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
            <h3>Error</h3>
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

elements.searchInput.addEventListener('input', debounce(handleSearch, 300));

window.addEventListener('resize', debounce(applyDescriptionTruncation, 200));

// ===== Map Modal Functions =====
function openMapModal() {
    if (mapModal) {
        mapModal.classList.add('active');
        closePanel();
        elements.navItems.forEach(item => {
            if (item.dataset.category !== 'map') {
                item.classList.remove('active');
            }
        });
    }
}

function closeMapModal() {
    if (mapModal) {
        mapModal.classList.remove('active');
        elements.navItems.forEach(item => {
            if (item.dataset.category === 'map') {
                item.classList.remove('active');
            }
        });
    }
}

// ===== Toggle UI Visibility =====
function toggleActionButtons() {
    const body = document.body;
    const isHidden = body.classList.contains('ui-hidden');
    
    const arrowRightIcon = toggleButtonsBtn.querySelector('.fa-arrow-right');
    const arrowLeftIcon = toggleButtonsBtn.querySelector('.fa-arrow-left');
    
    if (isHidden) {
        body.classList.remove('ui-hidden');
        if (arrowRightIcon) arrowRightIcon.style.display = 'block';
        if (arrowLeftIcon) arrowLeftIcon.style.display = 'none';
        if (toggleButtonsBtn) toggleButtonsBtn.setAttribute('title', 'Ẩn toàn bộ UI');
    } else {
        body.classList.add('ui-hidden');
        if (arrowRightIcon) arrowRightIcon.style.display = 'none';
        if (arrowLeftIcon) arrowLeftIcon.style.display = 'block';
        if (toggleButtonsBtn) toggleButtonsBtn.setAttribute('title', 'Hiện toàn bộ UI');
    }
}

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