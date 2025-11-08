# 📸 Hướng Dẫn Thêm Ảnh 360 Của Bạn

## 🎯 Tổng Quan

Demo hiện tại sử dụng ảnh 360 mẫu từ Pannellum. Để thêm ảnh 360 thực tế của **khách sạn và địa điểm** ở Phan Thiết, làm theo hướng dẫn dưới đây.

---

## 📷 Cách Chụp/Thu Thập Ảnh 360

### Option 1: Sử dụng Ảnh Có Sẵn
Nếu bạn đã có ảnh 360 từ trang https://dulichphanthiet.vt360.vn/:

1. **Tìm URL của ảnh 360:**
   - Vào trang VR360 của địa điểm
   - Mở Developer Tools (F12)
   - Tìm file ảnh `.jpg` trong tab Network
   - Copy URL của ảnh panorama

2. **Định dạng URL:**
   ```
   https://dulichphanthiet.vt360.vn/panoramas/rock-water-bay.jpg
   hoặc
   https://cdn.vt360.vn/images/phan-thiet/hotel-001.jpg
   ```

### Option 2: Chụp Ảnh 360 Mới

**Thiết bị cần:**
- Camera 360 (Ricoh Theta, Insta360, GoPro Max)
- Hoặc smartphone với app chụp 360 (Google Street View app)

**Quy trình:**
1. Chụp ảnh 360 tại địa điểm
2. Export ra file `.jpg` (equirectangular format)
3. Upload lên server/CDN của bạn
4. Lấy URL của ảnh

---

## 🔧 Cách Thêm Vào Demo

### Bước 1: Upload Ảnh 360

**Option A: Upload lên server của bạn**
```bash
# Upload vào thư mục assets/panoramas/
vr360-demo/
  └── assets/
      └── panoramas/
          ├── rock-water-bay.jpg
          ├── nova-world.jpg
          └── mui-ne-beach.jpg
```

**Option B: Sử dụng CDN**
- Upload lên Cloudinary, AWS S3, hoặc CDN khác
- Lấy public URL

### Bước 2: Cập Nhật File JSON

Mở `data/hotels.json` và cập nhật URL:

```json
{
  "id": "hotel-001",
  "name": {
    "vi": "Rock Water Bay",
    "en": "Rock Water Bay"
  },
  "description": { ... },
  "image": "https://...",
  
  // 👇 THÊM/SỬA PHẦN NÀY
  "panoramaUrl": "https://dulichphanthiet.vt360.vn/panoramas/rock-water-bay.jpg",
  // hoặc
  "panoramaUrl": "assets/panoramas/rock-water-bay.jpg",
  
  // Optional: Điều chỉnh góc nhìn ban đầu
  "pitch": 0,    // Góc lên xuống (-90 đến 90)
  "yaw": 0,      // Góc trái phải (0 đến 360)
  "hfov": 100    // Field of view (50 đến 120)
}
```

### Bước 3: Test

```bash
# Chạy local server
python -m http.server 8000

# Mở trình duyệt
http://localhost:8000

# Click vào card để xem ảnh 360
```

---

## 🎨 Tùy Chỉnh Góc Nhìn

### Các tham số điều chỉnh:

```json
{
  "panoramaUrl": "your-image.jpg",
  
  // Góc nhìn dọc (pitch)
  "pitch": 0,     // 0 = nhìn thẳng
                  // -30 = nhìn xuống
                  // 30 = nhìn lên
  
  // Góc nhìn ngang (yaw)
  "yaw": 0,       // 0 = hướng Bắc
                  // 90 = hướng Đông
                  // 180 = hướng Nam
                  // 270 = hướng Tây
  
  // Độ zoom (hfov - horizontal field of view)
  "hfov": 100     // 50 = zoom in nhiều
                  // 100 = normal
                  // 120 = zoom out (wide angle)
}
```

### Ví dụ cụ thể:

**Nhìn ra biển (hướng Đông):**
```json
{
  "panoramaUrl": "beach-view.jpg",
  "pitch": 0,
  "yaw": 90,
  "hfov": 110
}
```

**Nhìn xuống hồ bơi:**
```json
{
  "panoramaUrl": "pool-view.jpg",
  "pitch": -20,
  "yaw": 180,
  "hfov": 100
}
```

---

## 📋 Template Hoàn Chỉnh

Copy template này cho mỗi địa điểm mới:

```json
{
  "id": "hotel-xxx",
  "name": {
    "vi": "Tên Khách Sạn",
    "en": "Hotel Name"
  },
  "description": {
    "vi": "Mô tả tiếng Việt...",
    "en": "English description..."
  },
  "image": "https://thumbnail-image.jpg",
  "rating": 4.5,
  "price": 2000000,
  "coordinates": {
    "lat": 10.9333,
    "lng": 108.1000
  },
  
  // ⭐ PHẦN VR360
  "panoramaUrl": "https://your-domain.com/panoramas/hotel-xxx.jpg",
  "pitch": 0,
  "yaw": 0,
  "hfov": 100,
  
  // Optional: Thêm nhiều điểm xem (hotspots)
  "hotspots": [
    {
      "id": "lobby",
      "name": "Sảnh Khách Sạn",
      "pitch": 0,
      "yaw": 90,
      "panoramaUrl": "https://your-domain.com/panoramas/hotel-xxx-lobby.jpg"
    },
    {
      "id": "pool",
      "name": "Hồ Bơi",
      "pitch": -10,
      "yaw": 180,
      "panoramaUrl": "https://your-domain.com/panoramas/hotel-xxx-pool.jpg"
    }
  ]
}
```

