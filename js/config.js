// =====================================
// CONFIG.JS
// SATU-SATUNYA TEMPAT UNTUK GANTI DATA
// TIAP TAHUN AJARAN BARU
// =====================================
//
// Cara pakai tahun depan:
// 1. Ganti TAHUN_AJARAN
// 2. Ganti nama-nama di object `petugas` (key A-J = loket,
//    boleh tambah/kurang loket asal konsisten dengan jumlah
//    meja fisik yang tersedia)
// 3. Simpan file ini. index.html, operator.html, admin.html,
//    dan app.js otomatis ikut berubah karena semua import dari sini.

export const TAHUN_AJARAN = "2026/2027";

export const NAMA_INSTANSI = "SMAN 1 SOOKO";

export const petugas = {
  A: "Bapak Rahmad",
  B: "Bapak Bayu",
  C: "Bapak Sunariyadi",
  D: "Ibu Tasya",
  E: "Ibu Eva",
  F: "Bapak Mujib",
  G: "Ibu Ria",
  H: "Bapak Raka",
  I: "Bapak Chozin",
  J: "Ibu Ita",
};

// Daftar kode loket, diturunkan otomatis dari `petugas`
// supaya tidak perlu ditulis manual di tempat lain.
export const daftarLoket = Object.keys(petugas);
