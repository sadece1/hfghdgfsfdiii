# Grader Marketplace - Quick Start Guide

Bu rehber, projeyi hızlıca çalıştırmak için gerekli adımları içerir.

## 🚀 Hızlı Başlangıç

### 1. Veritabanı Kurulumu

```bash
# MySQL/MariaDB'de veritabanı oluşturun
mysql -u root -p
CREATE DATABASE grader_marketplace;
USE grader_marketplace;

# Schema'yı import edin
source database/schema.sql;
```

### 2. Backend Kurulumu

```bash
cd server
cp env.example .env
# .env dosyasını düzenleyin

npm install
npm start
```

### 3. Frontend Kurulumu

```bash
# Ana dizinde
cp .env.example .env
# .env dosyasını düzenleyin

npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=grader_marketplace
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000/api
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş yapma

### Graders
- `GET /api/graders` - Grader listesi
- `GET /api/graders/:id` - Grader detayı
- `POST /api/graders` - Yeni grader ekleme (Auth gerekli)

### Parts
- `GET /api/parts` - Parça listesi
- `GET /api/parts/:id` - Parça detayı
- `POST /api/parts` - Yeni parça ekleme (Auth gerekli)

### Diğer
- `GET /api/sales-locations` - Satış lokasyonları
- `POST /api/contact` - İletişim mesajı
- `GET /api/health` - Sistem durumu

## 🗄️ Veritabanı Tabloları

- `users` - Kullanıcılar
- `graders` - Motor graderlar
- `parts` - Parçalar
- `favorites` - Favoriler
- `homepage_slider` - Ana sayfa slider
- `contact_messages` - İletişim mesajları
- `sales_locations` - Satış lokasyonları

## 🔒 Güvenlik

- JWT token authentication
- Password hashing (bcrypt)
- CORS protection
- Rate limiting
- Helmet security headers
- SQL injection protection

## 📱 Özellikler

- ✅ Kullanıcı kaydı/girişi
- ✅ Grader yönetimi
- ✅ Parça yönetimi
- ✅ Stok takibi
- ✅ Favoriler
- ✅ İletişim formu
- ✅ Satış haritası
- ✅ Responsive tasarım
- ✅ Admin paneli

## 🚀 Production Deployment

Detaylı deployment rehberi için `SQL_BACKEND_DEPLOYMENT.md` dosyasını inceleyin.

## 🆘 Sorun Giderme

### Database Connection Error
```bash
# MySQL servisini kontrol edin
sudo systemctl status mysql
sudo systemctl start mysql
```

### Port Already in Use
```bash
# Port 3000'i kullanan process'i bulun
lsof -i :3000
kill -9 PID
```

### CORS Error
- Frontend URL'inin backend'de doğru ayarlandığından emin olun
- Environment variables'ları kontrol edin

---

**🎉 Proje başarıyla çalışıyor!**

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- API Docs: http://localhost:3000/api/health
