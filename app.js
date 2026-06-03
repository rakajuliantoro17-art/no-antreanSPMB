// =====================================
// APP.JS
// HELPER ANTREAN SPMB 2026
// =====================================

import {

  db,
  ref,
  set,
  get,
  update,
  onValue

} from "./firebase.js";

// =====================================
// DATA PETUGAS
// =====================================

export const petugas = {

  A:"Bapak Rahmad",
  B:"Bapak Bayu",
  C:"Bapak Sunariyadi",
  D:"Ibu Tasya",
  E:"Ibu Eva",

  F:"Bapak Mujib",
  G:"Ibu Ria",
  H:"Bapak Raka",
  I:"Bapak Chozin",
  J:"Ibu Ita"

};

// =====================================
// GET CURRENT CALL
// =====================================

export async function getCurrentCall(){

  const snap =
    await get(
      ref(db,"current_call")
    );

  return snap.exists()
    ? snap.val()
    : null;

}

// =====================================
// GET COUNTER LOKET
// =====================================

export async function getCounter(loket){

  const snap =
    await get(
      ref(db,`counter/${loket}`)
    );

  return snap.exists()
    ? snap.val()
    : 0;

}

// =====================================
// SET COUNTER
// =====================================

export async function setCounter(
  loket,
  nomor
){

  await update(
    ref(db),
    {

      [`counter/${loket}`]:
        nomor,

      [`loket/${loket}`]:
        String(nomor)
        .padStart(3,"0")

    }
  );

}

// =====================================
// NEXT ANTREAN
// =====================================

export async function nextCall(
  loket
){

  let counter =
    await getCounter(loket);

  counter++;

  const nomor =

  `${loket}-${String(counter)
  .padStart(3,"0")}`;

  await update(
    ref(db),
    {

      "current_call/nomor":
        nomor,

      "current_call/loket":
        loket,

      "current_call/counter":
        counter,

      "current_call/callType":
        "NEXT",

      "current_call/updatedAt":
        Date.now(),

      [`counter/${loket}`]:
        counter,

      [`loket/${loket}`]:
        String(counter)
        .padStart(3,"0")

    }
  );

  return nomor;

}

// =====================================
// RECALL
// =====================================

export async function recallCall(){

  const current =
    await getCurrentCall();

  if(!current) return;

  await update(
    ref(db),
    {

      "current_call/callType":
        "RECALL",

      "current_call/updatedAt":
        Date.now()

    }
  );

}

// =====================================
// RESET SATU LOKET
// =====================================

export async function resetLoket(
  loket
){

  await update(
    ref(db),
    {

      [`counter/${loket}`]:
        0,

      [`loket/${loket}`]:
        "000"

    }
  );

}

// =====================================
// RESET SEMUA
// =====================================

export async function resetAll(){

  const data = {

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

  const display = {

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

  await set(
    ref(db,"counter"),
    data
  );

  await set(
    ref(db,"loket"),
    display
  );

  await set(
    ref(db,"current_call"),
    {

      nomor:"---",
      loket:"-",
      counter:0,
      callType:"RESET",
      updatedAt:Date.now()

    }
  );

}

// =====================================
// LISTENER CURRENT CALL
// =====================================

export function listenCurrentCall(
  callback
){

  onValue(
    ref(db,"current_call"),
    snap=>{

      callback(
        snap.val()
      );

    }
  );

}

// =====================================
// LISTENER SEMUA LOKET
// =====================================

export function listenLoket(
  callback
){

  onValue(
    ref(db,"loket"),
    snap=>{

      callback(
        snap.val()
      );

    }
  );

}

// =====================================
// FORMAT NOMOR
// =====================================

export function formatNomor(
  loket,
  nomor
){

  return
  `${loket}-${String(nomor)
  .padStart(3,"0")}`;

}

// =====================================
// TEXT TO SPEECH
// =====================================

export function speak(text){

  const u =
    new SpeechSynthesisUtterance(
      text
    );

  const voices =
    speechSynthesis.getVoices();

  const voice =

    voices.find(
      v=>v.lang==="id-ID"
    ) ||

    voices.find(
      v=>v.lang.startsWith("id")
    ) ||

    voices[0];

  if(voice)
    u.voice = voice;

  u.lang="id-ID";
  u.rate=0.9;
  u.pitch=1.0;
  u.volume=1;

  speechSynthesis.cancel();

  setTimeout(()=>{

    speechSynthesis.speak(u);

  },120);

}

// =====================================
// PLAY SOUND
// =====================================

export function playSound(path){

  new Audio(path)
    .play()
    .catch(()=>{});

}
