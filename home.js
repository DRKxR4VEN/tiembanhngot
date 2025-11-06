// Quản lý sản phẩm bánh ngọt
const ProductManager = {
    products: [],
    pagination: null,
    currentPage: 1,
    limit: 10,
    currentFilter: '', // Lọc theo loại bánh
    currentTab: 'all', // 'all' hoặc 'my'
    
    // Chuyển đổi tab
    async switchTab(tab) {
        this.currentTab = tab;
        
        // Cập nhật UI tabs
        document.getElementById('tabAll').classList.toggle('active', tab === 'all');
        document.getElementById('tabMy').classList.toggle('active', tab === 'my');
        
        // Ẩn/hiện filter section
        const filterSection = document.getElementById('filterSection');
        if (filterSection) {
            filterSection.style.display = tab === 'all' ? 'block' : 'none';
        }
        
        // Cập nhật title
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            const titleSpan = sectionTitle.querySelector('span:last-child');
            if (titleSpan) {
                titleSpan.textContent = tab === 'all' ? 'Danh Sách Bánh Ngọt' : 'Bánh Của Tôi';
            }
        }
        
        // Reset filter khi chuyển tab
        if (tab === 'my') {
            this.currentFilter = '';
            const filterSelect = document.getElementById('filterType');
            if (filterSelect) filterSelect.value = '';
        }
        
        // Load dữ liệu
        await this.loadProducts(1, this.currentFilter);
    },
    
    // Load sản phẩm từ localStorage hoặc API
    async loadProducts(trang = 1, loại = '') {
        this.currentPage = trang;
        this.currentFilter = loại || '';
        
        // Thử load từ API trước
        try {
            let result;
            if (this.currentTab === 'my') {
                // Load bánh của tôi
                result = await ProductAPI.getMyCakes(trang, this.limit);
                
                // Xử lý lỗi 401 (chưa đăng nhập)
                if (result.status === 401) {
                    this.products = [];
                    this.pagination = null;
                    this.renderProducts();
                    this.showMessage('Vui lòng đăng nhập để xem bánh của bạn', 'error');
                    return;
                }
            } else {
                // Load tất cả bánh
                result = await ProductAPI.getProducts(trang, this.limit, loại);
            }
            if (result.success && result.data) {
                // Nếu API trả về array
                if (Array.isArray(result.data)) {
                    this.products = result.data;
                } else {
                    // Nếu API trả về object đơn
                    this.products = [result.data];
                }
                
                // Lưu pagination info
                if (result.pagination) {
                    this.pagination = result.pagination;
                }
                
                this.saveProducts();
                this.renderProducts();
                this.renderPagination();
                return;
            }
        } catch (error) {
            console.warn('API không khả dụng, thử load từ localStorage');
        }
        
        // Fallback: Load từ localStorage
        const savedProducts = localStorage.getItem('productsList');
        if (savedProducts) {
            try {
                const parsed = JSON.parse(savedProducts);
                if (Array.isArray(parsed)) {
                    this.products = parsed;
                } else {
                    this.products = [parsed];
                }
                this.renderProducts();
            } catch (e) {
                console.error('Error loading products:', e);
            }
        }
    },
    
    // Lưu sản phẩm vào localStorage
    saveProducts() {
        localStorage.setItem('productsList', JSON.stringify(this.products));
    },
    
    // Thêm sản phẩm mới
    async addProduct(productData) {
        // Validate
        if (!productData.name || !productData.category || !productData.price) {
            throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
        
        // Tạo sản phẩm mới với ID
        const newProduct = {
            id: Date.now(), // Tạo ID đơn giản
            name: productData.name,
            category: productData.category,
            price: parseInt(productData.price),
            image: productData.image || '',
            description: productData.description || ''
        };
        
        // Thử gọi API trước
        try {
            const result = await ProductAPI.createProduct(newProduct);
            if (result.success && result.data) {
                this.products.unshift(result.data); // Thêm vào đầu danh sách
            } else {
                // Nếu API lỗi, thêm vào local
                this.products.unshift(newProduct);
            }
        } catch (error) {
            // Nếu không có API, thêm vào local
            this.products.unshift(newProduct);
        }
        
        this.saveProducts();
        this.renderProducts();
        
        return newProduct;
    },
    
    // Xóa sản phẩm
    deleteProduct(productId) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.renderProducts();
            this.showMessage('Đã xóa sản phẩm thành công!', 'success');
        }
    },
    
    // Render danh sách sản phẩm
    renderProducts() {
        const productsList = document.getElementById('productsList');
        if (!productsList) return;
        
        if (this.products.length === 0) {
            productsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🍰</div>
                    <p>Chưa có sản phẩm nào</p>
                    <p style="font-size: 12px; margin-top: 5px;">Tạo sản phẩm đầu tiên của bạn!</p>
                </div>
            `;
            return;
        }
        
        productsList.innerHTML = this.products.map(product => `
            <div class="product-item" onclick="ProductManager.viewProductDetail(${product.id})">
                ${product.image ? `
                    <div class="product-image-preview">
                        <img src="${this.escapeHtml(product.image)}" alt="${this.escapeHtml(product.name)}" 
                             onerror="this.style.display='none'">
                    </div>
                ` : ''}
                <div class="product-header">
                    <div>
                        <h3 class="product-name">${this.escapeHtml(product.name)}</h3>
                        <span class="product-category">${this.escapeHtml(product.category)}</span>
                    </div>
                </div>
                ${product.description ? `<p class="product-description">${this.escapeHtml(product.description)}</p>` : ''}
                <div class="product-creator">
                    ${product.creator_username ? `
                        <div class="creator-info">
                            <span class="creator-label">👤 Người tạo:</span>
                            <span class="creator-name">${this.escapeHtml(product.creator_name || product.creator_username)}</span>
                        </div>
                    ` : ''}
                    ${product.created_at ? `
                        <div class="product-date">
                            <span class="date-label">📅 Tạo lúc:</span>
                            <span>${this.formatDate(product.created_at)}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="product-footer">
                    <div class="product-price">${this.formatPrice(product.price)}</div>
                    <div class="product-actions" onclick="event.stopPropagation()">
                        ${this.currentTab === 'my' ? `
                            <button class="btn-small btn-delete" onclick="ProductManager.deleteProduct(${product.id})">
                                Xóa
                            </button>
                        ` : ''}
                        <button class="btn-small btn-edit" onclick="ProductManager.viewProductDetail(${product.id})">
                            Chi tiết
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    // Lọc theo loại bánh
    async filterByType(loại) {
        // Chỉ filter khi ở tab "Tất cả"
        if (this.currentTab !== 'all') {
            return;
        }
        // Reset về trang 1 khi filter
        await this.loadProducts(1, loại);
    },
    
    // Xem chi tiết sản phẩm
    async viewProductDetail(productId) {
        try {
            const result = await ProductAPI.getProductById(productId);
            if (result.success && result.data) {
                // Hiển thị modal hoặc alert với thông tin chi tiết
                const product = result.data;
                const detailHTML = `
                    <div style="text-align: left;">
                        <h2 style="color: #6D28D9; margin-bottom: 15px;">${this.escapeHtml(product.name)}</h2>
                        <p><strong>Danh mục:</strong> ${this.escapeHtml(product.category)}</p>
                        <p><strong>Giá:</strong> ${this.formatPrice(product.price)}</p>
                        ${product.description ? `<p><strong>Mô tả:</strong> ${this.escapeHtml(product.description)}</p>` : ''}
                        ${product.creator_name ? `<p><strong>Người tạo:</strong> ${this.escapeHtml(product.creator_name)}</p>` : ''}
                        ${product.created_at ? `<p><strong>Ngày tạo:</strong> ${this.formatDate(product.created_at)}</p>` : ''}
                        ${product.updated_at ? `<p><strong>Cập nhật:</strong> ${this.formatDate(product.updated_at)}</p>` : ''}
                    </div>
                `;
                alert(detailHTML.replace(/<[^>]*>/g, '')); // Simple alert, có thể thay bằng modal đẹp hơn
            } else {
                this.showMessage(result.message || 'Không thể tải chi tiết sản phẩm', 'error');
            }
        } catch (error) {
            this.showMessage('Có lỗi xảy ra khi tải chi tiết sản phẩm', 'error');
        }
    },
    
    // Render pagination
    renderPagination() {
        const productsSection = document.querySelector('.products-section');
        if (!productsSection || !this.pagination) return;
        
        // Xóa pagination cũ nếu có
        const oldPagination = productsSection.querySelector('.pagination');
        if (oldPagination) {
            oldPagination.remove();
        }
        
        const { page, totalPages, total } = this.pagination;
        
        if (totalPages <= 1) return; // Không hiển thị nếu chỉ có 1 trang
        
        const filterParam = this.currentFilter ? `, '${this.escapeHtml(this.currentFilter)}'` : '';
        const paginationHTML = `
            <div class="pagination">
                <div class="pagination-info">
                    Trang ${page} / ${totalPages} (Tổng: ${total} sản phẩm)
                </div>
                <div class="pagination-buttons">
                    <button class="pagination-btn" ${page === 1 ? 'disabled' : ''} 
                            onclick="ProductManager.loadProducts(${page - 1}${filterParam})">
                        ← Trước
                    </button>
                    ${this.generatePageNumbers(page, totalPages)}
                    <button class="pagination-btn" ${page === totalPages ? 'disabled' : ''} 
                            onclick="ProductManager.loadProducts(${page + 1}${filterParam})">
                        Sau →
                    </button>
                </div>
            </div>
        `;
        
        productsSection.insertAdjacentHTML('beforeend', paginationHTML);
    },
    
    // Tạo số trang
    generatePageNumbers(currentPage, totalPages) {
        let pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            // Hiển thị tất cả
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Hiển thị một phần
            if (currentPage <= 3) {
                pages = [1, 2, 3, 4, '...', totalPages];
            } else if (currentPage >= totalPages - 2) {
                pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
            }
        }
        
        return pages.map(p => {
            if (p === '...') {
                return '<span class="pagination-dots">...</span>';
            }
            const isActive = p === currentPage;
            const filterParam = this.currentFilter ? `, '${this.escapeHtml(this.currentFilter)}'` : '';
            return `
                <button class="pagination-btn ${isActive ? 'active' : ''}" 
                        onclick="ProductManager.loadProducts(${p}${filterParam})">
                    ${p}
                </button>
            `;
        }).join('');
    },
    
    // Format ngày tháng
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    },
    
    // Format giá tiền
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price) + '₫';
    },
    
    // Escape HTML để tránh XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Hiển thị thông báo
    showMessage(message, type = 'success') {
        const messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) return;
        
        const messageClass = type === 'success' ? 'success-message' : 'error-message';
        messageContainer.innerHTML = `<div class="${messageClass}">${this.escapeHtml(message)}</div>`;
        
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            messageContainer.innerHTML = '';
        }, 3000);
    }
};

// Xử lý form tạo sản phẩm
const createProductForm = document.getElementById('createProductForm');
const submitButton = document.getElementById('submitButton');

if (createProductForm) {
    createProductForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable button
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>Đang tạo...</span>';
        
        // Lấy dữ liệu form
        const formData = new FormData(createProductForm);
        const productData = {
            name: formData.get('name'),
            category: formData.get('category'),
            price: formData.get('price'),
            image: formData.get('image'),
            description: formData.get('description')
        };
        
        try {
            // Thêm sản phẩm
            await ProductManager.addProduct(productData);
            
            // Hiển thị thông báo thành công
            ProductManager.showMessage('Tạo bánh ngọt thành công! 🎉', 'success');
            
            // Reset form
            createProductForm.reset();
            
            // Reload danh sách để hiển thị sản phẩm mới
            await ProductManager.loadProducts(1, ProductManager.currentFilter);
            
        } catch (error) {
            // Hiển thị lỗi
            ProductManager.showMessage(error.message || 'Có lỗi xảy ra khi tạo sản phẩm', 'error');
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.innerHTML = '<span>Tạo Bánh Ngọt</span>';
        }
    });
}

// Load sản phẩm khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    ProductManager.loadProducts();
});

// Export để có thể dùng từ HTML
window.ProductManager = ProductManager;

