// =====================================
// APP.JS
// HELPER ANTREAN SPMB
// =====================================

import { db, ref, set, get, update, onValue } from "./firebase.js";
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

export async function getCounter(loket) {
  const snap = await get(ref(db, `counter/${loket}`));
  return snap.exists() ? snap.val() : 0;
}

// =====================================
// SET COUNTER
// =====================================

export async function setCounter(loket, nomor) {
  await update(ref(db), {
    [`counter/${loket}`]: nomor,
    [`loket/${loket}`]: String(nomor).padStart(3, "0"),
  });
}

// =====================================
// NEXT ANTREAN
// =====================================

export async function nextCall(loket) {
  let counter = await getCounter(loket);
  counter++;

  const nomor = `${loket}-${String(counter).padStart(3, "0")}`;

  await update(ref(db), {
    "current_call/nomor": nomor,
    "current_call/loket": loket,
    "current_call/counter": counter,
    "current_call/callType": "NEXT",
    "current_call/updatedAt": Date.now(),
    [`counter/${loket}`]: counter,
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

  await set(ref(db, "counter"), counterData);
  await set(ref(db, "loket"), displayData);
  await set(ref(db, "current_call"), {
    nomor: "---",
    loket: "-",
    counter: 0,
    callType: "RESET",
    updatedAt: Date.now(),
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
    el.innerHTML = `
      <div class="meja">MEJA ${k}</div>
      <div class="antri" id="n${k}">000</div>
      <div class="petugas">${petugas[k]}</div>
    `;
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
