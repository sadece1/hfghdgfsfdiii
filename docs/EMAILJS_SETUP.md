# EmailJS Kurulum Rehberi - 2 Adımlı Giriş Sistemi

## 📧 Gerçek Email Gönderimi İçin EmailJS Kurulumu

### 1. EmailJS Hesabı Oluşturma

1. [EmailJS.com](https://www.emailjs.com/) adresine gidin
2. "Sign Up" ile ücretsiz hesap oluşturun
3. Email adresinizi doğrulayın

### 2. Email Servisi Ekleme

1. Dashboard'da "Email Services" sekmesine gidin
2. "Add New Service" butonuna tıklayın
3. Gmail, Outlook veya istediğiniz email servisini seçin
4. Email hesabınızı bağlayın
5. Service ID'yi not edin (örn: `service_xxxxxxx`)

### 3. Email Template Oluşturma

1. "Email Templates" sekmesine gidin
2. "Create New Template" butonuna tıklayın
3. Template ID'yi not edin (örn: `template_xxxxxxx`)

#### Template İçeriği:
```
Subject: CarMarket Admin - Doğrulama Kodu

Merhaba {{user_name}},

CarMarket admin paneline giriş için doğrulama kodunuz:

{{verification_code}}

Bu kod 10 dakika geçerlidir.

Güvenlik için bu kodu kimseyle paylaşmayın.

Saygılarımla,
CarMarket Ekibi
```

### 4. Public Key Alma

1. Dashboard'da "Account" sekmesine gidin
2. "API Keys" bölümünden Public Key'i kopyalayın

### 5. Environment Variables Ayarlama

Proje kök dizininde `.env.local` dosyası oluşturun ve şu değerleri ekleyin:

```env
# EmailJS Configuration for 2FA
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**Önemli:** `env.example` dosyasını `.env.local` olarak kopyalayın ve gerçek değerlerinizi girin.

### 6. Test Etme

1. Projeyi çalıştırın: `npm run dev`
2. Footer'dan "Giriş" linkine tıklayın
3. Admin bilgilerini girin:
   - Email: `ottosokpoes@gmail.com`
   - Şifre: `T$5vQ8w*Y2k9b!L3zH4RQwsXz`
4. "Doğrulama Kodu Gönder" butonuna tıklayın
5. Email'inizi kontrol edin (spam klasörünü de kontrol edin)
6. Gelen 6 haneli kodu girin

### 🔧 2 Adımlı Giriş Özellikleri

- **Güvenlik:** Email ile doğrulama kodu gönderimi
- **Zaman Sınırı:** Kodlar 10 dakika geçerli
- **Deneme Sınırı:** 3 yanlış denemeden sonra kod geçersiz olur
- **Yeniden Gönderim:** Kod yeniden gönderilebilir
- **Responsive:** Mobil ve desktop uyumlu

### 🚀 Production İçin Ek Güvenlik

1. Environment variables kullanın
2. Rate limiting ekleyin
3. Email gönderim loglarını tutun
4. Backup email servisi hazırlayın
5. Monitoring ve alerting sistemi kurun
6. HTTPS kullanın
7. CSP (Content Security Policy) ekleyin

