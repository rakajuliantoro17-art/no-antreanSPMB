// ==========================================
// FIREBASE.JS
// KONEKSI & INISIALISASI DATABASE
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase, ref, set, get, update, push, remove, onValue,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import { daftarLoket } from "./config.js";

// ==========================================
// FIREBASE CONFIG
// Satu-satunya tempat config Firebase ditulis.
// Jangan copy config ini ke file lain — import
// `db` dari file ini saja.
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyAW_Wh9ttPQ8vnwgnQFUMMEDc5QqwJe3GQ",
  authDomain: "no-antrean-spmb.firebaseapp.com",
  databaseURL: "https://no-antrean-spmb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "no-antrean-spmb",
  storageBucket: "no-antrean-spmb.firebasestorage.app",
  messagingSenderId: "357121462512",
  appId: "1:3571214628:web:8fd937bc2a8d2a3894b235",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// AUTO INIT DATABASE
// Dibuat dari daftarLoket (config.js) supaya
// otomatis ikut kalau jumlah loket berubah.
// ==========================================

function buildDefaultLoket() {
  const out = {};
  daftarLoket.forEach((k) => { out[k] = "000"; });
  return out;
}

function buildDefaultCounter() {
  const out = {};
  daftarLoket.forEach((k) => { out[k] = 0; });
  return out;
}

async function initDatabase() {
  try {
    const loketSnap = await get(ref(db, "loket"));
    if (!loketSnap.exists()) {
      await set(ref(db, "loket"), buildDefaultLoket());
      console.log("Loket initialized");
    }

    const counterSnap = await get(ref(db, "counter"));
    if (!counterSnap.exists()) {
      await set(ref(db, "counter"), buildDefaultCounter());
      console.log("Counter initialized");
    }

    const currentCallSnap = await get(ref(db, "current_call"));
    if (!currentCallSnap.exists()) {
      await set(ref(db, "current_call"), {
        nomor: "---",
        loket: "-",
        counter: 0,
        callType: "INIT",
        updatedAt: Date.now(),
      });
      console.log("Current call initialized");
    }
  } catch (err) {
    console.error("Firebase Init Error:", err);
  }
}

initDatabase();

// ==========================================
// EXPORT
// ==========================================

export { db, ref, set, get, update, push, remove, onValue };
