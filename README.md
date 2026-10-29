# Sistem Antrean Verifikasi SPMB — SMAN 1 Sooko

Sistem antrean digital untuk layanan verifikasi SPMB, realtime lewat Firebase Realtime Database. Empat halaman independen, semua terhubung ke database yang sama:

| Halaman | Untuk siapa | Ditampilkan di |
|---|---|---|
| `index.html` | Pengunjung/peserta | **Videotron / proyektor** — layar PC di-*duplicate* (mirror) ke proyektor. Orientasi landscape. |
| `operator.html` | Petugas loket | PC desktop operator, untuk memanggil nomor antrean |
| `admin.html` | Panitia/admin | PC desktop panitia, untuk monitoring statistik & reset antrean |
| `printer.html` | Petugas pendaftaran | PC yang terhubung ke printer termal 58 mm untuk mengambil dan mencetak tiket |

## Cara Menjalankan

Karena semua modul JS pakai `type="module"`, tidak bisa dibuka langsung dengan double-click file (`file://`). Harus lewat server lokal, contoh:

```bash
npx serve .
# atau
python -m http.server 8000
```

Lalu buka `index.html`, `operator.html`, `printer.html`, dan `admin.html` masing-masing di tab/PC sesuai peran.

**Untuk videotron:** buka `index.html` di PC yang layarnya di-duplicate ke proyektor, lalu tekan `F11` untuk fullscreen. Klik sekali di halaman untuk mengaktifkan suara (browser mewajibkan 1x interaksi sebelum bisa memutar audio).

## Struktur Folder

```
no-antreanSPMB/
├── index.html          # Videotron / display utama
├── operator.html        # Panel petugas loket
├── admin.html            # Panel panitia/admin
├── printer.html          # Ambil nomor & cetak tiket termal
├── js/
│   ├── config.js         # ⭐ SATU-SATUNYA tempat ganti data tiap tahun
│   ├── firebase.js        # Koneksi & inisialisasi Firebase
│   └── app.js               # Semua fungsi antrean (next, recall, reset, dst)
├── assets/                # Logo, background, gambar
└── sounds/                # Efek suara (ding, panggilan)
```

## Ganti Data Tiap Tahun Ajaran Baru

Cukup edit **satu file**: `js/config.js`

```js
export const TAHUN_AJARAN = "2027/2028";
export const petugas = {
  A: "Nama Petugas Loket A",
  B: "Nama Petugas Loket B",
  // tambah/kurang baris sesuai jumlah meja yang tersedia
};
```

Tidak perlu edit `index.html`, `operator.html`, atau `admin.html` — ketiganya otomatis ikut berubah karena semua ambil data dari `config.js` lewat `app.js`.

## Kalau Ganti Project Firebase

Edit `firebaseConfig` di `js/firebase.js` (satu-satunya tempat config Firebase ditulis).

## Cara Kerja Antrean Terpusat

- Semua peserta mendapatkan nomor global berurutan: `SPMB-001`, `SPMB-002`, dan seterusnya, tanpa prefix loket.
- Petugas di loket mana pun memanggil tiket berstatus `waiting` dengan nomor urut paling kecil. Transaksi Firebase mencegah dua loket mengambil tiket yang sama.
- Saat loket memanggil nomor berikutnya, tiket aktif sebelumnya di loket tersebut ditandai selesai. Jika antrean kosong, tiket aktif sebelumnya tetap ditutup dan layar menampilkan kondisi kosong.
- Statistik menampilkan jumlah tiket menunggu, sedang dilayani, dan selesai berdasarkan status tiket di Firebase.
- `printer.html` menyediakan tombol Ambil & Cetak, cetak ulang tiket terakhir pada perangkat itu, serta tata letak struk termal 58 mm. Nomor dibuat di database sebelum dialog cetak dibuka.
- Cetak melalui browser biasanya menampilkan dialog cetak. Untuk mencetak tanpa dialog, siapkan komputer khusus dan konfigurasi kiosk/print policy browser; fitur itu tidak dapat dijamin hanya oleh halaman web.

### Pengaturan printer termal

1. Hubungkan printer termal USB/LAN ke komputer dashboard pencetak dan instal driver.
2. Buka `printer.html` lewat web hosting/localhost, lalu pilih **Ambil & Cetak Nomor**.
3. Pada dialog cetak, pilih printer termal, ukuran kertas 58 mm, margin minimum, dan nonaktifkan header/footer browser.
4. Lakukan uji cetak beberapa tiket sebelum hari pelayanan.

## Struktur Data di Firebase Realtime Database

```
/queue_meta/lastIssued     -> nomor global terakhir diterbitkan
/tickets/SPMB-001          -> { sequence, status, createdAt, loket, calledAt, completedAt }
/active_by_loket/{A..J}    -> tiket yang sedang dilayani di loket
/loket/{A..J}              -> nomor tiket aktif per loket
/counter/{A..J}            -> jumlah panggilan per loket
/current_call              -> nomor, loket, callType, updatedAt
```

`status` tiket: `waiting`, `serving`, atau `completed`.
## Catatan Teknis

- Semua fungsi database ada di `js/app.js` — kalau perlu fungsi baru (misal statistik harian), tambahkan di sini, jangan ditulis ulang di file HTML.
- `js/firebase.js` otomatis mengisi data default (`loket`, `counter`, `current_call`) kalau database masih kosong, jadi tidak perlu setup manual di Firebase Console setiap tahun.


## Audit Keamanan dan Keandalan

- **Wajib diperiksa di Firebase Console:** pastikan Realtime Database Security Rules tidak mengizinkan akses baca/tulis publik tanpa autentikasi. Aplikasi saat ini belum memiliki alur login; jangan menganggap tombol/konfirmasi di halaman sebagai kontrol keamanan.
- API key Firebase pada aplikasi web mengidentifikasi proyek, bukan menggantikan Security Rules. Batasi akses melalui Rules dan konfigurasi layanan Firebase yang sesuai.
- Nomor tiket global dan pemanggilan antrean memakai transaksi root Firebase agar penerbitan/pemanggilan bersamaan tidak membuat nomor ganda.
- Reset semua loket menggunakan satu multi-location update untuk mengurangi risiko keadaan data yang tidak konsisten.
- Nilai yang berasal dari database dan nama petugas ditampilkan melalui `textContent`, bukan disisipkan sebagai HTML.
- Uji alur panggil, recall, reset, audio, dan akses lintas perangkat pada lingkungan staging sebelum dipakai untuk pelayanan resmi.


- **Catatan transaksi:** agar penerbitan tiket dan pemanggilan antrean bersama benar-benar atomik, transaksi berjalan pada root Realtime Database. Ini membutuhkan izin baca/tulis pada lokasi root dan membaca struktur database yang ada. Jika Security Rules hanya memberi izin pada child tertentu, transaksi ini dapat ditolak; untuk keamanan paling kuat, pindahkan operasi antrean ke backend tepercaya/Cloud Functions dan jangan membuka akses root kepada klien tanpa autentikasi.

**Batas audit:** koneksi GitHub dapat membaca kode dan menulis commit, tetapi pemeriksaan aturan keamanan Firebase melalui endpoint yang tersedia ditolak oleh izin integrasi. Rules Firebase belum diubah dan keamanan akses database belum dapat dinyatakan terverifikasi.
