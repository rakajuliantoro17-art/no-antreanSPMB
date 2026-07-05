# Sistem Antrean Verifikasi SPMB — SMAN 1 Sooko

Sistem antrean digital untuk layanan verifikasi SPMB, realtime lewat Firebase Realtime Database. Tiga halaman independen, semua terhubung ke database yang sama:

| Halaman | Untuk siapa | Ditampilkan di |
|---|---|---|
| `index.html` | Pengunjung/peserta | **Videotron / proyektor** — layar PC di-*duplicate* (mirror) ke proyektor. Orientasi landscape. |
| `operator.html` | Petugas loket | PC desktop operator, untuk memanggil nomor antrean |
| `admin.html` | Panitia/admin | PC desktop panitia, untuk monitoring & reset |

## Cara Menjalankan

Karena semua modul JS pakai `type="module"`, tidak bisa dibuka langsung dengan double-click file (`file://`). Harus lewat server lokal, contoh:

```bash
npx serve .
# atau
python -m http.server 8000
```

Lalu buka `index.html`, `operator.html`, `admin.html` masing-masing di tab/PC berbeda.

**Untuk videotron:** buka `index.html` di PC yang layarnya di-duplicate ke proyektor, lalu tekan `F11` untuk fullscreen. Klik sekali di halaman untuk mengaktifkan suara (browser mewajibkan 1x interaksi sebelum bisa memutar audio).

## Struktur Folder

```
no-antreanSPMB/
├── index.html          # Videotron / display utama
├── operator.html        # Panel petugas loket
├── admin.html            # Panel panitia/admin
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

## Struktur Data di Firebase Realtime Database

```
/loket/{A..J}          -> "000" (nomor tampilan, string 3 digit)
/counter/{A..J}         -> 0 (nomor internal, angka)
/current_call/
  ├── nomor             -> "A-001"
  ├── loket             -> "A"
  ├── counter           -> 1
  ├── callType          -> "NEXT" | "RECALL" | "RESET" | "INIT"
  └── updatedAt         -> timestamp
```

## Catatan Teknis

- Semua fungsi database ada di `js/app.js` — kalau perlu fungsi baru (misal statistik harian), tambahkan di sini, jangan ditulis ulang di file HTML.
- `js/firebase.js` otomatis mengisi data default (`loket`, `counter`, `current_call`) kalau database masih kosong, jadi tidak perlu setup manual di Firebase Console setiap tahun.
