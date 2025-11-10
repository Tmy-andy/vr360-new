# 🥽 VR Integration Guide

Hướng dẫn tích hợp giao diện này với VR360 view hiện tại của bạn.

---

## 📋 Tổng Quan

Demo này là **UI overlay** sẽ hiển thị trên VR360 background. Khi user click vào location card, app sẽ:
1. Load VR panorama tương ứng
2. Update URL với coordinates
3. Đóng panel để hiển thị full VR view

---

## 🔗 Integration Steps

### Step 1: Chuẩn Bị VR Background

Trong file `index.html`, phần VR background đã được chuẩn bị sẵn:

```html
<div class="vr-background">
    <img src="https://dulichphanthiet.vt360.vn/assets/images/sample-bg.jpg" 
         alt="VR Background" 
         id="vrBackground">
</div>
```

**Thay thế bằng VR viewer của bạn:**

```html
<div class="vr-background">
    <!-- Option 1: Pannellum -->
    <div id="panorama"></div>
    
    <!-- Option 2: A-Frame -->
    <a-scene id="vr-scene">
        <a-sky id="sky" src="panorama.jpg"></a-sky>
    </a-scene>
    
    <!-- Option 3: Three.js Canvas -->
    <canvas id="vr-canvas"></canvas>
    
    <!-- Option 4: Your existing VR implementation -->
    <iframe id="vr-iframe" src="https://dulichphanthiet.vt360.vn/..."></iframe>
</div>
```

---

### Step 2: Update Card Click Handler

Trong `js/main.js`, sửa function `handleCardClick()`:

```javascript
// ===== Current Implementation =====
function handleCardClick(id) {
    const item = state.filteredData.find(item => item.id === id);
    if (item) {
        console.log('Card clicked:', item);
        alert(`Navigating to: ${item.name.vi}`);
    }
}

// ===== VR Integration Implementation =====
function handleCardClick(id) {
    const item = state.filteredData.find(item => item.id === id);
    if (!item) return;
    
    // Close the panel
    closePanel();
    
    // Load VR panorama
    loadVRPanorama(item);
    
    // Update URL (optional)
    updateURL(item);
    
    // Track analytics
    trackVRView(item);
}

// ===== VR Loading Function =====
function loadVRPanorama(item) {
    // Option 1: Update iframe src
    const vrIframe = document.getElementById('vr-iframe');
    if (vrIframe) {
        vrIframe.src = item.vrUrl || 
                      `https://dulichphanthiet.vt360.vn/tour/${item.id}`;
    }
    
    // Option 2: Pannellum integration
    if (typeof pannellum !== 'undefined') {
        pannellum.viewer('panorama', {
            type: 'equirectangular',
            panorama: item.panoramaUrl,
            autoLoad: true,
            showControls: true,
            hfov: 110
        });
    }
    
    // Option 3: A-Frame integration
    const sky = document.getElementById('sky');
    if (sky) {
        sky.setAttribute('src', item.panoramaUrl);
    }
    
    // Option 4: Three.js integration
    if (window.vrViewer) {
        window.vrViewer.loadPanorama(item.panoramaUrl);
    }
    
    // Option 5: Your custom implementation
    if (window.loadVRTour) {
        window.loadVRTour({
            id: item.id,
            lat: item.coordinates.lat,
            lng: item.coordinates.lng,
            panoramaUrl: item.panoramaUrl
        });
    }
}
```

---

### Step 3: Update Data Structure

Trong `data/hotels.json`, thêm VR URLs:

```json
{
  "hotels": [
    {
      "id": "hotel-001",
      "name": { "vi": "Rock Water Bay", "en": "Rock Water Bay" },
      "description": { "vi": "...", "en": "..." },
      "image": "https://...",
      "rating": 4.8,
      "price": 2500000,
      "coordinates": { "lat": 10.9333, "lng": 108.1000 },
      
      // 👇 Thêm các fields này
      "vrUrl": "https://dulichphanthiet.vt360.vn/tour/hotel-001",
      "panoramaUrl": "https://cdn.vt360.vn/panoramas/hotel-001.jpg",
      "hotspots": [
        {
          "id": "lobby",
          "name": "Lobby",
          "position": { "yaw": 0, "pitch": 0 },
          "panoramaUrl": "https://cdn.vt360.vn/panoramas/hotel-001-lobby.jpg"
        },
        {
          "id": "room",
          "name": "Deluxe Room",
          "position": { "yaw": 90, "pitch": 0 },
          "panoramaUrl": "https://cdn.vt360.vn/panoramas/hotel-001-room.jpg"
        }
      ]
    }
  ]
}
```

---

## 🎨 VR Viewer Libraries

### Option 1: Pannellum (Khuyến nghị)

**Installation:**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
<script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
```

**Implementation:**
```javascript
pannellum.viewer('panorama', {
    type: 'equirectangular',
    panorama: item.panoramaUrl,
    autoLoad: true,
    showControls: true,
    showFullscreenCtrl: true,
    showZoomCtrl: true,
    mouseZoom: true,
    autoRotate: -2,
    compass: true,
    hotSpots: item.hotspots?.map(spot => ({
        pitch: spot.position.pitch,
        yaw: spot.position.yaw,
        type: 'scene',
        text: spot.name,
        sceneId: spot.id
    }))
});
```

---

### Option 2: A-Frame

**Installation:**
```html
<script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
```

