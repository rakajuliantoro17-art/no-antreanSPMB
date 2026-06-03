import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  update,
  onValue,
  get,
  set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyAW_Wh9ttPQ8vnwgnQFUMMEDc5QqwJe3GQ",
  authDomain: "no-antrean-spmb.firebaseapp.com",
  databaseURL: "https://no-antrean-spmb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "no-antrean-spmb",
  storageBucket: "no-antrean-spmb.firebasestorage.app",
  messagingSenderId: "357121462512",
  appId: "1:3571214628:web:8fd937bc2a8d2a3894b235"
};

/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

/* ================= DEFAULT STATE ================= */
export const DEFAULT_DISPLAY = {
  current: {
    loket: "-",
    nomor: 0,
    petugas: "-"
  },
  counters: {
    A: 0, B: 0, C: 0, D: 0, E: 0,
    F: 0, G: 0, H: 0, I: 0, J: 0
  },
  lastUpdate: 0
};

/* ================= INIT CHECK (AUTO CREATE IF EMPTY) ================= */
export async function initSystem() {
  const snap = await get(ref(db, "display"));

  if (!snap.exists()) {
    await set(ref(db, "display"), DEFAULT_DISPLAY);
  }
}

/* ================= UPDATE DISPLAY (SAFE MERGE) ================= */
export async function updateDisplay(payload) {
  await update(ref(db, "display"), {
    ...payload,
    lastUpdate: Date.now()
  });
}

/* ================= LISTENER REALTIME ================= */
export function listenDisplay(callback) {
  onValue(ref(db, "display"), (snapshot) => {
    callback(snapshot.val());
  });
}

/* ================= RESET SYSTEM ================= */
export async function resetDisplay() {
  await set(ref(db, "display"), {
    ...DEFAULT_DISPLAY,
    lastUpdate: Date.now()
  });
}

/* ================= EXPORT CORE ================= */
export {
  ref,
  update,
  onValue,
  get,
  set
};
