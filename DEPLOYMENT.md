# 🚀 Deployment Guide - VR360 Demo

Hướng dẫn chi tiết để deploy ứng dụng VR360 lên môi trường production.

---

## 📋 Pre-Deployment Checklist

### ✅ Code Optimization

**1. Minify Files**
```bash
# CSS Minification
npx clean-css-cli css/style.css -o css/style.min.css

# JavaScript Minification
npx terser js/main.js -o js/main.min.js
npx terser js/config.js -o js/config.min.js
npx terser js/api-service.js -o js/api-service.min.js
```

**2. Update References**
Trong `index.html`, đổi sang minified versions:
```html
<link rel="stylesheet" href="css/style.min.css">
<script src="js/config.min.js"></script>
<script src="js/main.min.js"></script>
```

**3. Image Optimization**
```bash
# Optimize images
npx imagemin assets/**/*.{jpg,png} --out-dir=assets/optimized
```

### ✅ Configuration Updates

**1. Update API Endpoint**
File: `js/config.js`
```javascript
const CONFIG = {
    api: {
        baseURL: 'https://your-production-api.com/api', // 👈 Update this
        // ...
    },
    dev: {
        enableDebug: false,        // 👈 Disable debug
        enableConsoleLog: false,   // 👈 Disable logs
        mockAPI: false             // 👈 Use real API
    }
}
```

**2. Update Analytics**
```javascript
analytics: {
    trackingId: 'UA-XXXXXXXXX-X' // 👈 Your GA ID
}
```

### ✅ Security Checks

**1. Environment Variables**
Create `.env` file (don't commit!):
```bash
API_BASE_URL=https://api.example.com
API_KEY=your_secret_key
GA_TRACKING_ID=UA-XXXXXXXXX-X
```

**2. CSP Headers**
Add to server config:
```
Content-Security-Policy: default-src 'self'; img-src 'self' https:; script-src 'self' 'unsafe-inline'
```

---

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)

**Step 1: Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**Step 2: Login**
```bash
netlify login
```

**Step 3: Deploy**
```bash
cd vr360-demo
netlify deploy --prod
```

**Step 4: Configure**
Create `netlify.toml`:
```toml
[build]
  publish = "."
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

---

### Option 2: Vercel

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Deploy**
```bash
cd vr360-demo
vercel --prod
```

**Step 3: Configure**
Create `vercel.json`:
```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

### Option 3: GitHub Pages

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/vr360-demo.git
git push -u origin main
```

**Step 2: Enable GitHub Pages**
1. Vào Settings > Pages
2. Source: Deploy from branch
3. Branch: main / root
4. Save

**Step 3: Access**
```
https://yourusername.github.io/vr360-demo/
```

---

### Option 4: Traditional Web Hosting

**Step 1: Build Production**
```bash
# Minify all files
npm run build # (if you have build script)

# Or manually minify as shown above
```

**Step 2: Upload via FTP/SFTP**
```bash
# Using lftp
lftp ftp.yourhost.com
> login yourusername
> cd public_html
> mirror -R vr360-demo/
> quit
```

**Step 3: Configure .htaccess**
```apache
# Enable GZIP
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
</IfModule>

# Rewrite for Single Page App
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

### Option 5: AWS S3 + CloudFront

**Step 1: Create S3 Bucket**
```bash
aws s3 mb s3://vr360-demo
```

**Step 2: Upload Files**
```bash
aws s3 sync . s3://vr360-demo \
  --exclude ".git/*" \
  --exclude "*.md" \
  --cache-control max-age=31536000
```

**Step 3: Configure Bucket**
```bash
# Enable static website hosting
aws s3 website s3://vr360-demo \
  --index-document index.html \
  --error-document index.html
```

**Step 4: Create CloudFront Distribution**
```bash
aws cloudfront create-distribution \
  --origin-domain-name vr360-demo.s3.amazonaws.com \
  --default-root-object index.html
```

---

## 🔧 Post-Deployment

### ✅ Performance Testing

**1. Lighthouse**
```bash
npm install -g lighthouse
lighthouse https://your-deployed-url.com --view
```

**2. PageSpeed Insights**
Visit: https://pagespeed.web.dev/
Enter your URL

