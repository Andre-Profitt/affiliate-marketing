// State Management
let state = {
    products: [],
    selectedProducts: [],
    currentPlatform: 'both',
    currentCategory: 'all',
    loading: false
};

// DOM Elements
const elements = {
    totalProducts: document.getElementById('total-products'),
    selectedCount: document.getElementById('selected-count'),
    campaignCount: document.getElementById('campaign-count'),
    categoryPills: document.getElementById('category-pills'),
    productsGrid: document.getElementById('products-grid'),
    loadingContainer: document.getElementById('loading'),
    productsSection: document.getElementById('products-section'),
    selectedPanel: document.getElementById('selected-panel'),
    selectedProducts: document.getElementById('selected-products'),
    createCampaignBtn: document.getElementById('create-campaign-btn'),
    aiInsights: document.getElementById('ai-insights'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadCategories();
    loadProducts();
});

// Event Listeners
function initializeEventListeners() {
    // Platform buttons
    document.querySelectorAll('.platform-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.currentPlatform = e.target.dataset.platform;
            loadCategories();
            loadProducts();
        });
    });

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', loadProducts);

    // Create campaign button
    elements.createCampaignBtn.addEventListener('click', showSelectedPanel);

    // Panel close button
    document.getElementById('close-panel').addEventListener('click', hideSelectedPanel);

    // Generate campaign button
    document.getElementById('generate-campaign').addEventListener('click', createCampaign);
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`/api/categories/${state.currentPlatform}`);
        const data = await response.json();
        
        if (data.success) {
            renderCategories(data.categories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render categories
function renderCategories(categories) {
    elements.categoryPills.innerHTML = categories.map(cat => `
        <button class="category-pill ${cat.id === state.currentCategory ? 'active' : ''} ${cat.trending ? 'trending' : ''}" 
                data-category="${cat.id}">
            ${cat.icon} ${cat.name}
        </button>
    `).join('');
    
    // Add click listeners
    elements.categoryPills.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.currentCategory = e.currentTarget.dataset.category;
            loadProducts();
        });
    });
}

