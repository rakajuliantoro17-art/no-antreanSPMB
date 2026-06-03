```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  push,
  remove,
  onValue,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ===============================
   FIREBASE CONFIG
================================ */

const firebaseConfig = {
  apiKey: "AIzaSyAW_Wh9ttPQ8vnwgnQFUMMEDc5QqwJe3GQ",
  authDomain: "no-antrean-spmb.firebaseapp.com",
  databaseURL: "https://no-antrean-spmb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "no-antrean-spmb",
  storageBucket: "no-antrean-spmb.firebasestorage.app",
  messagingSenderId: "357121462512",
  appId: "1:3571214628:web:8fd937bc2a8d2a3894b235"
};

/* ===============================
   INIT APP
================================ */

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

/* ===============================
   DEFAULT LOKET
================================ */

export const DEFAULT_LOKET = {
  A: "000",
  B: "000",
  C: "000",
  D: "000",
  E: "000",
  F: "000",
  G: "000",
  H: "000",
  I: "000",
  J: "000"
};

/* ===============================
   PETUGAS
================================ */

export const PETUGAS = {

  A: "Bapak Rahmad",
  B: "Bapak Bayu",
  C: "Bapak Sunariyadi",
  D: "Ibu Tasya",
  E: "Ibu Eva",

  F: "Bapak Mujib",
  G: "Ibu Ria",
  H: "Bapak Raka",
  I: "Bapak Chozin",
  J: "Ibu Ita"

};

/* ===============================
   EXPORT FIREBASE CORE
================================ */

export {
  db,
  ref,
  set,
  get,
  update,
  push,
  remove,
  onValue,
  serverTimestamp
};

/* ===============================
   HELPER
================================ */

/*
Update current call
*/

export async function updateCurrentCall(
  nomor,
  callType = "NEXT"
){

  await update(ref(db),{

    "current_call/nomor":
      nomor,

    "current_call/callType":
      callType,

    "current_call/time":
      Date.now()

  });

}

/*
Update nomor loket
*/

export async function updateLoket(
  loket,
  nomor
){

  await update(ref(db),{

    [`loket/${loket}`]:
      nomor

  });

}

/*
Update status loket
*/

export async function updateLoketStatus(
  loket,
  status
){

  await update(ref(db),{

    [`status/${loket}`]:
      status

  });

}

/*
Reset semua loket
*/

export async function resetLoket(){

  await update(ref(db),{

    "loket": DEFAULT_LOKET

  });

}

/*
Reset current call
*/

export async function resetCurrentCall(){

  await update(ref(db),{

    "current_call/nomor":"---",

    "current_call/callType":"RESET"

  });

}

/*
Reset sistem penuh
*/

export async function resetAll(){

  await update(ref(db),{

    "loket": DEFAULT_LOKET,

    "current_call":{

      nomor:"---",

      callType:"RESET",

      time:Date.now()

    }

  });

}
```
