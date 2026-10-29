// =====================================
// APP.JS
// HELPER ANTREAN SPMB
// =====================================

import { db, ref, set, get, update, onValue, runTransaction } from "./firebase.js";
import { petugas, daftarLoket } from "./config.js";

// Diekspor ulang supaya file lain (index.html, operator.html,
// admin.html) hanya perlu import dari app.js, tidak perlu tahu
// soal config.js secara langsung.
export { petugas, daftarLoket };

// =====================================
// GET CURRENT CALL
// =====================================

export async function getCurrentCall() {
  const snap = await get(ref(db, "current_call"));
  return snap.exists() ? snap.val() : null;
}

// =====================================
// GET COUNTER LOKET
// =====================================

function assertLoket(loket) {
  if (!daftarLoket.includes(loket)) {
    throw new Error("Kode loket tidak valid.");
  }
}

export async function getCounter(loket) {
  assertLoket(loket);
  const snap = await get(ref(db, `counter/${loket}`));
  const value = snap.exists() ? snap.val() : 0;
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

// =====================================
// SET COUNTER
// =====================================

export async function setCounter(loket, nomor) {
  assertLoket(loket);
  if (!Number.isSafeInteger(nomor) || nomor < 0) {
    throw new Error("Nomor antrean harus berupa bilangan bulat nonnegatif.");
  }
  await update(ref(db), {
    [`counter/${loket}`]: nomor,
    [`loket/${loket}`]: String(nomor).padStart(3, "0"),
  });
}

// =====================================
// NEXT ANTREAN
// =====================================

export async function nextCall(loket) {
  assertLoket(loket);

  // Transaction atomik mencegah dua operator membaca counter lama
  // lalu menghasilkan nomor antrean yang sama pada loket yang sama.
  const result = await runTransaction(ref(db, `counter/${loket}`), (current) => {
    const value = Number.isSafeInteger(current) && current >= 0 ? current : 0;
    return value + 1;
  });

  if (!result.committed) {
    throw new Error("Nomor antrean gagal diperbarui. Silakan coba lagi.");
  }

  const counter = result.snapshot.val();
  const nomor = `${loket}-${String(counter).padStart(3, "0")}`;

  await update(ref(db), {
    "current_call/nomor": nomor,
    "current_call/loket": loket,
    "current_call/counter": counter,
    "current_call/callType": "NEXT",
    "current_call/updatedAt": Date.now(),
    [`loket/${loket}`]: String(counter).padStart(3, "0"),
  });

  return nomor;
}

// =====================================
// RECALL
// =====================================

export async function recallCall() {
  const current = await getCurrentCall();
  if (!current) return;

  await update(ref(db), {
    "current_call/callType": "RECALL",
    "current_call/updatedAt": Date.now(),
  });
}

// =====================================
// RESET SATU LOKET
// =====================================

export async function resetLoket(loket) {
  assertLoket(loket);
  await update(ref(db), {
    [`counter/${loket}`]: 0,
    [`loket/${loket}`]: "000",
  });
}

// =====================================
// RESET SEMUA
// Dibangun dari daftarLoket (config.js), jadi otomatis
// menyesuaikan kalau jumlah loket berubah tahun depan.
// =====================================

export async function resetAll() {
  const counterData = {};
  const displayData = {};

  daftarLoket.forEach((k) => {
    counterData[k] = 0;
    displayData[k] = "000";
  });

  // Satu multi-location update menghindari keadaan setengah-reset
  // jika salah satu penulisan terpisah gagal.
  await update(ref(db), {
    counter: counterData,
    loket: displayData,
    current_call: {
      nomor: "---",
      loket: "-",
      counter: 0,
      callType: "RESET",
      updatedAt: Date.now(),
    },
  });
}

// =====================================
// LISTENER CURRENT CALL
// =====================================

export function listenCurrentCall(callback) {
  onValue(ref(db, "current_call"), (snap) => {
    callback(snap.val());
  });
}

// =====================================
// LISTENER SEMUA LOKET
// =====================================

export function listenLoket(callback) {
  onValue(ref(db, "loket"), (snap) => {
    callback(snap.val());
  });
}

// =====================================
// FORMAT NOMOR
// (FIX: sebelumnya `return` terpisah baris dari nilainya,
// sehingga kena Automatic Semicolon Insertion dan selalu
// mengembalikan `undefined`. Sekarang dalam satu baris.)
// =====================================

export function formatNomor(loket, nomor) {
  return `${loket}-${String(nomor).padStart(3, "0")}`;
}

// =====================================
// TEXT TO SPEECH
// =====================================

export function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();

  const voice =
    voices.find((v) => v.lang === "id-ID") ||
    voices.find((v) => v.lang.startsWith("id")) ||
    voices[0];

  if (voice) u.voice = voice;

  u.lang = "id-ID";
  u.rate = 0.9;
  u.pitch = 1.0;
  u.volume = 1;

  speechSynthesis.cancel();
  setTimeout(() => {
    speechSynthesis.speak(u);
  }, 120);
}

// =====================================
// PLAY SOUND
// =====================================

export function playSound(path) {
  new Audio(path).play().catch(() => {});
}

// =====================================
// BUILD GRID KARTU LOKET (dipakai index.html)
// Dibangun dari `petugas` (config.js) supaya jumlah
// dan urutan loket otomatis konsisten di semua halaman.
// =====================================

export function initGridPetugas(containerEl) {
  daftarLoket.forEach((k) => {
    const el = document.createElement("div");
    el.className = "card";
    el.id = "card" + k;

    const meja = document.createElement("div");
    meja.className = "meja";
    meja.textContent = `MEJA ${k}`;

    const antri = document.createElement("div");
    antri.className = "antri";
    antri.id = "n" + k;
    antri.textContent = "000";

    const namaPetugas = document.createElement("div");
    namaPetugas.className = "petugas";
    namaPetugas.textContent = petugas[k] || "Petugas";

    el.append(meja, antri, namaPetugas);
    containerEl.appendChild(el);
  });
}

// =====================================
// BUILD TEKS SUARA PANGGILAN (dipakai index.html)
// =====================================

export function buildVoiceText(data) {
  const nomor = (data.nomor || "").replace("-", " ");
  const nama = petugas[data.loket] || "petugas layanan";

  return `
    Perhatian.
    Nomor antrean ${nomor}.
    Silakan menuju meja ${data.loket}.
    Untuk layanan verifikasi S P M B.
    Dilayani oleh ${nama}.
    Terima kasih.
  `;
}
