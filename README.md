# Galeri STEAM

Web dokumentasi (noindex) yang membaca folder foto dan video di Google Drive secara otomatis.
Foto tampil sebagai carousel yang bergeser sendiri; video tampil dengan pemutar Drive (perlu satu ketukan untuk play).

## 1. Buat API key (sekali saja)
1. Buka console.cloud.google.com, buat project baru.
2. APIs & Services > Library > aktifkan **Google Drive API**.
3. APIs & Services > Credentials > Create credentials > **API key**.
4. Di Restrict key, pilih **API restrictions > Google Drive API**. Jangan pakai pembatasan HTTP referrer, karena kunci dipakai dari server Vercel.

## 2. Jalankan lokal
```
cp .env.example .env.local     # lalu isi DRIVE_API_KEY
npm install
npm run dev
```

## 3. Deploy ke Vercel
1. Unggah folder ini ke repositori GitHub, lalu Import di Vercel.
2. Di Settings > Environment Variables, isi `DRIVE_API_KEY`, `PHOTO_FOLDER_ID`, `VIDEO_FOLDER_ID`.
3. Deploy. Perubahan isi folder Drive muncul sendiri dalam sekitar 5 menit.

## 4. Uji
- Buka link Vercel di jendela incognito dan di ponsel lain.
- Urutan tampilan mengikuti nama file (01_..., 02_...).
- Noindex aktif lewat meta tag, header X-Robots-Tag, dan robots.txt.

## Jika foto/video tidak muncul
- Pastikan file bernama `.env.local` (bukan `.env.example`) ada di folder utama proyek, dengan nama variabel persis `DRIVE_API_KEY`, `PHOTO_FOLDER_ID`, `VIDEO_FOLDER_ID`.
- Setelah membuat atau mengubah `.env.local`, hentikan `npm run dev` (Ctrl+C) lalu jalankan lagi.
- Saat `npm run dev`, alasan gagal tampil kecil di bawah pesan di halaman dan di terminal.
- Jika API bermasalah, kode otomatis mencoba jalur cadangan (tampilan folder tersemat Drive) yang tidak memerlukan API key.
