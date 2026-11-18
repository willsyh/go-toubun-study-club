# Go-Toubun Study Club

Website belajar bertema Gotoubun no Hanayome: pilih salah satu dari lima saudari Nakano sebagai tutor, tanyakan apa saja, simpan catatan, dan biarkan tutor "mengingat" tentang dirimu.

Dibuat dengan Next.js 16 (App Router, Cache Components), TypeScript, dan Tailwind CSS 4.

## Menjalankan

```bash
npm install
cp .env.example .env.local   # lalu isi SESSION_SECRET
npm run dev                  # http://localhost:3000
```

Membuat `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Saat development, secret bawaan dipakai kalau belum diisi. Mode production (`npm run build && npm start`) tidak mau jalan tanpa `SESSION_SECRET`.

## Fitur

| Halaman | Isi |
|---|---|
| `/login`, `/signup` | Email + password, "Remember me", konfirmasi umur 13+, tombol Google |
| `/forgot-password`, `/reset-password` | Link reset berlaku 30 menit dan hanya sekali pakai |
| `/` | Chat. Pilih tutor (Ichika, Nino, Miku, Yotsuba, Itsuki), lampirkan file, salin jawaban atau simpan ke Notes |
| `/notes` | Catatan dengan pencarian dan simpan otomatis |
| `/memory` | Fakta tentang dirimu yang dipakai tutor |
| `/account` | Ganti password, unduh backup, hapus data lokal, hapus akun |
| `/privacy` | Penjelasan data apa saja yang disimpan |

Lainnya: sidebar bisa disembunyikan, pencarian chat (Ctrl+K), mode gelap, tampilan ponsel.

## Penyimpanan data

- **Server (akun):** email, hash password scrypt, ID Google. Disimpan di **Neon Postgres** kalau `DATABASE_URL` diisi. Tabel `users` dibuat otomatis saat pertama dipakai, jadi tidak perlu menjalankan migrasi.
  - Tanpa `DATABASE_URL`, mode development menyimpan akun ke `data/users.json` (masuk `.gitignore`). Mode production menolak jalan tanpa `DATABASE_URL`.
  - Kodenya ada di [src/lib/server/users.ts](src/lib/server/users.ts) dan [src/lib/server/user-store-neon.ts](src/lib/server/user-store-neon.ts).
- **Browser:** chat, catatan, dan memory disimpan di `localStorage`, dipisah per akun.

### Menyambungkan Neon

1. Buat akun dan proyek di [neon.com](https://neon.com).
2. Di dashboard proyek, klik **Connect** dan salin connection string (`postgresql://...`).
3. Tempel ke `.env.local`: `DATABASE_URL=postgresql://...`
4. Jalankan ulang `npm run dev`. Saat deploy (misalnya ke Vercel), isi variabel `DATABASE_URL` dan `SESSION_SECRET` yang sama di pengaturan hosting.

## Yang belum terhubung

- **AI:** balasan tutor masih contoh (ada label "Demo reply"). Ganti fungsi `scheduleReply` di [src/components/chat/chat-view.tsx](src/components/chat/chat-view.tsx) dengan panggilan ke endpoint AI. Kepribadian tiap tutor ada di [src/lib/tutors.ts](src/lib/tutors.ts).
- **Email:** link reset password masih dicetak di terminal server. Sambungkan pengirim email di [src/app/api/auth/forgot/route.ts](src/app/api/auth/forgot/route.ts).
- **Google sign-in:** isi `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`, lalu daftarkan `<APP_URL>/api/auth/google/callback` sebagai redirect URI di Google Cloud Console.
- **Plan / langganan:** tombolnya baru menampilkan "coming soon".

## Gambar

| File | Dipakai untuk |
|---|---|
| `public/images/auth-login.jpg` | Ilustrasi halaman login |
| `public/images/auth-signup.jpg` | Ilustrasi halaman daftar |
| `public/images/itsuki-angry.jpg` | Itsuki marah saat ada kesalahan (password salah, form kosong, dll.) |
| `public/images/itsuki-teach.jpg` | Itsuki mengajar: panel di samping chat dan avatar bulatnya |
| `public/images/itsuki-teach-mouth.png` | Potongan "mulut tertutup" yang berkedip saat Itsuki bicara |

Mulut bergerak dengan cara menampilkan dan menyembunyikan potongan mulut tertutup secara bergantian di atas gambar asli (yang mulutnya terbuka), selama jawaban sedang diketik. Posisi potongan dan area wajah untuk avatar diatur di `portrait` pada [src/lib/tutors.ts](src/lib/tutors.ts). Kalau `itsuki-teach.jpg` diganti dengan gambar lain, potongan mulutnya juga harus dibuat ulang.

Untuk memberi gambar ke saudari lain, tambahkan `portrait` dengan format yang sama. Tanpa `portrait`, tutor ditampilkan sebagai lingkaran berwarna dengan huruf awal namanya.
