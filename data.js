// Dữ liệu sản phẩm bánh
const cakeProduct = {
  "name": "Bánh Socola",
  "category": "Bánh ngọt",
  "price": 50000,
  "image": "https://example.com/cake.jpg",
  "description": "Bánh socola thơm ngon"
};

// Export để sử dụng trong các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cakeProduct };
}

