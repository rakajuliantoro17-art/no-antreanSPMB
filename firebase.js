import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ================= CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyAW_Wh9ttPQ8vnwgnQFUMMEDc5QqwJe3GQ",
  authDomain: "no-antrean-spmb.firebaseapp.com",
  databaseURL: "https://no-antrean-spmb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "no-antrean-spmb",
  storageBucket: "no-antrean-spmb.firebasestorage.app",
  messagingSenderId: "357121462512",
  appId: "1:3571214628:web:8fd937bc2a8d2a3894b235"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================= CORE EXPORT =================
export {
  db,
  ref,
  set,
  get,
  update,
  onValue
};
