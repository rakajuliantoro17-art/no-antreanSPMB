import {
  db,
  ref,
  get,
  set,
  update,
  onValue
} from "./firebase.js";

/* =====================================================
   INIT DEFAULT DATA (JIKA BELUM ADA DI FIREBASE)
===================================================== */
export async function initSystem() {
  const snap = await get(ref(db, "display"));

  if (!snap.exists()) {
    await set(ref(db, "display"), {
      current: {
        loket: "-",
        nomor: 0,
        petugas: "-"
      },
      counters: {
        A: 0, B: 0, C: 0, D: 0, E: 0,
        F: 0, G: 0, H: 0, I: 0, J: 0
      },
      lastUpdate: Date.now()
    });
  }
}

/* =====================================================
   LISTENER REALTIME DISPLAY (INDEX & ADMIN)
===================================================== */
export function listenDisplay(callback) {
  onValue(ref(db, "display"), (snap) => {
    callback(snap.val() || null);
  });
}

/* =====================================================
   GET COUNTER LOKET
===================================================== */
export async function getCounter(loket) {
  const snap = await get(ref(db, `display/counters/${loket}`));
  return snap.exists() ? snap.val() : 0;
}

/* =====================================================
   NEXT NUMBER (CORE SYSTEM)
===================================================== */
export async function nextNumber(loket) {
  const current = await getCounter(loket);
  const next = current + 1;

  await update(ref(db, "display"), {
    current: {
      loket,
      nomor: next,
      petugas: "-"
    },
    [`counters/${loket}`]: next,
    lastUpdate: Date.now()
  });

  return `${loket}-${String(next).padStart(3, "0")}`;
}

/* =====================================================
   RECALL (repeat last call)
===================================================== */
export async function recallNumber(loket, nomor) {
  await update(ref(db, "display/current"), {
    loket,
    nomor,
    petugas: "-"
  });
}

/* =====================================================
   RESET ALL SYSTEM
===================================================== */
export async function resetAll() {
  await set(ref(db, "display"), {
    current: {
      loket: "-",
      nomor: 0,
      petugas: "-"
    },
    counters: {
      A: 0, B: 0, C: 0, D: 0, E: 0,
      F: 0, G: 0, H: 0, I: 0, J: 0
    },
    lastUpdate: Date.now()
  });
}

/* =====================================================
   EXPORT FIREBASE CORE (optional use)
===================================================== */
export {
  db,
  ref,
  get,
  set,
  update,
  onValue
};
