// API Service cho sản phẩm bánh
const ProductAPI = {
    // URL API - endpoint theo tài liệu
    baseUrl: '/api/bánh', // Endpoint lấy danh sách bánh
    
    // Hàm lấy chi tiết 1 bánh theo ID
    // GET /api/bánh/{id}
    async getProductById(id) {
        try {
            const url = `${this.baseUrl}/${id}`;
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });
            
            if (response.status === 404) {
                return {
                    success: false,
                    message: 'Không tìm thấy bánh',
                    error: 'Not Found',
                    status: 404
                };
            }
            
            if (response.status === 500) {
                return {
                    success: false,
                    message: 'Máy chủ lỗi',
                    error: 'Server Error',
                    status: 500
                };
            }
            
            const result = await response.json();
            
            // Xử lý response có thể là object trực tiếp hoặc có success/data
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data
                };
            } else if (result.name || result.id) {
                // Nếu response là object sản phẩm trực tiếp
                return {
                    success: true,
                    data: result
                };
            } else {
                return {
                    success: false,
                    message: result.message || 'Không thể tải sản phẩm',
                    error: result.error
                };
            }
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến server',
                error: error.message
            };
        }
    },
    
    // Hàm lấy sản phẩm từ API (backward compatibility)
    async getProduct(productId = null) {
        if (productId) {
            return this.getProductById(productId);
        }
        // Nếu không có ID, trả về lỗi
        return {
            success: false,
            message: 'Vui lòng cung cấp ID sản phẩm'
        };
    },
    
    // Hàm lấy danh sách bánh của người dùng hiện tại
    // GET /api/cakes/của tôi
    async getMyCakes(trang = 1, gioi_han = 10) {
        try {
            const url = `/api/cakes/của tôi?trang=${trang}&giới hạn=${gioi_han}`;
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                return {
                    success: false,
                    message: 'Chưa đăng nhập',
                    error: 'Unauthorized',
                    status: 401
                };
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                return {
                    success: false,
                    message: 'Chưa đăng nhập',
                    error: 'Unauthorized',
                    status: 401
                };
            }
            
            if (response.status === 500) {
                return {
                    success: false,
                    message: 'Máy chủ lỗi',
                    error: 'Server Error',
                    status: 500
                };
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data,
                    pagination: result.pagination || null
                };
            } else {
                return {
                    success: false,
                    message: result.message || 'Không thể tải danh sách bánh của bạn',
                    error: result.error
                };
            }
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến server',
                error: error.message
            };
        }
    },
    
    // Hàm lấy danh sách sản phẩm với pagination
    // Parameters: trang (page), giới hạn (limit), loại (type/category filter)
    async getProducts(trang = 1, gioi_han = 10, loại = '') {
        try {
            let url = `${this.baseUrl}?trang=${trang}&giới hạn=${gioi_han}`;
            if (loại && loại.trim() !== '') {
                url += `&loại=${encodeURIComponent(loại)}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data,
                    pagination: result.pagination || null
                };
            } else {
                return {
                    success: false,
                    message: result.message || 'Không thể tải danh sách sản phẩm',
                    error: result.error
                };
            }
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến server',
                error: error.message
            };
        }
    },
    
    // Hàm tạo sản phẩm mới
    async createProduct(productData) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data
                };
            } else {
                return {
                    success: false,
                    message: result.message || 'Không thể tạo sản phẩm',
                    error: result.error
                };
            }
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến server',
                error: error.message
            };
        }
    }
};

// API Service cho Profile
const ProfileAPI = {
    // URL API - endpoint lấy thông tin profile
    baseUrl: '/api/profile', // Hoặc URL API của bạn
    
    // Hàm lấy thông tin profile của user hiện tại
    async getProfile() {
        try {
            const token = localStorage.getItem('authToken');
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: headers
            });
            
            // Kiểm tra status code
            if (!response.ok) {
                try {
                    const errorResult = await response.json();
                    if (errorResult.success === false) {
                        return {
                            success: false,
                            message: errorResult.message || 'Có lỗi xảy ra',
                            error: errorResult.error,
                            status: response.status
                        };
                    }
                } catch (e) {
                    return {
                        success: false,
                        message: 'Có lỗi xảy ra',
                        error: `HTTP ${response.status}`,
                        status: response.status
                    };
                }
            }
            
            const result = await response.json();
            
            // Xử lý response theo format API
            if (result.success === true && result.data) {
                return {
                    success: true,
                    data: result.data
                };
            } else if (result.success === false) {
                return {
                    success: false,
                    message: result.message || 'Có lỗi xảy ra',
                    error: result.error
                };
            } else {
                return {
                    success: false,
                    message: 'Dữ liệu không hợp lệ',
                    error: 'Response format không đúng'
                };
            }
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: 'Không thể kết nối đến server',
                error: error.message
            };
        }
    }
};

// Dữ liệu mẫu nếu không có API
const mockProductData = {
    "name": "Bánh Socola",
    "category": "Bánh ngọt",
    "price": 50000,
    "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
    "description": "Bánh socola thơm ngon"
};

// Hàm load sản phẩm với fallback
async function loadProduct(productId = null) {
    // Thử gọi API trước
    const apiResult = await ProductAPI.getProduct(productId);
    
    if (apiResult.success) {
        return apiResult;
    }
    
    // Nếu API lỗi, sử dụng dữ liệu mẫu
    console.warn('API không khả dụng, sử dụng dữ liệu mẫu:', apiResult.message);
    return {
        success: true,
        data: mockProductData
    };
}

// Hàm cập nhật UI với dữ liệu sản phẩm
function updateProductCard(productData) {
    const productCard = document.getElementById('productCard');
    if (!productCard || !productData) return;
    
    const productName = productCard.querySelector('.product-name');
    const productCategory = productCard.querySelector('.product-category');
    const productDescription = productCard.querySelector('.product-description');
    const productPrice = productCard.querySelector('.product-price');
    const productImage = productCard.querySelector('.product-image img');
    
    if (productName) productName.textContent = productData.name || 'Sản phẩm';
    if (productCategory) productCategory.textContent = productData.category || 'Danh mục';
    if (productDescription) productDescription.textContent = productData.description || '';
    if (productPrice) {
        const formattedPrice = new Intl.NumberFormat('vi-VN').format(productData.price || 0);
        productPrice.textContent = formattedPrice + '₫';
    }
    if (productImage) {
        if (productData.image && productData.image.trim() !== '') {
            productImage.src = productData.image;
            productImage.alt = productData.name || 'Sản phẩm';
        }
    }
}

// Load sản phẩm khi trang được tải
document.addEventListener('DOMContentLoaded', async function() {
    const productCard = document.getElementById('productCard');
    if (productCard) {
        const result = await loadProduct();
        if (result.success && result.data) {
            updateProductCard(result.data);
            // Lưu vào localStorage để dùng lại
            localStorage.setItem('productData', JSON.stringify(result.data));
        }
    }
});