**3. WebPageTest**
Visit: https://www.webpagetest.org/
Test from multiple locations

### ✅ Monitoring Setup

**1. Google Analytics**
Verify tracking is working:
- Open browser console
- Check for GA events
- View Real-Time reports in GA

**2. Error Tracking**
Add Sentry or similar:
```javascript
// Add to index.html
<script src="https://browser.sentry-cdn.com/[VERSION]/bundle.min.js"></script>
<script>
  Sentry.init({ dsn: 'YOUR_DSN' });
</script>
```

**3. Uptime Monitoring**
Set up with:
- UptimeRobot (free)
- Pingdom
- StatusCake

### ✅ SEO Configuration

**1. meta tags**
Add to `<head>` in index.html:
```html
<!-- Primary Meta Tags -->
<title>VR360 Du Lịch Phan Thiết | Virtual Tour</title>
<meta name="title" content="VR360 Du Lịch Phan Thiết">
<meta name="description" content="Khám phá Phan Thiết qua công nghệ VR360. Trải nghiệm ảo các khách sạn, resort và điểm du lịch.">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://your-url.com/">
<meta property="og:title" content="VR360 Du Lịch Phan Thiết">
<meta property="og:description" content="Khám phá Phan Thiết qua công nghệ VR360">
<meta property="og:image" content="https://your-url.com/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://your-url.com/">
<meta property="twitter:title" content="VR360 Du Lịch Phan Thiết">
<meta property="twitter:description" content="Khám phá Phan Thiết qua công nghệ VR360">
<meta property="twitter:image" content="https://your-url.com/twitter-image.jpg">
```

**2. robots.txt**
Create in root:
```txt
User-agent: *
Allow: /

Sitemap: https://your-url.com/sitemap.xml
```

**3. sitemap.xml**
Generate and place in root:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-url.com/</loc>
    <lastmod>2025-11-07</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

---

## 🔐 Security Hardening

### SSL/TLS Certificate
- Use Let's Encrypt (free)
- Force HTTPS redirect
- Enable HSTS

### Content Security Policy
Add meta tag:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               img-src 'self' https:; 
               script-src 'self' 'unsafe-inline' https://www.google-analytics.com">
```

### API Security
- Use HTTPS only
- Implement rate limiting
- Add authentication tokens
- Enable CORS properly

---

## 📊 Analytics & Tracking

### Google Analytics 4
```javascript
// In config.js
analytics: {
    trackingId: 'G-XXXXXXXXXX', // GA4 ID
    trackPageViews: true,
    trackEvents: true
}
```

### Custom Events
Track important user actions:
```javascript
// Add to main.js
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Usage
trackEvent('Navigation', 'Click', 'Hotel Card');
trackEvent('Search', 'Query', searchTerm);
```

---

## 🚨 Rollback Plan

### Version Control
```bash
# Tag current version
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# Rollback if needed
git checkout v1.0.0
netlify deploy --prod
```

### Backup Strategy
- Keep previous deployment artifacts
- Database snapshots (if applicable)
- Config file backups

---

## 📞 Support & Maintenance

### Regular Tasks
- [ ] Weekly: Check analytics reports
- [ ] Weekly: Review error logs
- [ ] Monthly: Run performance tests
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Security audit

### Monitoring Checklist
- [ ] Uptime monitoring active
- [ ] Error tracking configured
- [ ] Analytics working
- [ ] SSL certificate valid
- [ ] Backups automated

---

## 🎯 Performance Targets

### Load Times
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Total Bundle Size: < 150KB

### Lighthouse Scores
- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 95+

---

## ✅ Final Checklist

Before going live:

- [ ] All files minified
- [ ] API endpoints updated
- [ ] Analytics configured
- [ ] SEO meta tags added
- [ ] SSL certificate installed
- [ ] Error tracking setup
- [ ] Backups configured
- [ ] Performance tested
- [ ] Mobile tested
- [ ] Cross-browser tested
- [ ] Security headers configured
- [ ] Monitoring setup
- [ ] Documentation updated

---

**Deployment Complete! 🎉**

Your VR360 app is now live and ready for users!

Monitor the first 24 hours closely and be ready to respond to any issues.

---

*For support: contact@yourcompany.com*  
*Last updated: November 2025*