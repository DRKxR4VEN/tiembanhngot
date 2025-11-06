// Load product data from API or localStorage
async function loadProductData() {
    const productCard = document.getElementById('productCard');
    if (!productCard) return;
    
    // Kiểm tra localStorage trước
    const savedProduct = localStorage.getItem('productData');
    if (savedProduct) {
        try {
            const productData = JSON.parse(savedProduct);
            updateProductCardUI(productData);
        } catch (e) {
            console.error('Error parsing saved product:', e);
        }
    }
    
    // Load từ API (sẽ được gọi trong api.js)
    // Nếu có api.js được load, nó sẽ tự động cập nhật
}

// Hàm cập nhật UI với dữ liệu sản phẩm
function updateProductCardUI(productData) {
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

// Fallback: Nếu không có API, dùng dữ liệu mẫu
if (typeof cakeProduct !== 'undefined') {
    const productCard = document.getElementById('productCard');
    if (productCard) {
        // Chỉ update nếu chưa có dữ liệu từ API
        const savedProduct = localStorage.getItem('productData');
        if (!savedProduct) {
            updateProductCardUI(cakeProduct);
        }
    }
}

// Load khi DOM ready
document.addEventListener('DOMContentLoaded', loadProductData);

// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Change eye icon (simple toggle)
    const eyeIcon = this.querySelector('.eye-icon');
    if (type === 'password') {
        eyeIcon.textContent = '👁️';
    } else {
        eyeIcon.textContent = '🙈';
    }
});

// Form submission
const loginForm = document.getElementById('loginForm');
const loginButton = document.querySelector('.login-button');

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate form
    if (!username || !password) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }
    
    // Disable button and show loading
    loginButton.disabled = true;
    loginButton.classList.add('loading');
    
    try {
        // Gọi API đăng nhập
        // Thay đổi URL này thành endpoint API thực tế của bạn
        const apiUrl = '/api/login'; // Hoặc URL API của bạn
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
            // Lưu thông tin vào localStorage
            localStorage.setItem('userProfile', JSON.stringify(result));
            localStorage.setItem('authToken', result.token || ''); // Nếu API trả về token
            
            // Lưu username nếu chọn "Ghi nhớ"
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }
            
            // Redirect đến trang chủ
            window.location.href = 'home.html';
            
        } else {
            // Hiển thị lỗi
            const errorMessage = result.message || 'Đăng nhập thất bại';
            const errorDetail = result.error || '';
            alert(errorMessage + (errorDetail ? ': ' + errorDetail : ''));
            
            // Re-enable button
            loginButton.disabled = false;
            loginButton.classList.remove('loading');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Nếu không có API hoặc lỗi kết nối, sử dụng dữ liệu mẫu
        // Bạn có thể xóa phần này nếu đã có API thực tế
        const mockResponse = {
            success: true,
            data: {
                id: 1,
                username: username,
                email: username + '@example.com',
                full_name: 'Người Dùng',
                avatar: '',
                created_at: new Date().toISOString()
            }
        };
        
        // Lưu dữ liệu mẫu
        localStorage.setItem('userProfile', JSON.stringify(mockResponse));
        
        if (rememberMe) {
            localStorage.setItem('rememberedUsername', username);
        } else {
            localStorage.removeItem('rememberedUsername');
        }
        
        // Redirect đến trang chủ
        window.location.href = 'home.html';
        
        // Hoặc hiển thị lỗi nếu bạn muốn:
        // alert('Không thể kết nối đến server: ' + error.message);
        // loginButton.disabled = false;
        // loginButton.classList.remove('loading');
    }
});

// Add enter key support
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT' && activeElement.type !== 'checkbox') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Add input validation feedback
const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
inputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = '#e0e0e0';
        } else if (this.checkValidity()) {
            this.style.borderColor = '#4caf50';
        } else {
            this.style.borderColor = '#f44336';
        }
    });
    
    input.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            this.style.borderColor = '#8B5CF6';
        }
    });
});

