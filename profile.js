// Hàm format ngày tháng
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('vi-VN', options);
    } catch (e) {
        return dateString;
    }
}

// Hàm hiển thị avatar
function displayAvatar(avatarUrl, fullName) {
    const avatarContainer = document.getElementById('avatarContainer');
    
    if (avatarUrl && avatarUrl.trim() !== '') {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = fullName || 'Avatar';
        img.className = 'avatar-image';
        img.onerror = function() {
            // Nếu ảnh lỗi, hiển thị placeholder
            displayAvatarPlaceholder(fullName);
        };
        avatarContainer.innerHTML = '';
        avatarContainer.appendChild(img);
    } else {
        displayAvatarPlaceholder(fullName);
    }
}

// Hàm hiển thị placeholder avatar
function displayAvatarPlaceholder(fullName) {
    const avatarContainer = document.getElementById('avatarContainer');
    const placeholder = document.createElement('div');
    placeholder.className = 'avatar-placeholder';
    
    // Lấy chữ cái đầu của tên
    if (fullName && fullName.trim() !== '') {
        const initials = fullName.trim().split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        placeholder.textContent = initials;
    } else {
        placeholder.textContent = '👤';
    }
    
    avatarContainer.innerHTML = '';
    avatarContainer.appendChild(placeholder);
}

// Hàm hiển thị thông tin profile
function displayProfile(data) {
    // Hiển thị avatar
    displayAvatar(data.avatar, data.full_name);
    
    // Hiển thị thông tin
    document.getElementById('fullName').textContent = data.full_name || 'Chưa cập nhật';
    document.getElementById('username').textContent = '@' + (data.username || '');
    document.getElementById('userId').textContent = data.id || 'N/A';
    document.getElementById('userUsername').textContent = data.username || 'N/A';
    document.getElementById('userEmail').textContent = data.email || 'N/A';
    document.getElementById('userFullName').textContent = data.full_name || 'Chưa cập nhật';
    document.getElementById('userCreatedAt').textContent = formatDate(data.created_at);
    
    // Hiển thị content, ẩn loading
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('profileContent').style.display = 'block';
}

// Hàm hiển thị lỗi
function displayError(message, error) {
    const errorMessage = document.getElementById('errorMessage');
    let errorText = message || 'Có lỗi xảy ra khi tải thông tin';
    
    if (error) {
        errorText += ': ' + error;
    }
    
    errorMessage.textContent = errorText;
    
    // Hiển thị error, ẩn loading và content
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('profileContent').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
}

// Hàm load profile từ API
async function loadProfile() {
    // Hiển thị loading
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('profileContent').style.display = 'none';
    
    try {
        // Lấy token từ localStorage
        const token = localStorage.getItem('authToken');
        
        // Kiểm tra xem có data trong localStorage không (từ lần đăng nhập trước)
        const savedProfile = localStorage.getItem('userProfile');
        
        if (savedProfile) {
            try {
                const profileData = JSON.parse(savedProfile);
                if (profileData.success && profileData.data) {
                    displayProfile(profileData.data);
                    // Vẫn gọi API để cập nhật dữ liệu mới nhất
                }
            } catch (e) {
                console.error('Error parsing saved profile:', e);
            }
        }
        
        // Gọi API để lấy thông tin profile
        // Sử dụng ProfileAPI nếu có, nếu không thì gọi trực tiếp
        let result;
        
        if (typeof ProfileAPI !== 'undefined') {
            // Sử dụng ProfileAPI service
            result = await ProfileAPI.getProfile();
        } else {
            // Fallback: gọi API trực tiếp
            const apiUrl = '/api/profile';
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                try {
                    const errorResult = await response.json();
                    if (errorResult.success === false) {
                        displayError(errorResult.message || 'Có lỗi xảy ra', errorResult.error);
                        return;
                    }
                } catch (e) {
                    displayError('Có lỗi xảy ra', `HTTP ${response.status}`);
                    return;
                }
            }
            
            result = await response.json();
        }
        
        // Xử lý response theo format API
        if (result.success === true && result.data) {
            // Lưu vào localStorage với format đúng
            localStorage.setItem('userProfile', JSON.stringify({
                success: true,
                data: result.data
            }));
            displayProfile(result.data);
        } else if (result.success === false) {
            // Xử lý lỗi từ API
            displayError(result.message || 'Có lỗi xảy ra', result.error);
        } else {
            // Response không đúng format
            displayError('Dữ liệu không hợp lệ', 'Response format không đúng');
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
        
        // Kiểm tra xem có dữ liệu đã lưu không
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                const profileData = JSON.parse(savedProfile);
                if (profileData.success && profileData.data) {
                    // Hiển thị dữ liệu đã lưu và thông báo
                    displayProfile(profileData.data);
                    const errorMsg = document.createElement('div');
                    errorMsg.style.cssText = 'background: #fff3cd; color: #856404; padding: 10px; border-radius: 10px; margin-top: 20px; text-align: center;';
                    errorMsg.textContent = '⚠️ Đang hiển thị dữ liệu đã lưu. Không thể kết nối đến server.';
                    document.getElementById('profileContent').appendChild(errorMsg);
                    return;
                }
            } catch (e) {
                console.error('Error parsing saved profile:', e);
            }
        }
        
        // Hiển thị lỗi nếu không có dữ liệu đã lưu
        displayError('Không thể kết nối đến server', error.message);
    }
}

// Load profile khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
});

// Export function để có thể gọi từ HTML
window.loadProfile = loadProfile;