---

## 🖼️ Yêu Cầu Kỹ Thuật Ảnh 360

### Định dạng ảnh:
- **Format:** JPEG hoặc PNG
- **Projection:** Equirectangular (2:1 ratio)
- **Resolution:** 
  - Minimum: 4096 x 2048 px
  - Recommended: 8192 x 4096 px
  - Maximum: 16384 x 8192 px

### Kích thước file:
- Nên optimize dưới 5MB per image
- Sử dụng compression ~80-85% quality

### Tools để optimize:
```bash
# ImageMagick
convert input.jpg -quality 85 -resize 8192x4096 output.jpg

# Online tools:
# - tinypng.com
# - squoosh.app
```

---

## 🔗 Lấy URL Từ Website Hiện Tại

Nếu ảnh 360 đã có trên https://dulichphanthiet.vt360.vn/:

### Cách 1: Developer Tools
```
1. Mở trang VR360
2. F12 (Developer Tools)
3. Tab "Network"
4. Reload page
5. Filter: "img" hoặc "panorama"
6. Tìm file .jpg lớn (thường >2MB)
7. Copy URL
```

### Cách 2: View Page Source
```
1. Right-click > View Page Source
2. Ctrl+F search "panorama" hoặc ".jpg"
3. Tìm URL trong code
4. Copy full URL
```

### Cách 3: Inspector
```
1. Right-click trên VR view
2. Inspect Element
3. Tìm <img> hoặc <canvas> tag
4. Check src attribute
```

---

## 🚀 Quick Update Script

Nếu bạn có nhiều ảnh 360 cần thêm, tạo script này:

**update-panoramas.js**
```javascript
const fs = require('fs');

// Danh sách URL ảnh 360 của bạn
const panoramas = {
  'hotel-001': 'https://dulichphanthiet.vt360.vn/panoramas/rock-water-bay.jpg',
  'hotel-002': 'https://dulichphanthiet.vt360.vn/panoramas/nova-world.jpg',
  'hotel-003': 'https://dulichphanthiet.vt360.vn/panoramas/movenpick.jpg',
  // ... thêm các khách sạn khác
};

// Đọc file JSON
const data = JSON.parse(fs.readFileSync('data/hotels.json', 'utf8'));

// Update panorama URLs
data.hotels.forEach(hotel => {
  if (panoramas[hotel.id]) {
    hotel.panoramaUrl = panoramas[hotel.id];
    hotel.pitch = 0;
    hotel.yaw = 0;
    hotel.hfov = 100;
  }
});

// Save updated JSON
fs.writeFileSync('data/hotels.json', JSON.stringify(data, null, 2));
console.log('✅ Updated panorama URLs!');
```

**Chạy script:**
```bash
node update-panoramas.js
```

---

## 🎯 Ví Dụ Thực Tế

### Rock Water Bay - Thực tế
```json
{
  "id": "hotel-001",
  "name": {
    "vi": "Rock Water Bay",
    "en": "Rock Water Bay"
  },
  "panoramaUrl": "https://dulichphanthiet.vt360.vn/tours/rock-water-bay/lobby.jpg",
  "pitch": 0,
  "yaw": 90,
  "hfov": 100,
  "hotspots": [
    {
      "id": "reception",
      "name": "Quầy Lễ Tân",
      "pitch": 0,
      "yaw": 0,
      "panoramaUrl": "https://dulichphanthiet.vt360.vn/tours/rock-water-bay/reception.jpg"
    },
    {
      "id": "restaurant",
      "name": "Nhà Hàng",
      "pitch": 5,
      "yaw": 180,
      "panoramaUrl": "https://dulichphanthiet.vt360.vn/tours/rock-water-bay/restaurant.jpg"
    }
  ]
}
```

---

## ✅ Checklist

Trước khi deploy:

- [ ] Tất cả ảnh 360 đã upload
- [ ] URLs trong JSON đã cập nhật
- [ ] Test từng địa điểm hoạt động
- [ ] Góc nhìn (pitch/yaw) đã điều chỉnh tốt
- [ ] Ảnh đã optimize (< 5MB)
- [ ] Hotspots đã test (nếu có)

---

## 🆘 Troubleshooting

**❌ Ảnh 360 không load**
- Check URL trong console (F12)
- Verify CORS headers nếu dùng external CDN
- Ensure file tồn tại và public accessible

**❌ Ảnh bị vỡ/méo**
- Verify ảnh là equirectangular format (2:1 ratio)
- Check resolution ảnh

**❌ Load chậm**
- Optimize/compress ảnh
- Sử dụng CDN
- Lazy load images

---

## 📚 Resources

**Pannellum Documentation:**
- https://pannellum.org/documentation/overview/

**Free 360 Images (để test):**
- https://www.flickr.com/groups/equirectangular/
- https://polyhaven.com/hdris

**Tools:**
- Chụp 360: Ricoh Theta, Insta360
- Edit 360: PTGui, Hugin
- Optimize: ImageMagick, Squoosh

---

**Ready to add your 360 images! 📸**

*Nếu cần hỗ trợ, check console logs hoặc file VR-INTEGRATION.md*