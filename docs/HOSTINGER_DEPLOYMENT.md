# 🚀 Hostinger Cloud Startup Deployment Rehberi

Bu rehber, projenizi Hostinger Cloud Startup planı ile canlıya almak için gerekli adımları içerir.

## 📋 Ön Gereksinimler

1. **Hostinger Cloud Startup Planı**: Aktif hosting hesabı
2. **Domain**: Kendi domain'iniz (opsiyonel)
3. **EmailJS Hesabı**: Production için EmailJS servisi ayarlayın
4. **MySQL Database**: Hostinger'da MySQL veritabanı

## 🔧 1. Proje Hazırlığı

### Frontend Build
```bash
# Projeyi build et
npm run build

# dist/ klasörü oluşacak
```

### Backend Hazırlığı
```bash
# Server klasörüne git
cd server

# Dependencies yükle
npm install

# Production için optimize et
npm run build
```

## 🌐 2. Hostinger File Manager ile Upload

### Frontend Upload
1. **Hostinger Control Panel**'e giriş yapın
2. **File Manager**'ı açın
3. `public_html/` klasörüne gidin
4. `dist/` klasörünün içeriğini `public_html/` klasörüne yükleyin

### Backend Upload
1. `server/` klasörünün içeriğini `public_html/api/` klasörüne yükleyin
2. `package.json` ve `index.js` dosyalarını yükleyin

## 🗄️ 3. MySQL Database Kurulumu

### Database Oluşturma
1. **Hostinger Control Panel**'de **MySQL Databases**'e gidin
2. Yeni database oluşturun: `grader_marketplace`
3. Database user oluşturun
4. User'ı database'e bağlayın

### Schema Import
1. **phpMyAdmin**'e gidin
2. `database/schema.sql` dosyasını import edin
3. Tabloların oluştuğunu kontrol edin

## ⚙️ 4. Environment Variables

### Frontend (.env)
```bash
# .env dosyası oluşturun
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_ENCRYPTION_KEY=your-production-key
REACT_APP_JWT_SECRET=your-production-jwt-secret
```

### Backend (.env)
```bash
# server/.env dosyası oluşturun
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=grader_marketplace
JWT_SECRET=your-production-jwt-secret
```

## 🚀 5. Backend Başlatma

### Node.js App Oluşturma
1. **Hostinger Control Panel**'de **Node.js** sekmesine gidin
2. Yeni Node.js app oluşturun
3. **Startup File**: `index.js`
4. **App Directory**: `api/`
5. **Node Version**: 18.x veya üzeri

### App Başlatma
1. **Start App** butonuna tıklayın
2. Logları kontrol edin
3. App'in çalıştığını doğrulayın

## 🔒 6. SSL ve Güvenlik

### SSL Sertifikası
1. **Hostinger Control Panel**'de **SSL** sekmesine gidin
2. **Let's Encrypt** sertifikası aktif edin
3. **Force HTTPS** seçeneğini aktif edin

### Security Headers
- Hostinger otomatik güvenlik header'ları sağlar
- Ek güvenlik için `.htaccess` dosyası ekleyebilirsiniz

## 📱 7. Domain Ayarları

### Custom Domain (Opsiyonel)
1. **Domain Management**'a gidin
2. Domain'inizi Hostinger'a point edin
3. DNS ayarlarını yapılandırın

### Subdomain (Opsiyonel)
1. `api.yourdomain.com` için subdomain oluşturun
2. Backend'i subdomain'e point edin

## 🔄 8. Güncelleme Süreci

### Frontend Güncelleme
```bash
# Yeni build oluştur
npm run build

# File Manager ile dist/ içeriğini yükle
```

### Backend Güncelleme
```bash
# Server klasöründe değişiklikleri yükle
# Hostinger'da app'i restart et
```

## 🐛 9. Troubleshooting

### Yaygın Sorunlar

#### 1. **App Başlamıyor**
- Logları kontrol edin
- Environment variables'ları kontrol edin
- Node.js version'ını kontrol edin

#### 2. **Database Bağlantı Hatası**
- Database credentials'ları kontrol edin
- MySQL service'inin çalıştığını kontrol edin

#### 3. **Frontend API Çağrıları Başarısız**
- CORS ayarlarını kontrol edin
- API URL'ini kontrol edin
- SSL sertifikasını kontrol edin

### Log Kontrolü
1. **Hostinger Control Panel**'de **Logs** sekmesine gidin
2. Error loglarını kontrol edin
3. Access loglarını kontrol edin

## 📊 10. Monitoring

### Performance Monitoring
- Hostinger'ın built-in monitoring'ini kullanın
- Google Analytics ekleyin
- Error tracking için Sentry kullanın

### Backup
1. **Backup** sekmesine gidin
2. Otomatik backup'ı aktif edin
3. Manuel backup oluşturun

## 🎉 11. Sonuç

**🎉 Tebrikler!** Artık projeniz Hostinger Cloud Startup'da çalışıyor olmalı.

**Site URL**: `https://yourdomain.com`
**API URL**: `https://yourdomain.com/api`

## 📞 Destek

Sorun yaşarsanız:
1. Hostinger Support'a başvurun
2. Logları kontrol edin
3. Environment variables'ları doğrulayın

---

**Not**: Bu rehber Hostinger Cloud Startup planı için hazırlanmıştır. Diğer planlar için farklı adımlar gerekebilir.


