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


// CONFIG FIREBASE
const firebaseConfig = {

  apiKey: "ISI_API_KEY",

  authDomain: "ISI_PROJECT.firebaseapp.com",

  databaseURL: "https://ISI_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "ISI_PROJECT",

  storageBucket: "ISI_PROJECT.appspot.com",

  messagingSenderId: "ISI_SENDER_ID",

  appId: "ISI_APP_ID"
};


// INITIALIZE
const app = initializeApp(firebaseConfig);

// DATABASE
const db = getDatabase(app);


// EXPORT
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
