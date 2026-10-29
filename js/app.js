// =====================================
// APP.JS — ANTREAN TERPUSAT SPMB
// =====================================
import { db, ref, get, update, onValue, runTransaction } from "./firebase.js";
import { petugas, daftarLoket } from "./config.js";
export { petugas, daftarLoket };

const pad = (n) => String(n).padStart(3, "0");
const ticketId = (n) => `SPMB-${pad(n)}`;

export async function getCurrentCall() {
  const snap = await get(ref(db, "current_call"));
  return snap.exists() ? snap.val() : null;
}
function assertLoket(loket) {
  if (!daftarLoket.includes(loket)) throw new Error("Kode loket tidak valid.");
}

// Nomor antrean global dibuat secara atomik agar tidak ada nomor ganda.
export async function takeTicket() {
  let created = null;
  const result = await runTransaction(ref(db), (raw) => {
    const data = raw || {};
    const next = Number.isSafeInteger(data.queue_meta?.lastIssued) && data.queue_meta.lastIssued >= 0
      ? data.queue_meta.lastIssued + 1 : 1;
    const id = ticketId(next);
    const tickets = { ...(data.tickets || {}) };
    tickets[id] = {
      id, sequence: next, status: "waiting",
      createdAt: Date.now(), loket: null, calledAt: null, completedAt: null
    };
    created = id;
    return { ...data, queue_meta: { ...(data.queue_meta || {}), lastIssued: next }, tickets };
  });
  if (!result.committed) throw new Error("Nomor antrean belum berhasil dibuat. Coba lagi.");
  const latest = result.snapshot.val();
  // Ambil nilai dari snapshot yang benar-benar tersimpan, bukan state lokal.
  return latest.tickets?.[created] ? created : Object.values(latest.tickets || {}).sort((a,b)=>b.sequence-a.sequence)[0]?.id;
}

// Dipakai halaman operator: panggil tiket waiting paling awal ke loket pilihan.
// Transaksi global memastikan dua operator tidak mengambil tiket yang sama.
export async function nextCall(loket) {
  assertLoket(loket);
  const result = await runTransaction(ref(db), (raw) => {
    const data = raw || {};
    const tickets = { ...(data.tickets || {}) };
    const activeByLoket = { ...(data.active_by_loket || {}) };
    const counters = { ...(data.counter || {}) };
    const displays = { ...(data.loket || {}) };

    const priorId = activeByLoket[loket];
    if (priorId && tickets[priorId]?.status === "serving") {
      tickets[priorId] = { ...tickets[priorId], status: "completed", completedAt: Date.now() };
    }
    const next = Object.values(tickets)
      .filter((t) => t && t.status === "waiting")
      .sort((a,b) => a.sequence - b.sequence)[0];
    if (!next) {
      delete activeByLoket[loket];
      displays[loket] = "---";
      return { ...data, tickets, active_by_loket: activeByLoket, counter: counters, loket: displays };
    }
    tickets[next.id] = { ...next, status: "serving", loket, calledAt: Date.now() };
    activeByLoket[loket] = next.id;
    counters[loket] = Number(counters[loket] || 0) + 1;
    displays[loket] = next.id;
    return {
      ...data, tickets, active_by_loket: activeByLoket,
      counter: counters, loket: displays,
      current_call: { nomor: next.id, loket, counter: counters[loket], callType: "NEXT", updatedAt: Date.now() }
    };
  });
  if (!result.committed) throw new Error("Antrean kosong atau panggilan gagal. Periksa koneksi lalu coba lagi.");
  return result.snapshot.val()?.active_by_loket?.[loket] || null;
}

export async function recallCall(loket) {
  const snap = await get(ref(db, "active_by_loket"));
  const active = snap.val() || {};
  const chosen = loket || (await getCurrentCall())?.loket;
  assertLoket(chosen);
  const nomor = active[chosen];
  if (!nomor) throw new Error("Belum ada antrean aktif di loket ini.");
  await update(ref(db), {
    "current_call/nomor": nomor,
    "current_call/loket": chosen,
    "current_call/callType": "RECALL",
    "current_call/updatedAt": Date.now()
  });
  return nomor;
}

export async function getCounter(loket) {
  assertLoket(loket);
  const snap = await get(ref(db, `active_by_loket/${loket}`));
  return snap.val() || "---";
}
export async function setCounter(loket, nomor) {
  assertLoket(loket);
  if (!Number.isSafeInteger(nomor) || nomor < 0) throw new Error("Nomor harus bilangan bulat nonnegatif.");
  await update(ref(db), { [`counter/${loket}`]: nomor });
}
export async function resetLoket(loket) {
  assertLoket(loket);
  throw new Error("Reset per loket dinonaktifkan pada antrean terpusat. Gunakan reset antrean oleh admin.");
}
export async function resetAll() {
  const result = await runTransaction(ref(db), (raw) => {
    const data = raw || {};
    const tickets = {};
    const counterData = {};
    const displayData = {};
    daftarLoket.forEach((k) => { counterData[k] = 0; displayData[k] = "---"; });
    return {
      ...data, tickets: {}, queue_meta: { ...(data.queue_meta || {}), lastIssued: 0 },
      counter: counterData, loket: displayData, active_by_loket: {},
      current_call: { nomor: "---", loket: "-", counter: 0, callType: "RESET", updatedAt: Date.now() }
    };
  });
  if (!result.committed) throw new Error("Reset antrean gagal.");
}
export function listenCurrentCall(callback) {
  onValue(ref(db, "current_call"), (snap) => callback(snap.val()));
}
export function listenLoket(callback) {
  onValue(ref(db, "loket"), (snap) => callback(snap.val()));
}
export function listenTickets(callback) {
  onValue(ref(db, "tickets"), (snap) => callback(snap.val() || {}));
}
export function listenQueueMeta(callback) {
  onValue(ref(db, "queue_meta"), (snap) => callback(snap.val() || { lastIssued: 0 }));
}
export function formatNomor(_loket, nomor) { return String(nomor || "---"); }
export function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang === "id-ID") || voices.find((v) => v.lang.startsWith("id")) || voices[0];
  if (voice) u.voice = voice;
  u.lang = "id-ID"; u.rate = 0.9; u.pitch = 1; u.volume = 1;
  speechSynthesis.cancel();
  setTimeout(() => speechSynthesis.speak(u), 120);
}
export function playSound(path) { new Audio(path).play().catch(() => {}); }
export function initGridPetugas(containerEl) {
  daftarLoket.forEach((k) => {
    const el = document.createElement("div"); el.className = "card"; el.id = "card" + k;
    const meja = document.createElement("div"); meja.className = "meja"; meja.textContent = `MEJA ${k}`;
    const antri = document.createElement("div"); antri.className = "antri"; antri.id = "n" + k; antri.textContent = "---";
    const nama = document.createElement("div"); nama.className = "petugas"; nama.textContent = petugas[k] || "Petugas";
    el.append(meja, antri, nama); containerEl.appendChild(el);
  });
}
export function buildVoiceText(data) {
  const nomor = (data.nomor || "").replace("-", " ");
  const nama = petugas[data.loket] || "petugas layanan";
  return `Perhatian. Nomor antrean ${nomor}. Silakan menuju meja ${data.loket}. Untuk layanan verifikasi S P M B. Dilayani oleh ${nama}. Terima kasih.`;
}
