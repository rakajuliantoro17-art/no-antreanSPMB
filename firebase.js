import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyAW_Wh9ttPQ8vnwgnQFUMMEDc5QqwJe3GQ",
  authDomain: "no-antrean-spmb.firebaseapp.com",
  databaseURL: "https://no-antrean-spmb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "no-antrean-spmb",
  storageBucket: "no-antrean-spmb.firebasestorage.app",
  messagingSenderId: "357121462512",
  appId: "1:3571214628:web:8fd937bc2a8d2a3894b235"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

/* DEFAULT */
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
  lastUpdate: Date.now()
};

/* UPDATE */
export function updateDisplay(data) {
  return update(ref(db, "display"), {
    ...data,
    lastUpdate: Date.now()
  });
}

/* LISTENER */
export function listenDisplay(cb) {
  onValue(ref(db, "display"), (snap) => {
    cb(snap.val());
  });
}