// Load products
async function loadProducts() {
    state.loading = true;
    showLoading();
    
    try {
        const params = new URLSearchParams({
            platform: state.currentPlatform,
            limit: 10
        });
        
        if (state.currentCategory !== 'all') {
            params.append('category', state.currentCategory);
        }
        
        const response = await fetch(`/api/products/trending?${params}`);
        const data = await response.json();
        
        if (data.success) {
            state.products = data.products;
            renderProducts(data.products);
            updateStats();
            
            // Show AI insights if available
            if (data.insights) {
                showAIInsights(data.insights);
            }
        } else {
            showToast('Erro ao carregar produtos', 'error');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Erro ao conectar com o servidor', 'error');
    } finally {
        state.loading = false;
        hideLoading();
    }
}

// Render products
function renderProducts(products) {
    elements.productsGrid.innerHTML = products.map((product, index) => {
        const isSelected = state.selectedProducts.some(p => p.id === product.id);
        
        return `
            <div class="product-card ${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
                <span class="product-badge badge-${product.platform}">${product.platform}</span>
                <img src="${product.image || 'https://via.placeholder.com/280x200'}" 
                     alt="${product.title}" 
                     class="product-image"
                     onerror="this.src='https://via.placeholder.com/280x200'">
                <div class="product-content">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price">
                        <span class="price-current">${formatPrice(product.price)}</span>
                        ${product.savings?.percentage ? `<span class="price-discount">${product.savings.percentage}% OFF</span>` : ''}
                    </div>
                    <div class="product-meta">
                        ${product.reviews?.rating ? `
                            <div class="product-rating">
                                <span class="rating-stars">⭐</span>
                                <span>${product.reviews.rating}</span>
                            </div>
                        ` : ''}
                        ${product.sold ? `<span>📦 ${product.sold}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn" onclick="toggleProductSelection('${product.id}')">
                            ${isSelected ? '✓ Selecionado' : '+ Selecionar'}
                        </button>
                        <button class="action-btn primary" onclick="generateAffiliateLink('${product.id}')">
                            🔗 Gerar Link
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    elements.productsSection.classList.add('active');
}

// Toggle product selection
function toggleProductSelection(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    
    const index = state.selectedProducts.findIndex(p => p.id === productId);
    
    if (index > -1) {
        state.selectedProducts.splice(index, 1);
    } else {
        state.selectedProducts.push(product);
    }
    
    // Update UI
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    card.classList.toggle('selected');
    
    const actionBtn = card.querySelector('.action-btn');
    actionBtn.textContent = index > -1 ? '+ Selecionar' : '✓ Selecionado';
    
    updateStats();
}

// Generate affiliate link
async function generateAffiliateLink(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    
    try {
        const response = await fetch('/api/affiliate/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                platform: product.platform,
                productId: product.platform === 'amazon' ? product.asin || product.id : product.id,
                url: product.url,
                campaignId: 'dashboard_single'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showLinkModal(data, product);
        } else {
            showToast('Erro ao gerar link', 'error');
        }
    } catch (error) {
        console.error('Error generating link:', error);
        showToast('Erro ao gerar link de afiliado', 'error');
    }
}

// Show link modal
function showLinkModal(linkData, product) {
    document.getElementById('affiliate-link').value = linkData.shortLink || linkData.affiliateLink;
    document.getElementById('link-product-name').textContent = product.title;
    document.getElementById('link-product-price').textContent = formatPrice(product.price);
    
    document.getElementById('link-modal').classList.add('active');
}

// Copy link
window.copyLink = function() {
    const linkInput = document.getElementById('affiliate-link');
    linkInput.select();
    document.execCommand('copy');
    showToast('Link copiado!', 'success');
}

// Show selected panel
function showSelectedPanel() {
    elements.selectedPanel.classList.add('active');
    renderSelectedProducts();
}

// Hide selected panel
function hideSelectedPanel() {
    elements.selectedPanel.classList.remove('active');
}

// Render selected products
function renderSelectedProducts() {
    elements.selectedProducts.innerHTML = state.selectedProducts.map(product => `
        <div class="selected-product">
            <img src="${product.image || 'https://via.placeholder.com/60x60'}" 
                 alt="${product.title}" 
                 class="selected-product-image">
            <div class="selected-product-info">
                <div class="selected-product-title">${product.title}</div>
                <div class="selected-product-price">${formatPrice(product.price)}</div>
            </div>
            <button class="close-btn" onclick="toggleProductSelection('${product.id}')">×</button>
        </div>
    `).join('');
}

// Create campaign
async function createCampaign() {
    const campaignName = document.getElementById('campaign-name').value || 'Campanha ' + new Date().toLocaleDateString('pt-BR');
    
    if (state.selectedProducts.length === 0) {
        showToast('Selecione pelo menos um produto', 'warning');
        return;
    }
    
    try {
        showToast('Criando campanha...', 'info');
        
        const response = await fetch('/api/campaign/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                products: state.selectedProducts,
                campaignName,
                platforms: ['whatsapp', 'instagram']
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showCampaignModal(data);
            // Clear selections
            state.selectedProducts = [];
            updateStats();
            hideSelectedPanel();
            loadProducts(); // Refresh
        } else {
            showToast('Erro ao criar campanha', 'error');
        }
    } catch (error) {
        console.error('Error creating campaign:', error);
        showToast('Erro ao criar campanha', 'error');
    }
}

// Show campaign modal
function showCampaignModal(campaignData) {
    const resultsHtml = campaignData.products.map(item => `
        <div class="campaign-product">
            <div class="campaign-product-header">
                <img src="${item.product.image || 'https://via.placeholder.com/80x80'}" 
                     alt="${item.product.title}" 
                     class="campaign-product-image">
                <div class="campaign-product-info">
                    <h4>${item.product.title}</h4>
                    <p>${formatPrice(item.product.price)}</p>
                </div>
            </div>
            <div class="campaign-links">
                <div class="link-item">
                    <span class="link-label">Link Afiliado:</span>
                    <span class="link-value" onclick="copyText('${item.affiliateLink.shortLink || item.affiliateLink.affiliateLink}')">
                        ${item.affiliateLink.shortLink || item.affiliateLink.affiliateLink}
                    </span>
                </div>
            </div>
            <div class="campaign-content">
                <p class="content-preview">${item.content.text.substring(0, 150)}...</p>
            </div>
        </div>
    `).join('');
    
    document.getElementById('campaign-results').innerHTML = resultsHtml;
    document.getElementById('campaign-modal').classList.add('active');
    
    showToast('Campanha criada com sucesso!', 'success');
}

// Utility Functions
function formatPrice(price) {
    if (typeof price === 'object' && price.formatted) {
        return price.formatted;
    }
    if (typeof price === 'object' && price.amount) {
        return `R$ ${price.amount.toFixed(2).replace('.', ',')}`;
    }
    if (typeof price === 'number') {
        return `R$ ${price.toFixed(2).replace('.', ',')}`;
    }
    return price || 'N/A';
}

function showLoading() {
    elements.loadingContainer.classList.add('active');
    elements.productsSection.classList.remove('active');
}

function hideLoading() {
    elements.loadingContainer.classList.remove('active');
}

function updateStats() {
    elements.totalProducts.textContent = state.products.length;
    elements.selectedCount.textContent = state.selectedProducts.length;
    elements.campaignCount.textContent = state.selectedProducts.length;
    elements.createCampaignBtn.disabled = state.selectedProducts.length === 0;
}

function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast active ${type}`;
    
    setTimeout(() => {
        elements.toast.classList.remove('active');
    }, 3000);
}

function showAIInsights(insights) {
    if (insights.trends || insights.suggestion) {
        elements.aiInsights.textContent = `💡 AI Insight: ${insights.trends || insights.suggestion}`;
        elements.aiInsights.classList.add('active');
    }
}

// Global functions
window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.copyText = function(text) {
    navigator.clipboard.writeText(text);
    showToast('Copiado!', 'success');
}
