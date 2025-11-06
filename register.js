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
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const eyeIcon = this.querySelector('.eye-icon');
        if (type === 'password') {
            eyeIcon.textContent = '👁️';
        } else {
            eyeIcon.textContent = '🙈';
        }
    });
}

if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener('click', function() {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        
        const eyeIcon = this.querySelector('.eye-icon');
        if (type === 'password') {
            eyeIcon.textContent = '👁️';
        } else {
            eyeIcon.textContent = '🙈';
        }
    });
}

// Form submission
const registerForm = document.getElementById('registerForm');
const registerButton = document.querySelector('.login-button');

if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Validation
        if (!agreeTerms) {
            alert('Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật!');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            confirmPasswordInput.style.borderColor = '#f44336';
            return;
        }
        
        if (password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự!');
            passwordInput.style.borderColor = '#f44336';
            return;
        }
        
        if (username.length < 3) {
            alert('Tên đăng nhập phải có ít nhất 3 ký tự!');
            return;
        }
        
        // Disable button and show loading
        registerButton.disabled = true;
        registerButton.classList.add('loading');
        
        // Simulate API call (replace with actual API call)
        setTimeout(() => {
            // Here you would make an actual API call
            // Example:
            // fetch('/api/register', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ fullName, email, username, password })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.success) {
            //         alert('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
            //         window.location.href = '/index.html';
            //     } else {
            //         alert('Đăng ký thất bại: ' + data.message);
            //     }
            // })
            // .catch(error => {
            //     alert('Có lỗi xảy ra: ' + error.message);
            // })
            // .finally(() => {
            //     registerButton.disabled = false;
            //     registerButton.classList.remove('loading');
            // });
            
            // For demo purposes
            console.log('Register attempt:', { fullName, email, username, agreeTerms });
            alert('Đăng ký thành công! (Demo)\n\nHọ tên: ' + fullName + '\nEmail: ' + email + '\nTên đăng nhập: ' + username);
            
            // Re-enable button
            registerButton.disabled = false;
            registerButton.classList.remove('loading');
            
            // In real app, you would redirect to login page:
            // setTimeout(() => {
            //     window.location.href = 'index.html';
            // }, 2000);
        }, 1500);
    });
}

// Real-time password confirmation validation
if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener('input', function() {
        if (this.value !== passwordInput.value) {
            this.style.borderColor = '#f44336';
        } else {
            this.style.borderColor = '#4caf50';
        }
    });
    
    passwordInput.addEventListener('input', function() {
        if (confirmPasswordInput.value && confirmPasswordInput.value !== this.value) {
            confirmPasswordInput.style.borderColor = '#f44336';
        } else if (confirmPasswordInput.value) {
            confirmPasswordInput.style.borderColor = '#4caf50';
        }
    });
}

// Add enter key support
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT' && activeElement.type !== 'checkbox') {
            if (registerForm) {
                registerForm.dispatchEvent(new Event('submit'));
            }
        }
    }
});

// Add input validation feedback
const inputs = document.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
inputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = '#e0e0e0';
        } else if (this.checkValidity()) {
            // Special check for confirm password
            if (this.id === 'confirmPassword' && this.value !== passwordInput.value) {
                this.style.borderColor = '#f44336';
            } else {
                this.style.borderColor = '#4caf50';
            }
        } else {
            this.style.borderColor = '#f44336';
        }
    });
    
    input.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            if (this.id === 'confirmPassword' && this.value !== passwordInput.value) {
                this.style.borderColor = '#f44336';
            } else if (this.id === 'confirmPassword' && this.value === passwordInput.value) {
                this.style.borderColor = '#4caf50';
            } else {
                this.style.borderColor = '#8B5CF6';
            }
        }
    });
});

