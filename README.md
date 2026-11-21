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
| `/` | Main Menu bergaya "Desktop Edition" (kertas krem, font serif) dengan intro langit berbintang dan kartu nama kelima saudari (sekali per sesi browser) |
| `/characters` | Pilih tutor (tahan kartu untuk melihat outfit), atau aktifkan Two-quint mode untuk memilih dua tutor |
| `/study` | Study & Chat: tutor berdiri di ruang tamu ala visual novel, kotak dialog dengan efek mengetik dan suara, Whiteboard, Graphing calculator (bisa menggambar fungsi dan mencari titik nol). `?t=miku,nino` untuk dua tutor |
| `/read` | Read & Chat: unggah foto, PDF, video lokal, atau link YouTube ke "reading desk" lalu bahas bersama tutor |
| `/call` | Call & Chat: layar telepon gelap, suara tutor lewat speech synthesis browser, bicara lewat mikrofon (Chrome/Edge) atau ketik di tab Message |
| `/language` | Nino's Language Class: latihan terjemahan Jepang, Indonesia, Spanyol dengan XP dan nyawa |
| `/exams`, `/exams/drill` | Exam Library (44 ujian dari seluruh dunia, pencarian dan filter) dan Exam Drill (timer, nomor soal, tandai untuk review, helper tutor yang menjelaskan jawaban salah) |
| `/chat` | Chat klasik. Pilih tutor, lampirkan file, salin jawaban atau simpan ke Notes |
| `/notes` | Catatan dengan pencarian dan simpan otomatis |
| `/memory` | Fakta tentang dirimu yang dipakai tutor |
| `/account` | Ganti password, unduh backup, hapus data lokal, hapus akun |
| `/privacy` | Penjelasan data apa saja yang disimpan |

Settings (AI, Character, Voice, Appearance, Storage; 13 bahasa suara) bisa dibuka dari Main Menu dan ruang belajar. Lainnya: sidebar bisa disembunyikan, pencarian chat (Ctrl+K), mode gelap, tampilan ponsel.

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

- **AI:** balasan tutor masih contoh (ada label "Demo reply"). Ganti fungsi `scheduleReply` di [src/components/chat/chat-view.tsx](src/components/chat/chat-view.tsx) dengan panggilan ke endpoint AI. Untuk layar Study/Read/Call, ganti `studyReply` di [src/lib/studio/demo-brain.ts](src/lib/studio/demo-brain.ts); saat ini ia mengenali beberapa topik contoh (matriks, termodinamika, kinematika, polinomial, grafik, Napoleon). Kepribadian tiap tutor ada di [src/lib/tutors.ts](src/lib/tutors.ts).
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
| `public/images/<nama>-art.webp` | Gambar resmi bernomor 1–5 untuk kartu pilih karakter. Ichika dan Nino juga memakainya untuk panel mengajar dan avatar. |
| `public/images/miku-bust.webp`, `yotsuba-bust.jpg` | Panel mengajar dan avatar Miku dan Yotsuba |
| `public/images/*-mouth.png` | Potongan "mulut tertutup" untuk animasi bicara tiap gambar |
| `public/images/<nama>-sprite.webp` | Salinan `<nama>-art.webp` tanpa angka besar di belakangnya; dipakai di panggung, kartu pilih tutor dan intro |

Mulut bergerak dengan cara menampilkan dan menyembunyikan potongan mulut tertutup secara bergantian di atas gambar asli (yang mulutnya terbuka), selama jawaban sedang diketik. Posisi potongan dan area wajah untuk avatar diatur di `portrait` pada [src/lib/tutors.ts](src/lib/tutors.ts). Kalau `itsuki-teach.jpg` diganti dengan gambar lain, potongan mulutnya juga harus dibuat ulang.

Untuk memberi gambar ke saudari lain, tambahkan `portrait` dengan format yang sama. Tanpa `portrait`, tutor ditampilkan sebagai lingkaran berwarna dengan huruf awal namanya.
