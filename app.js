```javascript
import {
  ref,
  onValue,
  set,
  get,
  update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  db
} from "./firebase.js";

/* =====================================
   CURRENT CALL
===================================== */

export function listenCall(callback){

  onValue(
    ref(db,"current_call"),
    snap=>{

      callback(
        snap.val()
      );

    }
  );

}

export function setCall(data){

  return set(
    ref(db,"current_call"),
    data
  );

}

/* =====================================
   COUNTER PER LOKET
===================================== */

export async function getCounter(loket){

  const snap =
  await get(
    ref(db,"counter/"+loket)
  );

  return snap.exists()
    ? snap.val()
    : 0;

}

export function setCounter(
  loket,
  value
){

  return set(
    ref(db,"counter/"+loket),
    value
  );

}

/* =====================================
   LOKET DISPLAY
===================================== */

export async function updateLoketDisplay(
  loket,
  nomor
){

  return update(
    ref(db),
    {
      [`loket/${loket}`]:
      nomor
    }
  );

}

export function listenLoket(callback){

  onValue(
    ref(db,"loket"),
    snap=>{

      callback(
        snap.val() || {}
      );

    }
  );

}

/* =====================================
   STATUS LOKET
===================================== */

export async function setStatus(
  loket,
  status
){

  return update(
    ref(db),
    {
      [`status/${loket}`]:
      status
    }
  );

}

export function listenStatus(callback){

  onValue(
    ref(db,"status"),
    snap=>{

      callback(
        snap.val() || {}
      );

    }
  );

}

/* =====================================
   NEXT NUMBER
===================================== */

export async function nextNumber(
  loket
){

  let current =
    await getCounter(loket);

  current++;

  await setCounter(
    loket,
    current
  );

  const nomor =
    `${loket}-${String(current)
      .padStart(3,'0')}`;

  await setCall({

    nomor,

    callType:"NEXT",

    time:Date.now()

  });

  await updateLoketDisplay(
    loket,
    String(current)
      .padStart(3,'0')
  );

  return nomor;

}

/* =====================================
   RECALL
===================================== */

export async function recallNumber(
  nomor
){

  await setCall({

    nomor,

    callType:"RECALL",

    time:Date.now()

  });

}

/* =====================================
   RESET
===================================== */

export async function resetAll(){

  const loket = {

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

  await update(
    ref(db),
    {

      loket,

      counter:{
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
      },

      current_call:{
        nomor:"---",
        callType:"RESET",
        time:Date.now()
      }

    }
  );

}
```
