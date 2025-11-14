# Docker Deployment Commands

## 🐳 Docker ile Çalıştırma

### 1. Tüm Servisleri Başlatma
```bash
docker-compose up -d
```

### 2. Logları İzleme
```bash
docker-compose logs -f
```

### 3. Servisleri Durdurma
```bash
docker-compose down
```

### 4. Veritabanı ile Birlikte Durdurma
```bash
docker-compose down -v
```

## 🔧 Geliştirme Komutları

### Backend'i Yeniden Build Etme
```bash
docker-compose build backend
docker-compose up -d backend
```

### Frontend'i Yeniden Build Etme
```bash
docker-compose build frontend
docker-compose up -d frontend
```

### Veritabanına Bağlanma
```bash
docker-compose exec mysql mysql -u grader_user -p grader_marketplace
```

### Backend Container'ına Girme
```bash
docker-compose exec backend sh
```

## 📊 Servis Durumları

### Tüm Servislerin Durumu
```bash
docker-compose ps
```

### Belirli Servisin Logları
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

## 🗄️ Veritabanı İşlemleri

### Backup Alma
```bash
docker-compose exec mysql mysqldump -u grader_user -p grader_marketplace > backup.sql
```

### Backup'ı Geri Yükleme
```bash
docker-compose exec -T mysql mysql -u grader_user -p grader_marketplace < backup.sql
```

## 🔄 Production Deployment

### Production Docker Compose
```bash
# Production için environment variables ayarlayın
cp docker-compose.yml docker-compose.prod.yml
# docker-compose.prod.yml dosyasını düzenleyin

docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Sorun Giderme

### Container'ları Temizleme
```bash
docker-compose down
docker system prune -a
docker volume prune
```

### Port Çakışması
```bash
# Port'ları kontrol edin
netstat -tulpn | grep :3000
netstat -tulpn | grep :5173
netstat -tulpn | grep :3306
```

### Veritabanı Bağlantı Sorunu
```bash
# MySQL container'ının çalıştığını kontrol edin
docker-compose ps mysql
docker-compose logs mysql
```

---

**🎉 Docker ile proje başarıyla çalışıyor!**

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- MySQL: localhost:3306
