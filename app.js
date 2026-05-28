import { ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { db } from "./firebase.js";

// ================= CURRENT CALL =================
export function listenCall(callback){
  onValue(ref(db, "current_call"), (snap)=>{
    callback(snap.val());
  });
}

// ================= SET CALL =================
export function setCall(data){
  return set(ref(db, "current_call"), data);
}

// ================= GET COUNTER =================
export async function getCounter(loket){
  const snap = await get(ref(db, "counter/" + loket));
  return snap.exists() ? snap.val() : 0;
}

// ================= SET COUNTER =================
export function setCounter(loket, value){
  return set(ref(db, "counter/" + loket), value);
}
