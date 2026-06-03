import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  update,
  onValue,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ===============================
   FIREBASE CONFIG
================================ */
const firebaseConfig = {
  apiKey: "AIzaSyAW_Wh9ttPQ8vnwgnQFUMMEDC5QqwJe3GQ",
  authDomain: "no-antrean-spmb.firebaseapp.com",
  databaseURL: "https://no-antrean-spmb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "no-antrean-spmb",
  storageBucket: "no-antrean-spmb.firebasestorage.app",
  messagingSenderId: "357121462512",
  appId: "1:3571214628:web:8fd937bc2a8d2a3894b235"
};

/* ===============================
   INIT FIREBASE
================================ */
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ===============================
   DEFAULT STRUCTURE (SOURCE OF TRUTH)
================================ */
export const DEFAULT_DISPLAY = {
  current: {
    loket: "-",
    nomor: 0,
    petugas: "-"
  },

  counters: {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    G: 0,
    H: 0,
    I: 0,
    J: 0
  },

  lastUpdate: Date.now()
};

/* ===============================
   EXPORT CORE FIREBASE
================================ */
export {
  db,
  ref,
  update,
  onValue,
  serverTimestamp
};

/* ===============================
   1. UPDATE DISPLAY (UNTUK OPERATOR)
================================ */
export async function updateDisplay(payload) {
  await update(ref(db, "display"), {
    ...payload,
    lastUpdate: Date.now()
  });
}

/* ===============================
   2. LISTENER DISPLAY (UNTUK INDEX & ADMIN)
================================ */
export function listenDisplay(callback) {
  onValue(ref(db, "display"), (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

/* ===============================
   3. RESET SYSTEM (ADMIN)
================================ */
export async function resetDisplay() {
  await update(ref(db), {
    display: DEFAULT_DISPLAY
  });
}
