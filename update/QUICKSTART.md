# 🚀 Quick Start Guide - VR360 Demo

## Bắt Đầu Ngay (5 phút)

### 1️⃣ Mở File HTML
```bash
# Cách 1: Double-click vào file index.html
# Cách 2: Kéo thả index.html vào trình duyệt
# Cách 3: Chạy local server (khuyến nghị)
```

### 2️⃣ Chạy Local Server
```bash
# Option A: Python
cd vr360-demo
python -m http.server 8000

# Option B: Node.js
npx http-server -p 8000

# Option C: VS Code Live Server Extension
# Click "Go Live" ở góc dưới bên phải
```

### 3️⃣ Truy Cập
```
http://localhost:8000
```

---

## 📋 Checklist Tùy Chỉnh Nhanh

### ✅ Thay Đổi Màu Sắc
📁 **File**: `css/style.css` (dòng 9-17)
```css
:root {
    --primary-color: #2196F3;      /* 👈 Đổi màu này */
    --secondary-color: #1976D2;
    --accent-color: #FFC107;
}
```

### ✅ Thêm Khách Sạn Mới
📁 **File**: `data/hotels.json`
```json
{
  "hotels": [
    {
      "id": "hotel-new",
      "name": {
        "vi": "Tên Khách Sạn",
        "en": "Hotel Name"
      },
      "description": {
        "vi": "Mô tả tiếng Việt",
        "en": "English description"
      },
      "image": "https://example.com/image.jpg",
      "rating": 4.5,
      "price": 2000000
    }
  ]
}
```

### ✅ Thay Logo
1. Đặt logo vào `assets/icons/logo.png`
2. Hoặc sửa CSS:
```css
.logo {
    background: url('path/to/logo.png');
    background-size: contain;
}
```

### ✅ Tùy Chỉnh Menu
📁 **File**: `index.html` (dòng 28-60)
- Thêm/xóa button trong `.sidebar-nav`
- Thêm `data-category="category-name"`

---

## 🎯 Các Tính Năng Chính

| Tính Năng | Mô Tả | File Liên Quan |
|-----------|-------|----------------|
| **Sidebar Menu** | Menu icon bên trái | `index.html` (line 20-80) |
| **Content Panel** | Panel slide-in | `css/style.css` (.content-panel) |
| **Search** | Tìm kiếm real-time | `js/main.js` (handleSearch) |
| **Language** | Đổi ngôn ngữ | `js/main.js` (changeLanguage) |
| **Responsive** | Mobile-friendly | `css/style.css` (@media) |

---

## 🔧 Tích Hợp với Backend

### Bước 1: Thay đổi loadData()
📁 **File**: `js/main.js`
```javascript
async function loadData() {
    // Thay thế dòng này:
    // const response = await fetch('data/hotels.json');
    
    // Bằng API endpoint của bạn:
    const response = await fetch('https://your-api.com/locations');
    
    if (!response.ok) throw new Error('Failed to load data');
    state.data = await response.json();
}
```

### Bước 2: Xử lý Click Card
📁 **File**: `js/main.js`
```javascript
function handleCardClick(id) {
    const item = state.filteredData.find(item => item.id === id);
    
    // Option 1: Redirect to VR page
    window.location.href = `/vr360/${id}`;
    
    // Option 2: Load VR in iframe
    loadVRView(item);
    
    // Option 3: Open modal
    showDetailModal(item);
}
```

---

## 📱 Test Responsive

### Desktop
- Mở Chrome DevTools (F12)
- Toggle Device Toolbar (Ctrl+Shift+M)

### Mobile Devices
```
iPhone 12 Pro: 390 x 844
iPhone SE: 375 x 667
Galaxy S21: 360 x 800
iPad Air: 820 x 1180
```

---

## 🐛 Troubleshooting

### ❌ Panel không hiện
**Nguyên nhân**: Lỗi load JSON  
**Giải pháp**: Mở Console (F12), check errors

### ❌ Images không load
**Nguyên nhân**: CORS policy  
**Giải pháp**: Chạy local server, không mở trực tiếp file

### ❌ CSS không áp dụng
**Nguyên nhân**: Cache  
**Giải pháp**: Hard refresh (Ctrl+Shift+R)

---

## 📞 Support

### Documentation
- `README.md` - Hướng dẫn chi tiết
- `js/config.js` - Cấu hình
- `js/api-service.js` - API examples

### Code Comments
Mỗi function đều có comment giải thích rõ ràng

### Console Logs
Check browser console để debug

---

## 🎨 Customization Checklist

- [ ] Đổi màu sắc chính
- [ ] Thêm logo riêng
- [ ] Cập nhật dữ liệu JSON
- [ ] Tùy chỉnh menu categories
- [ ] Test responsive trên mobile
- [ ] Tích hợp API backend
- [ ] Thêm Google Analytics
- [ ] Deploy lên server

---

## 📦 Files Quan Trọng

```
vr360-demo/
├── index.html          ⭐ Cấu trúc HTML
├── css/style.css       ⭐ Toàn bộ styling
├── js/main.js          ⭐ Logic chính
├── js/config.js        ⭐ Cấu hình
├── js/api-service.js   📖 API examples
├── data/hotels.json    ⭐ Dữ liệu
└── README.md           📖 Docs chi tiết
```

**Legend:**  
⭐ = Quan trọng, sửa thường xuyên  
📖 = Tài liệu tham khảo

---

**Ready to start?** 🚀  
Mở `index.html` hoặc chạy local server!