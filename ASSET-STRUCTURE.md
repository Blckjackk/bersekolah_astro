# Struktur Asset Bersekolah Frontend

## Folder Structure
```
public/
├── assets/
│   └── image/
│       ├── company-profile/     # Logo, favicon, company assets
│       │   ├── logo-bersekolah-08.png
│       │   ├── FAQ.png
│       │   ├── 404-not-found.jpg  
│       │   ├── default-mentor.jpg
│       │   └── default-article.jpg
│       ├── auth/                # Login, register images
│       ├── hero/                # Hero section images
│       └── about/               # About page images
```

## Aturan Penggunaan

### Static Assets (Menggunakan /assets/image/)
- Logo dan favicon perusahaan
- Gambar halaman login/register
- Gambar hero section
- Gambar halaman tentang
- Default/fallback images
- Semua gambar yang tidak berubah dan bukan hasil upload user

### Dynamic Assets (Menggunakan Laravel storage/)
- Foto testimoni (hasil upload)
- Foto mentor (hasil upload admin)
- Gambar artikel (hasil upload admin)
- Semua file yang diupload melalui form

## Path Examples

### Static (Frontend)
```javascript
// Logo
"/assets/image/company-profile/logo-bersekolah-08.png"

// Default images
"/assets/image/company-profile/default-mentor.jpg"
"/assets/image/company-profile/default-article.jpg" 

// FAQ image
"/assets/image/company-profile/FAQ.png"
```

### Dynamic (Backend Storage)
```javascript
// Testimoni (from database)
`http://localhost:8000/storage/testimoni/${filename}`

// Mentor (from database)  
`http://localhost:8000/storage/mentor/${filename}`

// Artikel (from database)
`http://localhost:8000/storage/artikel/${filename}`
```

## Benefits
- Faster loading untuk static assets (tidak perlu hit backend)
- Better organization (terpisah antara static dan dynamic)
- Easier deployment (static assets bisa di-cache lebih lama)
- Cleaner project structure
