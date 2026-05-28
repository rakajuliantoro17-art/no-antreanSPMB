// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// Firebase Config
const firebaseConfig = {

  apiKey: "AIzaSyAW_Wh9ttPQ8vnwgnQFUMMEDc5QqwJe3GQ",

  authDomain: "no-antrean-spmb.firebaseapp.com",

  databaseURL: "https://no-antrean-spmb-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "no-antrean-spmb",

  storageBucket: "no-antrean-spmb.firebasestorage.app",

  messagingSenderId: "357121462512",

  appId: "1:357121462512:web:8fd937bc2a8d2a3894b235"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Database
const db = getDatabase(app);


// Export
export {
  db,
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue
};