**Implementation:**
```html
<a-scene>
    <a-sky id="sky" src="#panorama-texture"></a-sky>
    <a-assets>
        <img id="panorama-texture" src="panorama.jpg">
    </a-assets>
    
    <!-- Hotspots -->
    <a-entity 
        class="hotspot"
        position="2 1.5 -4"
        geometry="primitive: sphere; radius: 0.2"
        material="color: #FF4444"
        onclick="navigateToRoom()">
    </a-entity>
</a-scene>
```

---

### Option 3: Three.js Custom

**Implementation:**
```javascript
import * as THREE from 'three';

class VRViewer {
    constructor(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 
            window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);
        
        this.loadPanorama('initial.jpg');
        this.animate();
    }
    
    loadPanorama(url) {
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);
        
        const texture = new THREE.TextureLoader().load(url);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

// Usage
const viewer = new VRViewer(document.getElementById('vr-canvas'));
window.vrViewer = viewer;
```

---

## 🎯 Advanced Features

### 1. Hotspot Navigation

```javascript
// Add hotspots to VR view
function addHotspots(item) {
    if (!item.hotspots) return;
    
    item.hotspots.forEach(spot => {
        const hotspot = {
            pitch: spot.position.pitch,
            yaw: spot.position.yaw,
            type: 'info',
            text: spot.name,
            clickHandlerFunc: () => {
                loadVRPanorama({
                    ...item,
                    panoramaUrl: spot.panoramaUrl
                });
            }
        };
        
        // Add to viewer (implementation depends on library)
        viewer.addHotspot(hotspot);
    });
}
```

### 2. Gyroscope Support (Mobile)

```javascript
// Enable device orientation
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
        const alpha = e.alpha; // Z-axis rotation
        const beta = e.beta;   // X-axis rotation
        const gamma = e.gamma; // Y-axis rotation
        
        // Update camera rotation
        updateCameraRotation(alpha, beta, gamma);
    });
}
```

### 3. VR Mode (WebXR)

```javascript
// Add VR button
const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);

// Enable VR
renderer.xr.enabled = true;
renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
});
```

---

## 🔧 URL Management

### Update URL with Location Info

```javascript
function updateURL(item) {
    const url = new URL(window.location);
    url.searchParams.set('location', item.id);
    url.searchParams.set('lat', item.coordinates.lat);
    url.searchParams.set('lng', item.coordinates.lng);
    
    // Update URL without reload
    window.history.pushState({}, '', url);
}

// Handle browser back button
window.addEventListener('popstate', (e) => {
    const params = new URLSearchParams(window.location.search);
    const locationId = params.get('location');
    
    if (locationId) {
        // Load that location
        const item = findLocationById(locationId);
        if (item) loadVRPanorama(item);
    } else {
        // Show default view
        loadDefaultView();
    }
});
```

---

## 📱 Mobile Optimization

### Touch Controls

```javascript
let touchStartX = 0;
let touchStartY = 0;

container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

container.addEventListener('touchmove', (e) => {
    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;
    
    // Rotate camera based on touch movement
    camera.rotation.y += deltaX * 0.01;
    camera.rotation.x += deltaY * 0.01;
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});
```

### Fullscreen API

```javascript
function enterFullscreen() {
    const elem = document.getElementById('vr-background');
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}

// Add to action button
document.querySelector('[title="Toàn màn hình"]')
    .addEventListener('click', enterFullscreen);
```

---

## 🎬 Transitions & Animations

### Smooth Scene Transitions

```javascript
function transitionToPanorama(newUrl) {
    // Fade out
    fadeOut(currentPanorama, 500);
    
    // Load new panorama
    setTimeout(() => {
        loadPanorama(newUrl);
        fadeIn(newPanorama, 500);
    }, 500);
}

function fadeOut(element, duration) {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = '0';
}

function fadeIn(element, duration) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms`;
    setTimeout(() => {
        element.style.opacity = '1';
    }, 10);
}
```

---

## 🔍 Example: Complete Integration

```javascript
// In main.js

// Initialize VR viewer on page load
let vrViewer = null;

async function initVRViewer() {
    vrViewer = pannellum.viewer('panorama', {
        type: 'equirectangular',
        panorama: 'default-panorama.jpg',
        autoLoad: true,
        showControls: true,
        hotSpotDebug: false
    });
}

// Update handleCardClick
function handleCardClick(id) {
    const item = state.filteredData.find(item => item.id === id);
    if (!item) return;
    
    // Analytics
    trackEvent('VR', 'Load', item.name.vi);
    
    // Close panel
    closePanel();
    
    // Load VR
    if (vrViewer && item.panoramaUrl) {
        vrViewer.loadScene(item.id, {
            type: 'equirectangular',
            panorama: item.panoramaUrl,
            hotSpots: item.hotspots?.map(spot => ({
                pitch: spot.position.pitch,
                yaw: spot.position.yaw,
                type: 'scene',
                text: spot.name,
                sceneId: spot.id,
                targetPanorama: spot.panoramaUrl
            }))
        });
    }
    
    // Update URL
    updateURL(item);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initVRViewer();
    init(); // Original init function
});
```

---

## ✅ Testing Checklist

- [ ] VR loads correctly on desktop
- [ ] VR loads correctly on mobile
- [ ] Hotspots clickable and working
- [ ] Smooth transitions between scenes
- [ ] URL updates correctly
- [ ] Back button works
- [ ] Fullscreen works
- [ ] Gyroscope works (mobile)
- [ ] Touch controls smooth
- [ ] No performance issues

---

## 📚 Resources

- [Pannellum Documentation](https://pannellum.org/documentation/overview/)
- [A-Frame Documentation](https://aframe.io/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [WebXR API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)

---

**Happy VR Development! 🥽**

*Last updated: November 2025*