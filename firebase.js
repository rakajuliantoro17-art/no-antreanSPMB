// ==========================================
// FIREBASE SPMB ANTREAN 2026
// ==========================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

  getDatabase,
  ref,
  set,
  get,
  update,
  push,
  remove,
  onValue

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

  apiKey: "AIzaSyAW_Wh9ttPQ8vnwgnQFUMMEDc5QqwJe3GQ",

  authDomain:
  "no-antrean-spmb.firebaseapp.com",

  databaseURL:
  "https://no-antrean-spmb-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
  "no-antrean-spmb",

  storageBucket:
  "no-antrean-spmb.firebasestorage.app",

  messagingSenderId:
  "357121462512",

  appId:
  "1:3571214628:web:8fd937bc2a8d2a3894b235"

};

// ==========================================
// INIT APP
// ==========================================

const app =
  initializeApp(firebaseConfig);

const db =
  getDatabase(app);

// ==========================================
// DEFAULT DATA
// ==========================================

const defaultLoket = {

  A:"000",
  B:"000",
  C:"000",
  D:"000",
  E:"000",

  F:"000",
  G:"000",
  H:"000",
  I:"000",
  J:"000"

};

const defaultCounter = {

  A:0,
  B:0,
  C:0,
  D:0,
  E:0,

  F:0,
  G:0,
  H:0,
  I:0,
  J:0

};

// ==========================================
// AUTO INIT DATABASE
// ==========================================

async function initDatabase(){

  try{

    const loketSnap =
      await get(
        ref(db,"loket")
      );

    if(!loketSnap.exists()){

      await set(
        ref(db,"loket"),
        defaultLoket
      );

      console.log(
        "Loket initialized"
      );

    }

    const counterSnap =
      await get(
        ref(db,"counter")
      );

    if(!counterSnap.exists()){

      await set(
        ref(db,"counter"),
        defaultCounter
      );

      console.log(
        "Counter initialized"
      );

    }

    const currentCallSnap =
      await get(
        ref(db,"current_call")
      );

    if(!currentCallSnap.exists()){

      await set(
        ref(db,"current_call"),
        {

          nomor:"---",
          loket:"-",
          counter:0,
          callType:"INIT",
          updatedAt:Date.now()

        }
      );

      console.log(
        "Current call initialized"
      );

    }

  }
  catch(err){

    console.error(
      "Firebase Init Error:",
      err
    );

  }

}

initDatabase();

// ==========================================
// EXPORT
// ==========================================

export {

  db,

  ref,
  set,
  get,
  update,
  push,
  remove,
  onValue

};
